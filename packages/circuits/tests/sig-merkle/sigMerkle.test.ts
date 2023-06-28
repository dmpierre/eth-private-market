import path from 'node:path';
import { hashPersonalMessage } from 'ethereumjs-util';
import { sign } from '@noble/secp256k1';
import * as ethers from 'ethers';
import {
    utilsCrypto,
    utilsMerkle,
    utilsBigint,
    utilsMarket,
} from 'private-market-utils';

// @ts-expect-error - no typing provided with circom_tester
import * as circom_tester from 'circom_tester';
import { assert } from 'chai';
const wasm_tester = circom_tester.wasm;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let circuit: any;
let input: {
    pathElements: string[];
    pathIndices: string[];
    root: string;
    r: bigint[];
    s: bigint[];
    msghash: bigint[];
    pubkey: [bigint, bigint, bigint, bigint][];
};

const CIRCUITS_FOLDER = '../../circom/sig-merkle';

describe('Signature + Merkle Proof', () => {
    /**
     * Those tests are merely to demonstrate the usage we do of the initial
     * heyanon circuits. They are not meant to be exhaustive. Rather, they serve
     * as a demo of how the proof is generated and used as an input in the
     * subsequent proof verification + encryption circuit.
     */
    before(async () => {
        const keypair = new utilsMarket.ECDSAKeyPair(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );
        const address = ethers.utils.computeAddress(
            '0x' + keypair.privECDSAKey.toString(16)
        );
        const merkleLeaves = [
            address,
            // @dev: following is a copilot suggested address
            '0x199D5ED7F45F4eE35960cF22EAde2076e95B253F',
        ];

        const h = hashPersonalMessage(Buffer.from('private-market'));
        const sig = await sign(h.toString('hex'), keypair.privECDSAKeyAsBytes, {
            canonical: true,
            der: false,
        });

        const { pathElements, pathIndices, pathRoot } =
            await utilsMerkle.createMerkleTree(address, merkleLeaves);
        const treeArtifacts = utilsMerkle.prepareMerkleRootProof(
            pathElements,
            pathIndices,
            pathRoot
        );

        const m = utilsBigint.bigint_to_array(
            64,
            4,
            utilsBigint.Uint8Array_to_bigint(h)
        );
        const r = utilsBigint.bigint_to_array(
            64,
            4,
            utilsBigint.Uint8Array_to_bigint(sig.slice(0, 32))
        );
        const s = utilsBigint.bigint_to_array(
            64,
            4,
            utilsBigint.Uint8Array_to_bigint(sig.slice(32, 64))
        );
        const { x: x, y: y } = keypair.getPubECDSAKeyAsTuple();

        const circuitPath = path.join(
            __dirname,
            CIRCUITS_FOLDER,
            'sigMerkle.circom'
        );

        circuit = await wasm_tester(circuitPath);
        input = {
            r: r,
            s: s,
            msghash: m,
            pubkey: [x, y],
            ...treeArtifacts,
        };
    });

    describe('Generate proof of valid signature and merkle proof', () => {
        it('Should pass constraints check with correct inputs', async () => {
            const witness = await circuit.calculateWitness(input);
            await circuit.checkConstraints(witness);
            assert.equal(witness[0], BigInt(1));
        });
    });
});
