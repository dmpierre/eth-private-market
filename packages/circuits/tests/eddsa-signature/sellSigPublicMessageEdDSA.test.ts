import path from 'node:path';
import { Keypair as JubJubKeyPair } from 'maci-domainobjs';
import {
    hash2,
    sign,
    encrypt as poseidonEncrypt,
    decrypt as poseidonDecrypt,
} from 'maci-crypto';
import { utilsMarket, utilsCrypto } from 'private-market-utils';

// @ts-expect-error - no typing provided with circom_tester
import * as circom_tester from 'circom_tester';
import assert from 'node:assert';
const wasm_tester = circom_tester.wasm;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let circuit: any;

describe('EdDSA Signature Bid', () => {
    before('Setup test circuit', async () => {
        const circuitPath = path.join(
            __dirname,
            'circom',
            'test_sellSigPublicMessageEdDSA.circom'
        );
        circuit = await wasm_tester(circuitPath);
    });

    describe('Buyer makes request', () => {
        it('Should be able to hash public jubjub key', () => {
            const user = new utilsMarket.User(
                utilsCrypto.getRandomECDSAPrivKey(false)
            );
            assert.doesNotThrow(
                () => hash2(user.pubJubJubKey.rawPubKey),
                Error,
                `Failed at hashing ${user.pubJubJubKey.rawPubKey}`
            );
        });
    });

    describe('Seller sells signature', () => {
        it('Should calculate the same ECDH value for both buyer and seller', () => {
            const buyer = new utilsMarket.User(
                utilsCrypto.getRandomECDSAPrivKey(false)
            );
            const seller = new utilsMarket.User(
                utilsCrypto.getRandomECDSAPrivKey(false)
            );

            const sharedKeyBuyer = JubJubKeyPair.genEcdhSharedKey(
                buyer.privJubJubKey,
                seller.pubJubJubKey
            );
            const sharedKeySeller = JubJubKeyPair.genEcdhSharedKey(
                seller.privJubJubKey,
                buyer.pubJubJubKey
            );

            // assert both keys are equal (buyer and seller)
            assert.deepEqual(sharedKeyBuyer, sharedKeySeller);
        });

        it('Should calculate witness correctly when selling EdDSA signature', async () => {
            // buyer asks for signature over his public key
            const buyer = new utilsMarket.User(
                utilsCrypto.getRandomECDSAPrivKey(false)
            );
            const seller = new utilsMarket.User(
                utilsCrypto.getRandomECDSAPrivKey(false)
            );
            const sharedKey = JubJubKeyPair.genEcdhSharedKey(
                seller.privJubJubKey,
                buyer.pubJubJubKey
            );

            const message = hash2(buyer.pubJubJubKey.rawPubKey);
            const sharedKeyHash = hash2(sharedKey);

            const signature = sign(seller.privJubJubKey.rawPrivKey, message);

            // Encrypt with poseidon
            const signaturePoseidonNonce = BigInt(Date.now().toString());
            const encryptedSig = poseidonEncrypt(
                [signature.R8[0], signature.R8[1], signature.S],
                sharedKey,
                signaturePoseidonNonce
            );

            const inputs = {
                pubKeyJubJubSeller: seller.pubJubJubKey.asCircuitInputs(),
                messagePreImage: buyer.pubJubJubKey.asCircuitInputs(),
                message: message,
                sharedKey: sharedKey,
                sharedKeyHash: sharedKeyHash,
                signaturePoseidonNonce: signaturePoseidonNonce,
                eddsaSigR8: signature.R8,
                eddsaSigS: signature.S,
                poseidonEncryptedSig: encryptedSig,
            };

            const witness = await circuit.calculateWitness(inputs);
            await circuit.checkConstraints(witness);
            assert.equal(witness[0], BigInt(1));
        });
    });

    describe('Buyer retrieves signature', () => {
        it('Should be able to decrypt correctly encrypted signature', () => {
            const buyer = new utilsMarket.User(
                utilsCrypto.getRandomECDSAPrivKey(false)
            );
            const seller = new utilsMarket.User(
                utilsCrypto.getRandomECDSAPrivKey(false)
            );

            const buyerSharedKey = JubJubKeyPair.genEcdhSharedKey(
                buyer.privJubJubKey,
                seller.pubJubJubKey
            );
            const sellerSharedKey = JubJubKeyPair.genEcdhSharedKey(
                seller.privJubJubKey,
                buyer.pubJubJubKey
            );

            const message = hash2(buyer.pubJubJubKey.rawPubKey);
            const signaturePoseidonNonce = BigInt(Date.now().toString());

            // Signature is encrypted with the seller's calculated ecdh
            const signature = sign(seller.privJubJubKey.rawPrivKey, message);
            const encryptedSig = poseidonEncrypt(
                [signature.R8[0], signature.R8[1], signature.S],
                sellerSharedKey,
                signaturePoseidonNonce
            );

            // Signature is decrypted with the buyer's calculated ecdh
            const decryptedSig = poseidonDecrypt(
                encryptedSig,
                buyerSharedKey,
                signaturePoseidonNonce,
                3
            );

            assert.deepEqual(
                [signature.R8[0], signature.R8[1], signature.S],
                decryptedSig
            );
        });
    });
});
