import { PubKey, hash2 } from 'maci-crypto';
import {
    utilsCrypto,
    utilsMerkle,
    utilsBigint,
    utilsMarket,
    utilsProof,
} from 'private-market-utils';
import fs from 'fs';
import path from 'path';
import { poseidonDecrypt, poseidonEncrypt } from 'poseidon-encryption';
import { buildPoseidon } from 'circomlibjs';

// @ts-expect-error - no typing provided with circom_tester
import * as circom_tester from 'circom_tester';
import { assert } from 'chai';

const wasm_tester = circom_tester.wasm;

let sharedKey: PubKey;
let buyer: utilsMarket.User;
let seller: utilsMarket.User;
let nonce: string;
let chunkedGroth16Proof: any;
let circuit: any;
let poseidon: any;
let F: any;
let sharedKeyHash: bigint;

const chunkedProofPath = path.join(__dirname, 'data/inputsGroth16.json');

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

/**
 * Testing for the groth16 proof verification circuit can not be done using wasm_tester
 * We test only proof encryption and verification key hashing circuits
 */
describe('Sell Groth16 proof', () => {
    before(
        'Setup buyer and seller keypairs, compute shared key and load mock proof and vkey',
        () => {
            buyer = new utilsMarket.User(
                utilsCrypto.getRandomECDSAPrivKey(false)
            );
            seller = new utilsMarket.User(
                utilsCrypto.getRandomECDSAPrivKey(false)
            );
            nonce = Date.now().toString();
            sharedKey = utilsCrypto.ecdh(
                seller.ecdsaKeypair.privECDSAKey,
                buyer.ecdsaKeypair.pubECDSAKey
            );
            sharedKeyHash = hash2(sharedKey) as bigint;
            chunkedGroth16Proof = JSON.parse(
                fs.readFileSync(chunkedProofPath, 'utf8')
            );
        }
    );

    describe('Encrypt groth16 proof', () => {
        before('Compile encryptGroth16Proof.circom', async () => {
            const circuitPath = path.join(
                __dirname,
                'circom',
                'test_encryptGroth16Proof.circom'
            );
            circuit = await wasm_tester(circuitPath);
        });

        it('Should compute a witness for a valid encryption of a chunked groth16 proof', async () => {
            const msg = utilsProof.flattenGroth16Proof(chunkedGroth16Proof);
            const enc = poseidonEncrypt(msg, sharedKey, nonce);

            const inputs = {
                encryptedProof: enc,
                poseidonNonce: nonce,
                negpa: chunkedGroth16Proof.negpa,
                pb: chunkedGroth16Proof.pb,
                pc: chunkedGroth16Proof.pc,
                sharedKey: sharedKey,
            };
            const wtns = await circuit.calculateWitness(inputs);
            await circuit.checkConstraints(wtns);
            assert.equal(wtns[0], 1n);
        });

        it('Should correctly decrypt the proof', async () => {
            const msg = utilsProof.flattenGroth16Proof(chunkedGroth16Proof);
            const enc = poseidonEncrypt(msg, sharedKey, nonce);
            const dec = poseidonDecrypt(enc, sharedKey, nonce, msg.length);
            dec.forEach((el, i) => {
                // resulting decryption is bigint[] vs msg which is string[]
                assert.equal(`${el}`, msg[i]);
            });
        });

        it('Should throw if the proof is not correctly encrypted', async () => {
            const msg = utilsProof.flattenGroth16Proof(chunkedGroth16Proof);
            const enc = poseidonEncrypt(msg, sharedKey, nonce);
            enc[0] = enc[1]; // tamper with first element
            const inputs = {
                encryptedProof: enc,
                poseidonNonce: nonce,
                negpa: chunkedGroth16Proof.negpa,
                pb: chunkedGroth16Proof.pb,
                pc: chunkedGroth16Proof.pc,
                sharedKey: sharedKey,
            };
            try {
                await circuit.calculateWitness(inputs);
            } catch (error) {
                if (error instanceof Error)
                    assert.include(error.message, 'Error: Assert Failed.');
            }
        });
    });

    describe('Hash groth16 vkey', () => {
        before(
            'Compile hashGroth16Vkey.circom and build poseidon',
            async () => {
                const circuitPath = path.join(
                    __dirname,
                    'circom',
                    'test_hashGroth16Vkey.circom'
                );
                circuit = await wasm_tester(circuitPath);
                poseidon = await buildPoseidon();
                F = poseidon.F;
            }
        );

        it('Should compute a valid hash for a groth16 verification key', async () => {
            const flatVkey = utilsProof.flattenGroth16Vkey(chunkedGroth16Proof);
            const inputs = {
                inputs: flatVkey,
            };

            const vkeyHash = await utilsProof.hashGroth16Vkey(
                inputs.inputs,
                12,
                16
            );
            const wtns = await circuit.calculateWitness(inputs);
            await circuit.checkConstraints(wtns);
            await circuit.assertOut(wtns, { out: vkeyHash });
        });
    });

    describe('Prepare input for groth16 proof verification and encryption', () => {
        /**
         * Not a test, example for generating input for the groth16 proof verification and encryption circuit
         */
        it('Should correctly prepare inputs for groth16 proof verification and encryption', async () => {
            const flatProof =
                utilsProof.flattenGroth16Proof(chunkedGroth16Proof);
            const flatVkey = utilsProof.flattenGroth16Vkey(chunkedGroth16Proof);

            const enc = poseidonEncrypt(flatProof, sharedKey, nonce);
            const vkeyHash = await utilsProof.hashGroth16Vkey(flatVkey, 12, 16);
            const input = {
                ...chunkedGroth16Proof,
                vkHash: vkeyHash,
                encryptedProof: enc,
                poseidonNonce: nonce,
                sharedKey: sharedKey,
                sharedKeyHash: sharedKeyHash,
            };

            const outPath = path.join(
                __dirname,
                'data',
                'inputVerifyAndEncryptSigMerkleProof.json'
            );

            fs.writeFileSync(outPath, JSON.stringify(input));
        });
    });
});
