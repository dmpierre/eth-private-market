import fs from 'fs';
import { Keypair, PrivKey, PubKey } from 'maci-domainobjs';
import { hash2 } from 'maci-crypto';
import * as ethers from 'ethers';

import { utilsMarket, utilsBigint, utilsMerkle } from 'private-market-utils';
import { sign } from '@noble/secp256k1';
import { tuple_to_bigint } from '../dist/lib/src/bigint';
import path from 'path';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

//@ts-ignore
import * as snarkjs from 'snarkjs';
import assert from 'assert';

export const main = async () => {
    const ask = JSON.parse(
        fs.readFileSync(__dirname + '/../' + process.argv[2]).toString()
    );
    const order = JSON.parse(
        fs.readFileSync(__dirname + '/../' + process.argv[3]).toString()
    );
    const addressPrivKey = BigInt(
        '0x' + fs.readFileSync(__dirname + '/../' + process.argv[4]).toString()
    );
    const merkleLeaves = JSON.parse(
        fs.readFileSync(__dirname + '/../' + process.argv[5]).toString()
    );
    const pathWasm = __dirname + '/../' + process.argv[6];
    const pathZkey = __dirname + '/../' + process.argv[7];
    const pathVkey = __dirname + '/../' + process.argv[8];

    const sellerPrivKey = new Keypair(new PrivKey(BigInt(ask.privJubJub)));
    const buyerPubKey = new PubKey([
        BigInt(order.pubJubjub[0]),
        BigInt(order.pubJubjub[1]),
    ]);
    const ecdh = Keypair.genEcdhSharedKey(sellerPrivKey.privKey, buyerPubKey);
    const sharedKeyCommitment = hash2(ecdh);

    // check commitment
    assert(
        sharedKeyCommitment == BigInt(order.sharedKeyCommitment),
        'Shared key commitment does not match'
    );

    const address = ethers.utils.computeAddress(
        '0x' + addressPrivKey.toString(16)
    );

    const { pathElements, pathIndices, pathRoot } =
        await utilsMerkle.createMerkleTree(address, merkleLeaves);

    const treeArtifacts = utilsMerkle.prepareMerkleRootProof(
        pathElements,
        pathIndices,
        pathRoot
    );

    const keypair = new utilsMarket.ECDSAKeyPair(addressPrivKey);
    const m = order.data.messageHash.map((x: string) => BigInt(x));
    const h = tuple_to_bigint(m);
    const sig = await sign(h.toString(16), keypair.privECDSAKeyAsBytes, {
        canonical: true,
        der: false,
    });

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

    const inputs = {
        r: r,
        s: s,
        msghash: m,
        pubkey: [x, y],
        ...treeArtifacts,
    };
    console.log('Starting proof generation...');

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        pathWasm,
        pathZkey
    );

    fs.writeFileSync(
        path.join(
            `scripts/out/ask-${order.askId}-order-${order.orderId}-inputs.json`
        ),
        JSON.stringify(inputs)
    );

    fs.writeFileSync(
        path.join(
            `scripts/out/ask-${order.askId}-order-${order.orderId}-proof.json`
        ),
        JSON.stringify(proof)
    );

    fs.writeFileSync(
        path.join(
            `scripts/out/ask-${order.askId}-order-${order.orderId}-publicSignals.json`
        ),
        JSON.stringify(publicSignals)
    );

    const vkey = JSON.parse(fs.readFileSync(path.join(pathVkey)).toString());

    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    return res;
};

main()
    .then((res) => {
        console.log(`Proof verified as: ${res}`);
    })
    .catch((err) => {
        console.log(err);
    })
    .then(() => {
        process.exit(0);
    });
