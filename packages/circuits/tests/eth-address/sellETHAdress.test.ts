import path from 'node:path';
import { User, ECDSAKeyPair } from 'private-market-utils/dist/lib/src/market';
import {
    ecdh,
    getRandomECDSAPrivKey,
} from 'private-market-utils/dist/lib/src/crypto';
import { assert } from 'chai';

// @ts-expect-error - no typing provided with circom_tester
import * as circom_tester from 'circom_tester';

import { getPublicKey } from '@noble/secp256k1';
import { PubKey } from 'maci-crypto';
import { hash2 } from 'maci-crypto';
import { PoseidonEncryptedPrivECDSAKey } from 'private-market-utils/types';
import { Keypair } from 'maci-domainobjs';
const wasm_tester = circom_tester.wasm;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let circuit: any;

const CIRCUITS_FOLDER = '../../circom/eth-address';

let sharedKey: PubKey;
let buyer: User;
let seller: User;
let sharedKeyHash: bigint;
let nonce: string;
let soldKey: ECDSAKeyPair;
let encryptedSoldKey: PoseidonEncryptedPrivECDSAKey;

describe('Sell ETH address', () => {
    before('Setup buyer and seller keypairs, compute shared key', () => {
        buyer = new User(getRandomECDSAPrivKey(false));
        seller = new User(getRandomECDSAPrivKey(false));
        nonce = Date.now().toString();
        sharedKey = ecdh(
            seller.ecdsaKeypair.privECDSAKey,
            buyer.ecdsaKeypair.pubECDSAKey
        );
        sharedKeyHash = hash2(sharedKey) as bigint;
        soldKey = new ECDSAKeyPair(getRandomECDSAPrivKey(false));
        encryptedSoldKey = soldKey.getPoseidonEncryptedPrivECDSAKey(
            sharedKey,
            nonce
        );
    });

    describe('Check and Encrypt ETH address', () => {
        before('Compile checkAndEncryptETHAddress.circom', async () => {
            const circuitPath = path.join(
                __dirname,
                'circom',
                'test_checkAndEncryptETHAddress.circom'
            );

            circuit = await wasm_tester(circuitPath);
        });

        describe('Testing circuit', () => {
            it('Should throw if the wrong private key/encryption is a circuit input', async () => {
                const tuplePrivKey = soldKey.getPrivECDSAKeyAsTuple();
                tuplePrivKey[1] = tuplePrivKey[0];

                const inputs = {
                    sharedKey: sharedKey,
                    poseidonNonce: nonce,
                    encryptedPrivECDSAKey: encryptedSoldKey,
                    privECDSAKey: tuplePrivKey,
                };

                try {
                    await circuit.calculateWitness(inputs);
                } catch (error) {
                    if (error instanceof Error)
                        assert.include(error.message, 'Error: Assert Failed.');
                }
            });

            it('Should pass constraints check with correct inputs', async () => {
                const inputs = {
                    sharedKey: sharedKey,
                    poseidonNonce: nonce,
                    encryptedPrivECDSAKey: encryptedSoldKey,
                    privECDSAKey: soldKey.getPrivECDSAKeyAsTuple(),
                };

                const witness = await circuit.calculateWitness(inputs);
                await circuit.checkConstraints(witness);
                assert.equal(witness[0], BigInt(1));
            });
        });
    });

    describe('Selling ETH address, no ECDH', () => {
        before('Compile sellETHAddressNoECDH.circom', async () => {
            const circuitPath = path.join(
                __dirname,
                CIRCUITS_FOLDER,
                'no-ecdh-check/sellETHAddressNoECDH.circom'
            );

            circuit = await wasm_tester(circuitPath);
        });

        describe('Testing circuit', () => {
            it('Should throw if the shared key does not hash to the commitment', async () => {
                const wrongSharedKey = ecdh(
                    seller.ecdsaKeypair.privECDSAKey,
                    getPublicKey(getRandomECDSAPrivKey(false))
                );

                const inputs = {
                    sharedKey: wrongSharedKey,
                    sharedKeyHash: sharedKeyHash,
                    poseidonNonce: nonce,
                    encryptedPrivECDSAKey: encryptedSoldKey,
                    privECDSAKey: soldKey.getPrivECDSAKeyAsTuple(),
                };

                try {
                    await circuit.calculateWitness(inputs);
                } catch (error) {
                    if (error instanceof Error)
                        assert.include(error.message, 'Error: Assert Failed.');
                }
            });

            it('Should pass constraints check with correct inputs', async () => {
                const inputs = {
                    sharedKey: sharedKey,
                    sharedKeyHash: sharedKeyHash,
                    poseidonNonce: nonce,
                    encryptedPrivECDSAKey: encryptedSoldKey,
                    privECDSAKey: soldKey.getPrivECDSAKeyAsTuple(),
                };

                const witness = await circuit.calculateWitness(inputs);
                await circuit.checkConstraints(witness);
                assert.equal(witness[0], BigInt(1));
            });
        });
    });

    describe('Selling ETH address, with ECDH', () => {
        before('Compile sellETHAddressECDH.circom', async () => {
            const circuitPath = path.join(
                __dirname,
                CIRCUITS_FOLDER,
                'ecdh-check/sellETHAddressECDH.circom'
            );

            circuit = await wasm_tester(circuitPath);
        });

        describe('Testing circuit', () => {
            it('Should throw if the shared key is incorrect', async () => {
                const wrongSharedKey = ecdh(
                    seller.ecdsaKeypair.privECDSAKey,
                    getPublicKey(getRandomECDSAPrivKey(false))
                );

                const inputs = {
                    sellerPubJubJub: seller.pubJubJubKey.asCircuitInputs(),
                    sellerPrivJubJub: seller.privJubJubKey.asCircuitInputs(),
                    buyerPubJubJub: buyer.pubJubJubKey.asCircuitInputs(),
                    sharedKey: wrongSharedKey,
                    poseidonNonce: nonce,
                    encryptedPrivECDSAKey:
                        soldKey.getPoseidonEncryptedPrivECDSAKey(
                            sharedKey,
                            nonce
                        ),
                    privECDSAKey: soldKey.getPrivECDSAKeyAsTuple(),
                };

                try {
                    await circuit.calculateWitness(inputs);
                } catch (error) {
                    if (error instanceof Error)
                        assert.include(error.message, 'Error: Assert Failed.');
                }
            });

            it('Should pass constraints check with correct inputs', async () => {
                const jubjubEcdh = Keypair.genEcdhSharedKey(
                    seller.privJubJubKey,
                    buyer.pubJubJubKey
                );

                const inputs = {
                    sellerPubJubJub: seller.pubJubJubKey.asCircuitInputs(),
                    sellerPrivJubJub: seller.privJubJubKey.asCircuitInputs(),
                    buyerPubJubJub: buyer.pubJubJubKey.asCircuitInputs(),
                    sharedKey: jubjubEcdh,
                    poseidonNonce: nonce,
                    encryptedPrivECDSAKey:
                        soldKey.getPoseidonEncryptedPrivECDSAKey(
                            jubjubEcdh,
                            nonce
                        ),
                    privECDSAKey: soldKey.getPrivECDSAKeyAsTuple(),
                };

                const witness = await circuit.calculateWitness(inputs);
                await circuit.checkConstraints(witness);
                assert.equal(witness[0], BigInt(1));
            });
        });
    });
});
