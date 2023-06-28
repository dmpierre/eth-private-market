import { getPublicKey, sign } from '@noble/secp256k1';
import { hashPersonalMessage } from 'ethereumjs-util';
import {
    utilsCrypto,
    utilsMerkle,
    utilsBigint,
    utilsMarket,
} from 'private-market-utils';
import * as ethers from 'ethers';
import fs from 'fs';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

// @ts-expect-error - no typing provided with snarkjs
import * as snarkjs from 'snarkjs';
import path from 'node:path';
import { hash2 } from 'maci-crypto';

const main = async () => {
    const msg = process.argv[2];
    if (!msg) {
        throw new Error('No message provided');
    }

    const buyer = new utilsMarket.User(
        utilsCrypto.getRandomECDSAPrivKey(false)
    );
    const buyerECDSAPriv = buyer.ecdsaKeypair.privECDSAKey;
    const buyerECDSAPub = getPublicKey(buyerECDSAPriv);

    const sharedKey = utilsCrypto.ecdh(buyerECDSAPriv, buyerECDSAPub);
    const sharedKeyHash = hash2(sharedKey);

    const seller = new utilsMarket.User(
        utilsCrypto.getRandomECDSAPrivKey(false)
    );

    const privKey = BigInt(
        '0x' + fs.readFileSync(__dirname + '/data/priv.txt').toString()
    );

    const merkleLeaves = JSON.parse(
        fs.readFileSync(__dirname + '/merkle/addresses.json').toString()
    );
    const keypair = new utilsMarket.ECDSAKeyPair(privKey);
    const address = ethers.utils.computeAddress(
        '0x' + keypair.privECDSAKey.toString(16)
    );

    const h = hashPersonalMessage(Buffer.from(msg));
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
    console.log('Message hash: ', m);

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

    const pathCircom = 'circom/sig-merkle/';
    const pathWasm = '/bin/sigMerkle_js/sigMerkle.wasm';
    const pathZkey = '/zkey/sigMerkle_1.zkey';

    console.log('Computing proof...');
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        path.join(pathCircom + pathWasm),
        path.join(pathCircom + pathZkey)
    );

    fs.writeFileSync(
        path.join('scripts/out/sig-merkle/inputs.json'),
        JSON.stringify(inputs)
    );

    fs.writeFileSync(
        path.join('scripts/out/sig-merkle/proof.json'),
        JSON.stringify(proof)
    );

    fs.writeFileSync(
        path.join('scripts/out/sig-merkle/publicSignals.json'),
        JSON.stringify(publicSignals)
    );

    fs.writeFileSync(
        path.join('scripts/out/sig-merkle/sellerJubJub.json'),
        JSON.stringify({
            pub: seller.pubJubJubKey.rawPubKey,
            priv: seller.privJubJubKey.rawPrivKey,
        })
    );

    fs.writeFileSync(
        path.join('scripts/out/sig-merkle/buyerJubJub.json'),
        JSON.stringify({
            pub: buyer.pubJubJubKey.rawPubKey,
            priv: buyer.privJubJubKey.rawPrivKey,
        })
    );

    fs.writeFileSync(
        path.join('scripts/out/sig-merkle/sharedKey.json'),
        JSON.stringify({
            sharedKey: sharedKey,
            sharedKeyHash: sharedKeyHash,
            nonce: Date.now().toString(),
        })
    );

    const vkey = JSON.parse(
        fs
            .readFileSync(
                path.join(pathCircom + '/vkey/verification_key_sigMerkle.json')
            )
            .toString()
    );

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
