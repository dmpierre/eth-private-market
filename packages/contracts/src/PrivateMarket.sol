// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import './PrivateMarketLib.sol';
import {Counters} from 'openzeppelin/utils/Counters.sol';
import {Verifier as SellEdDSASigVerifier} from './verifiers/VerifierSellSigEdDSA.sol';
import {Verifier as SellECDSANoECDHVerifier} from './verifiers/VerifierSellPrivKeyECDSANoECDH.sol';
import {Verifier as SellECDSAECDHVerifier} from './verifiers/VerifierSellPrivKeyECDSAECDH.sol';
import {Verifier as SellSigMerkleGroth16Verifier} from './verifiers/VerifierVerifyAndEncryptSigMerkleProof.sol';

contract PrivateMarket {
    Counters.Counter public asksCounter;
    Counters.Counter public bidsCounter;
    Counters.Counter public fillsCounter;

    SellEdDSASigVerifier public sellEdDSASigVerifier;
    SellECDSANoECDHVerifier public sellECDSANoECDH;
    SellECDSAECDHVerifier public sellECDSAECDH;
    SellSigMerkleGroth16Verifier public sellSigMerkleGroth16Verifier;

    mapping(uint256 => Market.Ask) public asks;
    mapping(uint256 => Market.Bid) public bids;

    event Ask(address, uint256, uint256, uint256);
    event AskCancelled(uint256);
    event Order(address, uint256, uint256);
    event OrderCancelled(uint256, uint256);
    event OrderAccepted(uint256, uint256);
    event Bid(address, uint256, uint256, address, uint256);
    event BidCancelled(uint256);
    event Fill(address, uint256);

    // a getter to retrive the pubkey for a particular bidId
    function getBidPubKey(uint256 bidId)
        public
        view
        returns (uint256[2] memory)
    {
        return bids[bidId].fromPubKey;
    }

    // a getter to retrive the pubkey for a particular askId
    function getAskPubKey(uint256 askId)
        public
        view
        returns (uint256[2] memory)
    {
        return asks[askId].fromPubKey;
    }

    // a getter to retrieve all the orders for a particular askId
    function getOrdersForAskId(uint256 askId)
        public
        view
        returns (Market.Order[] memory)
    {
        uint256 nOrders = Counters.current(asks[askId].ordersCounter);
        Market.Order[] memory orders = new Market.Order[](
            nOrders
        );
        for (uint256 i = 0; i < nOrders; i++) {
            orders[i] = asks[askId].orders[i];
        }
        return orders;
    }

    // a getter to retrieve the number of orders for a particular askId
    function getNOrdersForAskId(uint256 askId) public view returns (uint256) {
        return Counters.current(asks[askId].ordersCounter);
    }

    modifier onlyAsker(uint256 askId, address asker) {
        require(asks[askId].from == asker, 'Only asker method');
        _;
    }

    modifier onlyNonZeroPrice(uint256 price) {
        require(price != 0, 'Price cannot be 0');
        _;
    }

    modifier onlyOrderer(
        uint256 askId,
        uint256 orderId,
        address orderer
    ) {
        require(
            asks[askId].orders[orderId].from == orderer,
            'Only orderer method'
        );
        _;
    }

    modifier onlyBidder(uint256 bidId, address bidder) {
        require(bids[bidId].from == bidder, 'Only bidder method');
        _;
    }

    modifier askIsActive(uint256 askId) {
        require(asks[askId].status == 1, 'Ask is not active');
        _;
    }

    modifier orderIsActive(uint256 askId, uint256 orderId) {
        require(asks[askId].orders[orderId].status == 1, 'Order is not active');
        _;
    }

    modifier bidIsActive(uint256 bidId) {
        require(bids[bidId].status == 1, 'Bid is not active');
        _;
    }

    uint256 public cancelBlockTime;

    constructor(uint256 _cancelBlockTime) {
        sellEdDSASigVerifier = new SellEdDSASigVerifier();
        sellECDSANoECDH = new SellECDSANoECDHVerifier();
        sellECDSAECDH = new SellECDSAECDHVerifier();
        sellSigMerkleGroth16Verifier = new SellSigMerkleGroth16Verifier();
        cancelBlockTime = _cancelBlockTime;
    }

    /** @dev User creates an ask for a groth16 proof, at a specific price for a specific vkey and group root.
     * @param price The price of the signature
     * @param vkeyHash The hash of the verification key
     * @param root The root of the merkle tree for which the user wants a proof
     * @param pubKey The public key of the asker
     */
    function askSigMerkleGroth16Proof(
        uint256 price,
        uint256 vkeyHash,
        uint256 root,
        uint256[2] memory pubKey
    ) public onlyNonZeroPrice(price) {
        Market.Groth16SigMerkleProof memory proof = Market
            .Groth16SigMerkleProof(price, vkeyHash, root);
        uint256 currentAsk = Counters.current(asksCounter);
        uint256 cancelBlock = Market.getCancelBlock(cancelBlockTime);

        asks[currentAsk].id = currentAsk;
        asks[currentAsk].from = msg.sender;
        asks[currentAsk].status = 1;
        asks[currentAsk].fromPubKey = pubKey;
        asks[currentAsk].groth16proof = proof;
        asks[currentAsk].cancelBlock = cancelBlock;

        emit Ask(msg.sender, currentAsk, price, cancelBlock);
        Counters.increment(asksCounter);
    }

    /** @dev User creates an order for a groth16 proof, at a specific price for a specific vkey and group root.
     * @param askId The id of the ask
     * @param messageHash The hash of the message to be signed. This message could will later be posted on chain
     * @param sharedKeyCommitment The commitment to the shared key
     * @param pubKey The public key of the user
     * @param poseidonNonce The nonce used for the proof's poseidon encryption
     */
    function orderSigMerkleGroth16Proof(
        uint256 askId,
        uint64[4] memory messageHash,
        uint256 sharedKeyCommitment,
        uint256[2] memory pubKey,
        uint256 poseidonNonce
    ) public payable askIsActive(askId) {
        require(
            asks[askId].groth16proof.price == msg.value,
            'Price is not correct'
        );
        uint256 currentOrder = Counters.current(asks[askId].ordersCounter);

        Market.OrderedGroth16SigMerkleProof memory orderedProof;
        orderedProof.messageHash = messageHash;

        Market.Order memory newOrder;

        newOrder.id = currentOrder;
        newOrder.askId = askId;
        newOrder.status = 1;
        newOrder.sharedKeyCommitment = sharedKeyCommitment;
        newOrder.fromPubKey = pubKey;
        newOrder.poseidonNonce = poseidonNonce;
        newOrder.cancelBlock = Market.getCancelBlock(cancelBlockTime);
        newOrder.orderedGroth16SigMerkleProof = orderedProof;
        newOrder.from = msg.sender;

        asks[askId].orders[currentOrder] = newOrder;
        emit Order(msg.sender, askId, currentOrder);
        Counters.increment(asks[askId].ordersCounter);
    }

    function acceptOrderSigMerkleGroth16Proof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[57] memory input,
        uint256 askId,
        uint256 orderId
    ) public orderIsActive(askId, orderId) onlyAsker(askId, msg.sender) {
        require(
            sellSigMerkleGroth16Verifier.verifyProof(a, b, c, input),
            'Could not verify proof'
        );
        require(
            input[0] == asks[askId].groth16proof.vKeyhash,
            'Vkey hash is not correct'
        );
        require(
            input[1] == asks[askId].groth16proof.groupRoot,
            'Group root is not correct'
        );
        require(
            input[2] ==
                asks[askId]
                    .orders[orderId]
                    .orderedGroth16SigMerkleProof
                    .messageHash[0],
            'Message hash is not correct'
        );
        require(
            input[3] ==
                asks[askId]
                    .orders[orderId]
                    .orderedGroth16SigMerkleProof
                    .messageHash[1],
            'Message hash is not correct'
        );
        require(
            input[4] ==
                asks[askId]
                    .orders[orderId]
                    .orderedGroth16SigMerkleProof
                    .messageHash[2],
            'Message hash is not correct'
        );
        require(
            input[5] ==
                asks[askId]
                    .orders[orderId]
                    .orderedGroth16SigMerkleProof
                    .messageHash[3],
            'Message hash is not correct'
        );
        require(
            input[55] == asks[askId].orders[orderId].poseidonNonce,
            'Incorrect nonce'
        );
        require(
            input[56] == asks[askId].orders[orderId].sharedKeyCommitment,
            'Shared key commitment is not correct'
        );

        // elements 6 to 54 included are the encrypted proof.
        for (uint8 i = 6; i < 55; i++) {
            asks[askId]
                .orders[orderId]
                .orderedGroth16SigMerkleProof
                .encryptedProof[i - 6] = input[i];
        }

        asks[askId].orders[orderId].status = 0;
        payable(asks[askId].from).transfer(asks[askId].groth16proof.price);
        emit OrderAccepted(askId, orderId);
    }

    /** @dev User creates an ask for a signature, at a specific price for a specific signing key.
     * @param price The price of the signature
     * @param signingKey The signing key. Can be the signing of some centralized service, e.g. a subscription service
     * @param pubKey The public key of the asker
     */
    function askSignature(
        uint256 price,
        uint256[2] memory signingKey,
        uint256[2] memory pubKey
    ) public onlyNonZeroPrice(price) {
        Market.Signature memory sig = Market.Signature(price, signingKey);

        uint256 currentAsk = Counters.current(asksCounter);
        uint256 cancelBlock = Market.getCancelBlock(cancelBlockTime);

        asks[currentAsk].id = currentAsk;
        asks[currentAsk].from = msg.sender;
        asks[currentAsk].status = 1;
        asks[currentAsk].fromPubKey = pubKey;
        asks[currentAsk].signature = sig;
        asks[currentAsk].cancelBlock = cancelBlock;

        emit Ask(msg.sender, currentAsk, price, cancelBlock);
        Counters.increment(asksCounter);
    }

    /** @dev User creates an order for a signature, at a specific price for a specific signing key.
     * @param askId The id of the ask
     * @param messagePreImage The preimage of the message to be signed. This can be a public key point.
     * @param message The message to be signed. This message could will later be posted on chain
     * @param sharedKeyCommitment The commitment to the shared key
     * @param pubKey The public key of the user
     * @param poseidonNonce The nonce used for the proof's poseidon encryption
     */
    function orderSignature(
        uint256 askId,
        uint256[2] memory messagePreImage,
        uint256 message,
        uint256 sharedKeyCommitment,
        uint256[2] memory pubKey,
        uint256 poseidonNonce
    ) public payable askIsActive(askId) {
        require(
            asks[askId].signature.price == msg.value,
            'Price is not correct'
        );
        uint256 currentOrder = Counters.current(asks[askId].ordersCounter);


        Market.OrderedSignature memory orderedSig;
        orderedSig.message = message;
        orderedSig.messagePreImage = messagePreImage;

        Market.Order memory newOrder;

        newOrder.id = currentOrder;
        newOrder.status = 1;
        newOrder.askId = askId;
        newOrder.orderType = 1;
        newOrder.sharedKeyCommitment = sharedKeyCommitment;
        newOrder.fromPubKey = pubKey;
        newOrder.poseidonNonce = poseidonNonce;
        newOrder.cancelBlock = Market.getCancelBlock(cancelBlockTime);
        newOrder.orderedSignature = orderedSig;
        newOrder.from = msg.sender;

        asks[askId].orders[currentOrder] = newOrder;
        emit Order(msg.sender, askId, currentOrder);
        Counters.increment(asks[askId].ordersCounter);

    }

    function acceptOrderSignature(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[11] memory input,
        uint256 askId,
        uint256 orderId
    ) public orderIsActive(askId, orderId) onlyAsker(askId, msg.sender) {
        require(
            sellEdDSASigVerifier.verifyProof(a, b, c, input),
            'Could not verify proof'
        );
        require(
            input[0] == asks[askId].signature.signingKey[0],
            'Signing key is not correct'
        );
        require(
            input[1] == asks[askId].signature.signingKey[1],
            'Signing key is not correct'
        );
        require(
            input[2] ==
                asks[askId].orders[orderId].orderedSignature.messagePreImage[0],
            'Message preimage is not correct'
        );
        require(
            input[3] ==
                asks[askId].orders[orderId].orderedSignature.messagePreImage[1],
            'Message preimage is not correct'
        );
        require(
            input[4] == asks[askId].orders[orderId].orderedSignature.message,
            'Message is not correct'
        );
        require(
            input[5] == asks[askId].orders[orderId].sharedKeyCommitment,
            'Shared key commitment is not correct'
        );
        require(
            input[6] == asks[askId].orders[orderId].poseidonNonce,
            'Poseidon nonce is not correct'
        );

        asks[askId].orders[orderId].orderedSignature.encryptedSignature = [
            input[7],
            input[8],
            input[9],
            input[10]
        ];
        asks[askId].orders[orderId].status = 0;
        payable(asks[askId].from).transfer(asks[askId].signature.price);
        emit OrderAccepted(askId, orderId);
    }

    /** @dev User creates an ask for an encrypted private key, at a specific price for a specific keccak address.
     * @param price The price of the signature
     * @param keccakAddress The keccak address asker is proposing
     * @param pubkey The public key of the asker
     */
    function askETHAddress(
        uint256 price,
        address keccakAddress,
        uint256[2] memory pubkey
    ) public onlyNonZeroPrice(price) {
        Market.EthAddress memory ethAddress = Market.EthAddress(
            price,
            keccakAddress
        );
        uint256 currentAsk = Counters.current(asksCounter);
        uint256 cancelBlock = Market.getCancelBlock(cancelBlockTime);

        asks[currentAsk].id = currentAsk;
        asks[currentAsk].from = msg.sender;
        asks[currentAsk].status = 1;
        asks[currentAsk].fromPubKey = pubkey;
        asks[currentAsk].ethAddress = ethAddress;
        asks[currentAsk].cancelBlock = cancelBlock;

        emit Ask(msg.sender, currentAsk, price, cancelBlock);
        Counters.increment(asksCounter);
    }

    /** @dev User creates an order for an encrypted private key, at a specific price for a specific keccak address.
     * @param askId The id of the ask
     * @param sharedKeyCommitment The commitment to the shared key
     * @param pubKey The public key of the buyer
     * @param poseidonNonce The nonce used for the proof's poseidon encryption
     */
    function orderETHAddress(
        uint256 askId,
        uint256 sharedKeyCommitment,
        uint256[2] memory pubKey,
        uint256 poseidonNonce
    ) public payable askIsActive(askId) {
        require(
            asks[askId].ethAddress.price == msg.value,
            'Price is not correct'
        );
        uint256 currentOrder = Counters.current(asks[askId].ordersCounter);


        Market.Order memory newOrder;

        newOrder.id = currentOrder;
        newOrder.status = 1;
        newOrder.askId = askId;
        newOrder.orderType = 2;
        newOrder.sharedKeyCommitment = sharedKeyCommitment;
        newOrder.fromPubKey = pubKey;
        newOrder.poseidonNonce = poseidonNonce;
        newOrder.cancelBlock = Market.getCancelBlock(cancelBlockTime);
        newOrder.from = msg.sender;

        asks[askId].orders[currentOrder] = newOrder;
        emit Order(msg.sender, askId, currentOrder);
        Counters.increment(asks[askId].ordersCounter);

    }

    function acceptOrderETHAddress(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[10] memory input,
        uint256 askId,
        uint256 orderId
    ) public orderIsActive(askId, orderId) onlyAsker(askId, msg.sender) {
        require(
            sellECDSANoECDH.verifyProof(a, b, c, input),
            'Could not verify proof'
        );
        // require that first input be the keccak address asked for
        address inputAddress = address(uint160(input[0]));
        require(
            inputAddress == asks[askId].ethAddress.keccakAddress,
            'Incorrect address sold'
        );
        require(
            input[1] == asks[askId].orders[orderId].sharedKeyCommitment,
            'Shared key commitment is not correct'
        );
        require(
            input[2] == asks[askId].orders[orderId].poseidonNonce,
            'Poseidon nonce is not correct'
        );

        asks[askId].orders[orderId].status = 0;
        asks[askId].orders[orderId].orderedEthAddress.encryptedPrivKey = [
            input[3],
            input[4],
            input[5],
            input[6],
            input[7],
            input[8],
            input[9]
        ];
        payable(asks[askId].from).transfer(asks[askId].ethAddress.price);
        emit OrderAccepted(askId, orderId);
    }

    /** @dev User creates a bid for an ETH address. Sale flow is different since seller will also have to prove that ecdh has been computed correctly.
     * @param keccakAddress The price of the signature
     * @param poseidonNonce The nonce used for the proof's poseidon encryption
     * @param pubKey The public key of the bidder
     */
    function bidETHAddress(
        address keccakAddress,
        uint256 poseidonNonce,
        uint256[2] memory pubKey
    ) public payable {
        Market.EthAddress memory ethAddress = Market.EthAddress(
            msg.value,
            keccakAddress
        );
        uint256 currentBid = Counters.current(bidsCounter);
        uint256 cancelBlock = Market.getCancelBlock(cancelBlockTime);

        bids[currentBid].id = currentBid;
        bids[currentBid].from = msg.sender;
        bids[currentBid].status = 1;
        bids[currentBid].fromPubKey = pubKey;
        bids[currentBid].cancelBlock = cancelBlock;
        bids[currentBid].poseidonNonce = poseidonNonce;
        bids[currentBid].ethAddress = ethAddress;

        emit Bid(msg.sender, currentBid, msg.value, keccakAddress, cancelBlock);
        Counters.increment(bidsCounter);
    }

    /** @dev User fills a bid for an ETH address. Collects escrow if correct.
     * @param a pi a
     * @param b pi b
     * @param c pi c
     * @param input The inputs of the proof. Contains the encrypted private key of the ETH address
     * @param bidId The id of the bid
     */
    function fillETHAddressBid(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[13] memory input,
        uint256 bidId
    ) public bidIsActive(bidId) {
        require(
            sellECDSAECDH.verifyProof(a, b, c, input),
            'Could not verify proof'
        );
        require(
            address(uint160(input[0])) == bids[bidId].ethAddress.keccakAddress,
            'Incorrect address sold'
        );
        require(input[3] == bids[bidId].fromPubKey[0], 'Incorrect pubKey');
        require(input[4] == bids[bidId].fromPubKey[1], 'Incorrect pubKey');
        require(input[5] == bids[bidId].poseidonNonce, 'Incorrect nonce');

        // the rest of the inputs are the encrypted private key
        Market.OrderedEthAddress memory orderedEthAddress = Market
            .OrderedEthAddress(
                [
                    input[6],
                    input[7],
                    input[8],
                    input[9],
                    input[10],
                    input[11],
                    input[12]
                ]
            );

        Market.Fill memory fill = Market.Fill(
            msg.sender,
            [input[1], input[2]],
            orderedEthAddress
        );

        bids[bidId].fill = fill;
        bids[bidId].status = 0;
        payable(msg.sender).transfer(bids[bidId].ethAddress.price);
        emit Fill(msg.sender, bidId);
    }

    function cancelAsk(uint256 askId) public onlyAsker(askId, msg.sender) askIsActive(askId) {
        require(
            asks[askId].cancelBlock < block.number,
            'Cancel block is not past'
        );
        emit AskCancelled(askId);
        asks[askId].status = 0;
    }

    function cancelOrder(
        uint256 askId,
        uint256 orderId,
        uint256 typeOfOrder
    ) public onlyOrderer(askId, orderId, msg.sender) orderIsActive(askId, orderId) {
        require(
            asks[askId].orders[orderId].cancelBlock < block.number,
            'Cancel block is not past'
        );
        require(typeOfOrder < 3, 'Type of order can not be equal or greater than 3');

        uint256 refund;
        if (typeOfOrder == 0) {
            refund = asks[askId].groth16proof.price;
        } else if (typeOfOrder == 1) {
            refund = asks[askId].signature.price;
        } else if (typeOfOrder == 2) {
            refund = asks[askId].ethAddress.price;
        }
        require(refund > 0, 'Refund can not be 0');
        payable(msg.sender).transfer(refund);
        asks[askId].orders[orderId].status = 0;
        emit OrderCancelled(askId, orderId);
    }

    function cancelBid(uint256 bidId) public onlyBidder(bidId, msg.sender) bidIsActive(bidId) {
        require(
            bids[bidId].cancelBlock < block.number,
            'Cancel block is not past'
        );
        payable(msg.sender).transfer(bids[bidId].ethAddress.price);
        bids[bidId].status = 0;
        emit BidCancelled(bidId);
    }
}
