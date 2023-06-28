import { Keypair, PubKey, PrivKey } from "maci-domainobjs";
import { Point } from "@noble/secp256k1";
import { EcdhSharedKey, Signature } from "maci-crypto";

export type PrivECDSAKey = bigint;
export type PubECDSACoordTuple = [ bigint, bigint, bigint, bigint ];
export type PubECDSAPointTuple = [ PubECDSACoordTuple, PubECDSACoordTuple ];
export type JubJubKeypair = Keypair;
export type PubJubJubKey = PubKey;
export type PrivJubJubKey = PrivKey;
export type ECDSAKeypair = { pub: Point, priv: PrivECDSAKey; };
export type PoseidonEncryptedPrivECDSAKey = [ bigint, bigint, bigint, bigint, bigint, bigint, bigint ];
export type PoseidonEncryptedEdDSASignature = [ bigint, bigint, bigint, bigint ];
export type Nonce = string;
export type EdDSASignature = Signature;

export type ECDSASaleProofInputs = {
     pubKeyJubJubSeller: string[],
     pubKeyJubJubBuyer: string[],
     sharedKey: EcdhSharedKey,
     nonce: Nonce,
     pubECDSAKey: PubECDSAPointTuple,
     encryptedPrivECDSAKey: PoseidonEncryptedPrivECDSAKey,
     privKeyJubJubSeller: string;
};
