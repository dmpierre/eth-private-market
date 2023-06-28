/// <reference path="../../types/poseidon-encryption/index.d.ts" />
import {
    JubJubKeypair,
    Nonce,
    PoseidonEncryptedEdDSASignature,
    PoseidonEncryptedPrivECDSAKey,
    PrivECDSAKey,
    PrivJubJubKey,
    PubJubJubKey,
} from '../../types';
import { Point, getPublicKey, utils } from '@noble/secp256k1';
import { getJubJubKeyPairFromECDSAPrivKey } from './crypto';
import { poseidonEncrypt } from 'poseidon-encryption';
import { bigint_to_tuple } from './bigint';
import { EcdhSharedKey, sign } from 'maci-crypto';

export class User {
    ecdsaKeypair: ECDSAKeyPair;
    jubJubKeypair: JubJubKeypair;
    pubJubJubKey: PubJubJubKey;
    privJubJubKey: PrivJubJubKey;

    /**
     * We assume that a user is initiated from an ECDSA keypair
     */
    constructor(privECDSAKey: bigint) {
        this.ecdsaKeypair = new ECDSAKeyPair(privECDSAKey);
        this.jubJubKeypair = getJubJubKeyPairFromECDSAPrivKey(privECDSAKey);
        this.pubJubJubKey = this.jubJubKeypair.pubKey;
        this.privJubJubKey = this.jubJubKeypair.privKey;
    }

    // get EdDSA signature over a message
    getEdDSASignature(message: bigint): EdDSASignature {
        const signature = sign(this.privJubJubKey.rawPrivKey, message);
        return new EdDSASignature(signature.R8, signature.S);
    }
}

export class ECDSAKeyPair {
    privECDSAKey: bigint | PrivECDSAKey;
    privECDSAKeyAsBytes: Uint8Array;
    pubECDSAKey: Uint8Array;

    /**
     *
     */
    constructor(privECDSAKey: bigint) {
        this.privECDSAKey = privECDSAKey;
        this.privECDSAKeyAsBytes = utils._bigintTo32Bytes(this.privECDSAKey);
        this.pubECDSAKey = getPublicKey(this.privECDSAKey);
    }

    getPoseidonEncryptedPrivECDSAKey(
        key: JubJubKeypair | EcdhSharedKey,
        nonce: Nonce
    ): PoseidonEncryptedPrivECDSAKey {
        return poseidonEncrypt(
            this.getPrivECDSAKeyAsTuple(),
            key,
            nonce
        ) as PoseidonEncryptedPrivECDSAKey;
    }

    getPubECDSAKeyAsTuple() {
        const point = Point.fromPrivateKey(this.privECDSAKey);
        return {
            x: bigint_to_tuple(point.x),
            y: bigint_to_tuple(point.y),
        };
    }

    getPrivECDSAKeyAsTuple() {
        return bigint_to_tuple(this.privECDSAKey);
    }
}

export class EdDSASignature {
    R8: BigInt[];
    S: BigInt;

    constructor(R8: BigInt[], S: BigInt) {
        this.R8 = R8;
        this.S = S;
    }

    getPoseidonEncryptedEdDSASignature(
        key: JubJubKeypair | EcdhSharedKey,
        nonce: Nonce
    ): PoseidonEncryptedEdDSASignature {
        // TODO: handle case key is JubJubKeypair
        const encryptedSig = poseidonEncrypt(
            [this.R8[0], this.R8[1], this.S],
            key,
            nonce
        ) as PoseidonEncryptedEdDSASignature;
        return encryptedSig;
    }
}
