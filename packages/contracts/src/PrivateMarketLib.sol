// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Counters} from 'openzeppelin/utils/Counters.sol';

library Market {
    struct Groth16SigMerkleProof {
        uint256 price;
        uint256 vKeyhash;
        uint256 groupRoot;
    }

    struct OrderedGroth16SigMerkleProof {
        uint64[4] messageHash;
        uint256[49] encryptedProof;
    }

    struct Signature {
        uint256 price;
        uint256[2] signingKey;
    }

    struct OrderedSignature {
        uint256[2] messagePreImage;
        uint256 message;
        uint256[4] encryptedSignature;
    }

    struct EthAddress {
        uint256 price;
        address keccakAddress;
    }

    struct OrderedEthAddress {
        uint256[7] encryptedPrivKey;
    }

    struct Order {
        uint256 id;
        address from;
        uint256 status;
        uint256 askId;
        uint256 orderType;
        uint256[2] fromPubKey; // seller Jubjub
        uint256 cancelBlock;
        uint256 sharedKeyCommitment;
        uint256 poseidonNonce;
        OrderedGroth16SigMerkleProof orderedGroth16SigMerkleProof;
        OrderedSignature orderedSignature;
        OrderedEthAddress orderedEthAddress;
    }

    struct Ask {
        uint256 id;
        Counters.Counter ordersCounter;
        address from;
        uint256 status;
        uint256[2] fromPubKey; // seller Jubjub
        mapping(uint256 => Order) orders;
        uint256 cancelBlock;
        Groth16SigMerkleProof groth16proof;
        Signature signature;
        EthAddress ethAddress;
    }

    struct Bid {
        uint256 id;
        address from;
        uint256 status;
        uint256[2] fromPubKey;
        uint256 cancelBlock;
        uint256 poseidonNonce;
        EthAddress ethAddress;
        Fill fill;
    }

    struct Fill {
        address from;
        uint256[2] fromPubkey;
        OrderedEthAddress orderedEthAddress;
    }

    /**
     * @dev Returns the block number at which the ask/order/bid can be cancelled.
     * @return uint256
     */
    function getCancelBlock(uint256 blockTime) public view returns (uint256) {
        return block.number + blockTime;
    }
}
