import { poseidonEncrypt } from 'poseidon-encryption';
import { utilsProof } from '../lib/index';
import fs from 'fs';
import { hash2 } from 'maci-crypto';
import { Keypair, PrivKey, PubKey } from 'maci-domainobjs';
import assert from 'assert';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const main = async () => {
    // take as cli args: path to proof, public signals, vk, and output file
    const proofPath = process.argv[2];
    const publicInputsPath = process.argv[3];
    const vkeyPath = process.argv[4];
    const askPath = process.argv[5];
    const orderPath = process.argv[6];
    const outFile = process.argv[7];
    const pyProofOut = 'proofInput.json';

    const ask = JSON.parse(
        fs.readFileSync(__dirname + '/../' + askPath).toString()
    );
    const order = JSON.parse(
        fs.readFileSync(__dirname + '/../' + orderPath).toString()
    );

    const sellerPrivKey = new Keypair(new PrivKey(BigInt(ask.privJubJub)));
    const buyerPubKey = new PubKey([
        BigInt(order.pubJubjub[0]),
        BigInt(order.pubJubjub[1]),
    ]);
    const sharedKey = Keypair.genEcdhSharedKey(
        sellerPrivKey.privKey,
        buyerPubKey
    );
    const sharedKeyHash = hash2(sharedKey);
    const nonce = BigInt(order.nonce);
    assert.equal(sharedKeyHash, BigInt(order.sharedKeyCommitment));

    const m = await utilsProof.pyMakeInputsForGroth16Proof(
        `${proofPath}`,
        `${publicInputsPath}`,
        `${vkeyPath}`,
        `${pyProofOut}`
    );

    console.log('Python process returned:', m);

    const preparedProof = JSON.parse(
        fs.readFileSync(__dirname + '/../' + pyProofOut).toString()
    );
    const flattenedProof = utilsProof.flattenGroth16Proof(preparedProof);

    const enc = poseidonEncrypt(flattenedProof, sharedKey, nonce);

    const flattenedVkey = utilsProof.flattenGroth16Vkey(preparedProof);
    const vkeyHash = await utilsProof.hashGroth16Vkey(flattenedVkey, 12, 16);

    fs.unlinkSync(__dirname + '/../' + pyProofOut);

    const inputs = {
        ...preparedProof,
        encryptedProof: enc,
        vkHash: vkeyHash,
        poseidonNonce: nonce,
        sharedKey: sharedKey,
        sharedKeyHash: sharedKeyHash,
    };

    fs.writeFileSync(__dirname + '/' + outFile, JSON.stringify(inputs));
};

main()
    .then(() => {})
    .catch((err) => {
        console.log(err);
    });
