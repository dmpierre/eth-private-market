import { SetStateAction } from "react";

export type StringETHAddress = `0x${string}`;
export type JubJubPubKey = [bigint, bigint];
export type EncryptedECDSAPrivKey = [bigint, bigint, bigint, bigint, bigint, bigint, bigint];
export type EncryptedSignature = [bigint, bigint, bigint, bigint];
export type EncryptedProof = bigint[];
export type Groth16Proof = {
    pi_a: [bigint, bigint, bigint];
    pi_b: [[bigint, bigint], [bigint, bigint], [bigint, bigint]];
    pi_c: [bigint, bigint, bigint];
    protocol?: string;
    curve?: string;
}
export interface ETHAddress {
    price: bigint;
    keccakAddress: StringETHAddress;
}

export interface SigMerkleGroth16Proof {
    price: bigint;
    vKeyhash: bigint;
    groupRoot: bigint;
}

export interface OrderedSigMerkleGroth16Proof {
    encryptedProof: EncryptedProof;
    messageHash: [bigint, bigint, bigint, bigint];
}

export interface Signature {
    price: bigint;
    signingKey: SigningKey;
}

export interface OrderedSignature {
    message: bigint;
    messagePreimage: bigint;
    encryptedSignature: EncryptedSignature;
}

export type AskResult = [
    bigint,
    Counter,
    StringETHAddress,
    bigint,
    bigint,
    SigMerkleGroth16Proof,
    Signature,
    ETHAddress
]

export type BidResult = [
    bigint,
    StringETHAddress,
    bigint,
    bigint,
    bigint,
    ETHAddress,
    {
        from: StringETHAddress,
        fromPubkey: JubJubPubKey,
        orderedEthAddress: {
            encryptedPrivKey: EncryptedECDSAPrivKey,
        },
    },
]

export interface Counter {
    _value: bigint;
}
export interface OrderedEthAddress {
    encryptedPrivKey: EncryptedECDSAPrivKey;
}

export interface Fill {
    from: StringETHAddress;
    fromPubkey: JubJubPubKey;
    orderedEthAddress: OrderedEthAddress;
}

export interface Bid {
    type: 'bid';
    objectType: 'ETHAddress';
    id: bigint;
    from: StringETHAddress;
    status: bigint;
    fromPubKey: JubJubPubKey;
    cancelBlock: bigint;
    poseidonNonce: bigint;
    ethAddress: ETHAddress;
    fill: Fill;
}

export interface Ask {
    type: 'ask';
    id: bigint;
    ordersCounter: bigint;
    objectType: MarketObjectType;
    from: StringETHAddress;
    status: bigint;
    cancelBlock: bigint;
    fromPubKey: JubJubPubKey;
    sigMerkleGroth16Proof: SigMerkleGroth16Proof;
    signature: Signature;
    ethAddress: ETHAddress;
}

export interface Order {
    type: 'order';
    cancelBlock: bigint;
    askId: bigint;
    from: StringETHAddress;
    fromPubKey: JubJubPubKey;
    id: bigint;
    orderType: 0n | 1n | 2n;
    orderedEthAddress: OrderedEthAddress;
    orderedGroth16SigMerkleProof: OrderedSigMerkleGroth16Proof;
    orderedSignature: OrderedSignature;
    poseidonNonce: bigint;
    sharedKeyCommitment: bigint;
    status: bigint;
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface BidCardProps {
    inspectingBid: Bid;
    setinspectingBid: (value: SetStateAction<Bid | undefined>) => void;
}

export type MarketObjectType = 'ETHAddress' | 'Signature' | 'SigMerkleGroth16Proof';
export type ActionType = 'bid' | 'ask';
export type MarketActionType =
    | 'bidETHAddress'
    | 'askETHAddress' | 'orderETHAddress'
    | 'askSignature' | 'orderSignature'
    | 'askSigMerkleGroth16Proof' | 'orderSigMerkleGroth16Proof' | 'acceptOrderSigMerkleGroth16Proof' | 'acceptOrderETHAddress' | 'acceptOrderSignature';
export type SigningKey = [bigint, bigint];
export type PubKey = [bigint, bigint];

export type EncryptedOrderData = EncryptedECDSAPrivKey | EncryptedSignature | EncryptedProof;
