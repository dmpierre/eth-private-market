import path from 'node:path';
import fs from 'fs';
import { utilsBigint, utilsCrypto, utilsMarket } from 'private-market-utils';
import keccak256 from 'keccak256';

//@ts-ignore
import * as snarkjs from 'snarkjs';
import { getPublicKey, getSharedSecret, utils } from '@noble/secp256k1';
import { hash2 } from 'maci-crypto';
import assert from 'node:assert';
import { Keypair as JubJubKeyPair } from 'maci-domainobjs';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const main = async () => {
    const buyer = new utilsMarket.User(
        utilsCrypto.getRandomECDSAPrivKey(false)
    ); // buyer bids on an eth address

    const seller = new utilsMarket.User(
        utilsCrypto.getRandomECDSAPrivKey(false)
    );

    const nonce = Date.now().toString();

    const soldPrivateECDSAKeyBigInt = new utilsMarket.ECDSAKeyPair(
        seller.ecdsaKeypair.privECDSAKey
    );

    const sharedECDSA = getSharedSecret(
        seller.ecdsaKeypair.privECDSAKey,
        buyer.ecdsaKeypair.pubECDSAKey
    );

    const sharedKey = JubJubKeyPair.genEcdhSharedKey(
        seller.privJubJubKey,
        buyer.pubJubJubKey
    );
    const sharedKeyHash = hash2(sharedKey);

    const encryptedPrivECDSAKey =
        soldPrivateECDSAKeyBigInt.getPoseidonEncryptedPrivECDSAKey(
            sharedKey,
            nonce
        );

    const inputs = {
        sellerPubJubJub: seller.pubJubJubKey.asCircuitInputs(),
        sellerPrivJubJub: seller.privJubJubKey.asCircuitInputs(),
        buyerPubJubJub: buyer.pubJubJubKey.asCircuitInputs(),
        sharedKey: sharedKey,
        poseidonNonce: nonce,
        encryptedPrivECDSAKey: encryptedPrivECDSAKey,
        privECDSAKey: soldPrivateECDSAKeyBigInt.getPrivECDSAKeyAsTuple(),
    };

    const pathCircom = 'circom/eth-address/ecdh-check';
    const pathWasm = '/bin/sellETHAddressECDH_js/sellETHAddressECDH.wasm';
    const pathZkey = '/zkey/sellETHAddressECDH_1.zkey';

    console.log('Computing proof...');

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        path.join(pathCircom + pathWasm),
        path.join(pathCircom + pathZkey)
    );

    const addressOut = BigInt(publicSignals[0]).toString(16);
    const pub = utils
        .bytesToHex(soldPrivateECDSAKeyBigInt.pubECDSAKey)
        .slice(2); // remove '04' prefix
    const address = keccak256(Buffer.from(pub, 'hex'))
        .toString('hex')
        .slice(24, 64); // last 20 bytes

    assert.equal(
        addressOut,
        address,
        `Address is not correct, public signal: ${addressOut} != ${address}`
    );

    fs.writeFileSync(
        path.join(
            'scripts/out/eth-address/ecdh-check/inputsSellETHAddressECDH.json'
        ),
        JSON.stringify(inputs)
    );

    fs.writeFileSync(
        path.join(
            'scripts/out/eth-address/ecdh-check/proofSellETHAddressECDH.json'
        ),
        JSON.stringify(proof)
    );

    fs.writeFileSync(
        path.join(
            'scripts/out/eth-address/ecdh-check/publicSignalsSellETHAddressECDH.json'
        ),
        JSON.stringify(publicSignals)
    );

    fs.writeFileSync(
        path.join('scripts/out/eth-address/ecdh-check/sellerJubJub.json'),
        JSON.stringify({
            pub: seller.pubJubJubKey.rawPubKey,
            priv: seller.privJubJubKey.rawPrivKey,
        })
    );
    fs.writeFileSync(
        path.join('scripts/out/eth-address/ecdh-check/buyerJubJub.json'),
        JSON.stringify({
            pub: buyer.pubJubJubKey.rawPubKey,
            priv: buyer.privJubJubKey.rawPrivKey,
        })
    );

    const vkey = JSON.parse(
        fs
            .readFileSync(
                path.join(
                    pathCircom +
                        '/vkey/verification_key_sellETHAddressECDH.json'
                )
            )
            .toString()
    );
    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    return [res, addressOut, address];
};

main()
    .then((res) =>
        console.log(`Proof verified as: ${res[0]}, for address 0x${res[1]}`)
    )
    .catch((error) => console.log(error))
    .then(() => process.exit());
