// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import 'forge-std/Test.sol';
import '../src/PrivateMarket.sol';
import './Shared.sol';

contract PrivateMarketGroth16SigMerkleProof is Test, Shared {
    PrivateMarket public market;

    uint256 public poseidonNonce = 1686056763556;
    uint[2] public a = [
        0x25537851753bcb630e090de3591dc0b026c3e9be43b879e88929fa6ff55c7c50,
        0x19431cc8068c9a348432c2abfa17d832ae852bd3d6abdca86c80b06846965f83
    ];
    uint[2][2] public b = [
        [
            0x19fa122696ece50530840ad61dfc0c82abcf5d870c03734f4815749a5a2aa481,
            0x1587a1cd8c78375f22afb2a1de8a1c2d350083812f36d4413f65c2119e2fbe2e
        ],
        [
            0x124f684dd1494661c614424479a3849fc431d360c9316775239b8b4f15db93a4,
            0x013694315ae10de0a3172992467fe20663fe1702e2cf367c0487db635a0d3000
        ]
    ];
    uint[2] public c = [
        0x0f70b5683c53d8975197a2d6bf07b3f27a8e6eea568eecc154cf91da3f3d04bf,
        0x109d7377b9a3405c0f28f86148b7c8843bde103bab652bde104ddfd13fb78aa8
    ];
    uint[57] public input = [
        0x1e60350101637e298f9054ecc731601f76d0b2d96867b4cb5dbe4fd7e1796809,
        0x1db667659dfc6b55ea8c2a9d8a2e17480140e7b67a4c3f515fd480b6caf66051,
        0x000000000000000000000000000000000000000000000000cbd80aa7b3c91ed1,
        0x0000000000000000000000000000000000000000000000001f4064f39d16dd06,
        0x0000000000000000000000000000000000000000000000007fb7537f43e76725,
        0x00000000000000000000000000000000000000000000000036219578579e8cb3,
        0x0548d0e5b0b524980820d29db16f7caf9b245efbfa2f0c1f50cc58d931b0474e,
        0x2758f3887c17a5b42608e024bbf9040f2a7a0613bc3f36ffb1a40ac1419f5046,
        0x0ddbd1285b686f9023566729f13d36e4c901a138483023c55b34630e193d5e9e,
        0x255e33fb82a6b6e6994fdc2262ffe3e4de89f14b360820711de7c4ccd59025b4,
        0x1a759f198024e9b47d02881f0a66ac1dca64192883bf93352300d9f23f05c1b9,
        0x00ae15ff2bd8069d9d623c2cb8e58e4f4b23c120b571daa762b55344b2068efe,
        0x2dd1b62bbe7d1657d4a0469b1e3be3626a775ee5e9a1cc64831def060cd14e7f,
        0x2cb4fed3fec4ee97059d4e1d166498886ecb0ba39c1aa06aa22e57caebb0b2c0,
        0x0d1c4cc3ba3eee246f2860d7ba8a67e0fafdf13178b45ad7d3245e4e3ffd7e97,
        0x04c962fb7f5c85a58a50a78086eaadb0898c959516a6b2682fc5527e54892be2,
        0x2d5ba9228c32307ee6d38fc7136e9a714040669510aff0a00ca90cd52fdc8ac8,
        0x01c40d45a0719208f0a6507c1b2654042e121cfd0a4639274e4ea71c747a29e3,
        0x112cffaffba473380c4cfd25e5eed59b26a92ebf9a75e23df1ab90bcf8f40603,
        0x15e113c17348e98f3560505f2477a55efa4481a1f0b242c5e7fd6f15135bf942,
        0x09612c5721f0fd984a13380d77790f4efe0264e1fa7c77ab81fb7d71389818c1,
        0x0e27e2cd6e44205642f14c3761d8f168530491d34436a0a5ef90bd747676802d,
        0x099f430da68660cd57304145b866b6acb6560d566ee1e60b6eeb926f27261a3c,
        0x0758e9aca1d0b480cbcb8fea2ff4eb8b84a8de0054fc516118f0307cbdb89d03,
        0x1b35c1a1bfd1d877b1a1bc8bf07b2bdf03d1b63a3c4c1836b573378ae97099be,
        0x03b1d5e19c579d0ab02a38d3a85f0aaece71cac63e6f7bb087483b8b22b2f910,
        0x022498d8f89bd109caffec507d278bc8d2668baba6f96cf3fb8577a9297fafb7,
        0x0cd73ee2e3bd7cca20196835ca07faac356f82b77a63533ef71e452e01c173e0,
        0x23c841b64540aeed7ed3ca0406d82c2532c9d88565e34422b41af21c93ee8266,
        0x0ee03f43aa9ba87d19c1f038f409dac16d31e05959ab5183d60017bb7a68edec,
        0x256f438eeb2fa9ae4cff36d20c2fe392a6b1268ea801749a0fbf9f5372b36be3,
        0x166eb84fccb2a9b8c8d26d70c4335af397b98f6962856a501e8d288bd86adfc5,
        0x1ee5b86650cc0ee1cb6d8648e76246f7a7e498a20f3f50adb67b901e463d65da,
        0x0e744be5581f293a63d3d4ded6d83bab586bcb35f9656a80dd17bb5305ceeafd,
        0x258250167db5d490974c22665141d6d43ab82d8fb2db4bd1891761082db12623,
        0x2bd3e8650cfa7038d268fd60f9379e3d4e28cc86273a2ddd3e678951c572ee78,
        0x0281e8b828abf77b851b8569c812bef025f4b381d037114e39838ca11b0f925c,
        0x1351fd9b5741ccc1c1c6f278b75e85289e2c030153b69727d9eb8a86686abd1e,
        0x01f62ca55f92203cdc653d6f8879ec7a54c7ba1d8f84f69828272851223c6783,
        0x1683285e2c229c9ac66dbd3c7991480cbbaffcac94bfb438b09c2b936792a3c9,
        0x1ccae71654023f7cf406e486fcdb793f911786975590d8917aa9483ef2839570,
        0x0ccb5769dee2c7654a4e1ea6335850f5a1a5fcbcee1c433201f11361e153fc06,
        0x13cf7d559eca2fed840f9dc91f3c43559aed91fae3cee6cdca1e56c77adcdcb3,
        0x0d892fcf3292a037adb9dec56549cc104e1365ca6876cfc2376d3bee1c0b0cbc,
        0x1c314971e3d5763523e8525aabb2c9aed093ae79d81649b566a58f0cfd7f74aa,
        0x273eb276e17698aac3f0d2b4a50a233a01ff0609da5279d2915cea9f499a023a,
        0x00d2588e1e0e2696fc14d3a59ed406e16be23c90afd4d376ea928e7869e3a47c,
        0x1e6386867da9e0b04fd2f10ee033841175d1b4c00ddee6ef5c178df26115c07d,
        0x29f4473602a2895feabe771184a7bbfaccc04a38549814a83b1fb81685bc4fe1,
        0x1a9d7d594e1c67a16d71b69c30d26d652cfbb840c3e5de204877427a6ff840f5,
        0x0e37b726caa15b9db33aebb83cbe18a62dbc08ec73ac34b930a15bffd8b46a91,
        0x0905b3b56b6453702d4b57b0fb7545f05166b974d1c2eb10bf9d9546e5e9b560,
        0x2a17f99a1ad66063b0c3de91310837923e8f98a2b4883272c992894d1e1fcfdb,
        0x06989a4bdc8f79770b79ba4ccf0bf5a4ae3623f71650c6d187fddb8d43255707,
        0x0e5b063227b4c47849ef0da3e34bc532cd98c54ed54f332748e36a0b37f46ec3,
        0x0000000000000000000000000000000000000000000000000000018890d080a4,
        0x0932a361e595029dd6f6fa0d63d72d01a8d2e25d31680cb3d117cc7c5028975c
    ];

    uint256 public vkeyHash =
        13739368595379284378408274053926265822759463847441493756031921417848387889161;
    uint256 public root =
        13439352394170593081845471929223912519573112290769049748917402654955628027985;
    uint256[2] public sellerPubKey = [
        2138983825972042544165529879242997822246389741009858743702956821903060420974,
        10131410093828838160156390341028279788476964209163761207132133301150848874843
    ];
    uint64[4] public messageHash = [
        14688501900060991185,
        2251910811160599814,
        9202916169620088613,
        3900563096378182835
    ];

    uint256 public sharedKeyCommitment =
        4160285614435484328860286323777692352516277948906174491067630374609289254748;
    uint256[2] public buyerPubKey = [
        17092805792916413921026304172602105417970677794964922855633655280966762640828,
        16350590645825126134715441794529134560970756754976582889894007757631001981934
    ];


    function sellerValidAsk() private {
        market.askSigMerkleGroth16Proof(
            groth16ProofPrice,
            vkeyHash,
            root,
            sellerPubKey
        );
    }

    function buyerValidOrder(uint256 askId) private {
        market.orderSigMerkleGroth16Proof{value: groth16ProofPrice}(
            askId,
            messageHash,
            sharedKeyCommitment,
            buyerPubKey,
            poseidonNonce
        );
    }

    function setUp() public {
        vm.deal(buyer, 1 ether);
        vm.deal(seller, 1 ether);
        market = new PrivateMarket(cancelBlockTime);
    }

    function testRevertIfPriceIs0() public {
        vm.startBroadcast(seller);
        vm.expectRevert(bytes('Price cannot be 0'));
        market.askSigMerkleGroth16Proof(0, vkeyHash, root, sellerPubKey);
        vm.stopBroadcast();
    }

    function testRevertIfCancelBlockIsNotPast() public {
        uint currentAsk = market.asksCounter();
        vm.startBroadcast(seller);
        sellerValidAsk(); 
        vm.expectRevert(bytes('Cancel block is not past'));
        market.cancelAsk(currentAsk);
        vm.stopBroadcast();
    }

    function testRevertCancelAskIfAskIsNotActive() public {
        uint currentAsk = market.asksCounter();
        vm.startBroadcast(seller);
        sellerValidAsk();
        vm.roll(cancelBlockTime + 20);
        market.cancelAsk(currentAsk);
        // now try to re-cancel it. should revert
        vm.expectRevert(bytes('Ask is not active'));
        market.cancelAsk(currentAsk);
        vm.stopBroadcast();
    }

    function testOnlyOrdererCanCancelOrder() public {
        uint currentAsk = market.asksCounter();
        vm.startBroadcast(seller);
        sellerValidAsk();
        vm.stopBroadcast();

        vm.startBroadcast(buyer);
        buyerValidOrder(currentAsk);
        vm.stopBroadcast();

        vm.roll(cancelBlockTime + 20);

        uint256 currentOrder = market.getNOrdersForAskId(currentAsk);
        vm.startBroadcast(seller);
        vm.expectRevert(bytes('Only orderer method'));
        market.cancelOrder(currentAsk, currentOrder, 0);
        vm.stopBroadcast();
    }

    function testRevertCancelOrderIfTypeOfOrderIsGreaterThan3() public {
        // place valid ask while broadcasting as seller
        uint currentAsk = market.asksCounter();
        vm.startBroadcast(seller);
        sellerValidAsk();
        vm.stopBroadcast();

        // place valid order as buyer
        uint256 currentOrder = market.getNOrdersForAskId(currentAsk);
        vm.startBroadcast(buyer);
        buyerValidOrder(currentAsk);
        vm.stopBroadcast();

        // roll time forward
        vm.roll(cancelBlockTime + 20);

        // cancel order as buyer, with type greater or equal to 3
        vm.startBroadcast(buyer);
        vm.expectRevert(bytes('Type of order can not be equal or greater than 3'));
        market.cancelOrder(currentAsk, currentOrder, 3);
        vm.stopBroadcast();
    }

    function testRevertCancelOrderIfOrderIsNotActive() public {
        // place valid ask while broadcasting as seller
        uint currentAsk = market.asksCounter();
        vm.startBroadcast(seller);
        sellerValidAsk();
        vm.stopBroadcast();

        // place valid order as buyer
        uint256 currentOrder = market.getNOrdersForAskId(currentAsk);
        vm.startBroadcast(buyer);
        buyerValidOrder(currentAsk);
        vm.stopBroadcast();

        // roll time forward
        vm.roll(cancelBlockTime + 20);

        // cancel order as buyer, with type of 0 - groth16 proof
        vm.startBroadcast(buyer);
        market.cancelOrder(currentAsk, currentOrder, 0);
        vm.stopBroadcast();

        // try to cancel order again, should revert
        vm.startBroadcast(buyer);
        vm.expectRevert(bytes('Order is not active'));
        market.cancelOrder(currentAsk, currentOrder, 0);
        vm.stopBroadcast();
    }

    function testRevertIfRefundIs0() public {
        // place valid ask while broadcasting as seller
        uint currentAsk = market.asksCounter();
        vm.startBroadcast(seller);
        sellerValidAsk();
        vm.stopBroadcast();

        // place valid order as buyer
        uint256 currentOrder = market.getNOrdersForAskId(currentAsk);
        vm.startBroadcast(buyer);
        buyerValidOrder(currentAsk);
        vm.stopBroadcast();

        // roll time forward
        vm.roll(cancelBlockTime + 20);

        // cancel order as buyer, with type of 1 - signature, which is incorrect
        vm.startBroadcast(buyer);
        vm.expectRevert(bytes('Refund can not be 0'));
        market.cancelOrder(currentAsk, currentOrder, 1);
        vm.stopBroadcast();
    }

    function testGetsRefundIfValidCancelOrder() public {

        uint256 buyerBalance = buyer.balance;

        // place valid ask while broadcasting as seller
        uint currentAsk = market.asksCounter();
        vm.startBroadcast(seller);
        sellerValidAsk();
        vm.stopBroadcast();

        // place valid order as buyer
        uint256 currentOrder = market.getNOrdersForAskId(currentAsk);
        vm.startBroadcast(buyer);
        buyerValidOrder(currentAsk);
        vm.stopBroadcast();

        // roll time forward
        vm.roll(cancelBlockTime + 20);

        // cancel order as buyer, with type of 0 - groth16 proof
        vm.startBroadcast(buyer);
        market.cancelOrder(currentAsk, currentOrder, 0);
        vm.stopBroadcast();

        // buyer balance has not changed between when the order was placed and cancelled
        assertEq(buyer.balance, buyerBalance);

    }

    function testGroth16ProofSale() public {
        uint256 sellerBalance = seller.balance;
        uint256 buyerBalance = buyer.balance;

        uint256 askId = market.asksCounter();
        uint256 orderId = market.getNOrdersForAskId(askId);

        vm.startBroadcast(seller);
        sellerValidAsk();
        vm.stopBroadcast();

        vm.startBroadcast(buyer);
        buyerValidOrder(askId);
        vm.stopBroadcast();
        assertEq(buyer.balance, buyerBalance - groth16ProofPrice);

        vm.startBroadcast(seller);
        market.acceptOrderSigMerkleGroth16Proof(a, b, c, input, askId, orderId);
        vm.stopBroadcast();
        assertEq(seller.balance, sellerBalance + groth16ProofPrice);
    }

    function testGroth16ProofSaleMultipleOrders() public {
        uint256 sellerBalance = seller.balance;
        uint256 buyerBalance = buyer.balance;

        address buyer2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        vm.deal(buyer2, 1 ether);
        uint256 buyer2Balance = buyer2.balance;

        uint256 askId = market.asksCounter();
        vm.startBroadcast(seller);
        sellerValidAsk();
        vm.stopBroadcast();

        uint256 orderIdBuyer = market.getNOrdersForAskId(askId);
        vm.startBroadcast(buyer);
        buyerValidOrder(askId);
        vm.stopBroadcast();
        assertEq(buyer.balance, buyerBalance - groth16ProofPrice);

        uint256 orderIdBuyer2 = market.getNOrdersForAskId(askId);
        vm.startBroadcast(buyer2);
        buyerValidOrder(askId);
        vm.stopBroadcast();

        assertEq(buyer2.balance, buyer2Balance - groth16ProofPrice);
        
        vm.startBroadcast(seller);
        market.acceptOrderSigMerkleGroth16Proof(a, b, c, input, askId, orderIdBuyer);
        market.acceptOrderSigMerkleGroth16Proof(a, b, c, input, askId, orderIdBuyer2);
        vm.stopBroadcast();

        assertEq(seller.balance, sellerBalance + groth16ProofPrice * 2);
    }
}
