import path from 'node:path';
import fs from 'fs';
import { utilsCrypto, utilsMarket } from 'private-market-utils';
import keccak256 from 'keccak256';

//@ts-ignore
import * as snarkjs from 'snarkjs';
import { getPublicKey, getSharedSecret, utils } from '@noble/secp256k1';
import { hash2 } from 'maci-crypto';
import assert from 'node:assert';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const main = async () => {
    const buyer = new utilsMarket.User(
        utilsCrypto.getRandomECDSAPrivKey(false)
    );
    const buyerECDSAPriv = buyer.ecdsaKeypair.privECDSAKey;
    const buyerECDSAPub = getPublicKey(buyerECDSAPriv);

    const seller = new utilsMarket.User(
        utilsCrypto.getRandomECDSAPrivKey(false)
    );
    const sellerECDSAPriv = seller.ecdsaKeypair.privECDSAKey;
    const sellerECDSAPub = getPublicKey(sellerECDSAPriv);
    const sharedECDSA = getSharedSecret(buyerECDSAPriv, sellerECDSAPub);

    const sharedKey = utilsCrypto.getJubJubKeyPairFromECDSAPrivKey(
        BigInt('0x' + utils.bytesToHex(sharedECDSA))
    ).pubKey.rawPubKey;
    const sharedKeyHash = hash2(sharedKey);

    const nonce = Date.now().toString();

    const soldPrivateECDSAKeyBigInt = new utilsMarket.ECDSAKeyPair(
        sellerECDSAPriv
    );

    const encryptedPrivECDSAKey =
        soldPrivateECDSAKeyBigInt.getPoseidonEncryptedPrivECDSAKey(
            sharedKey,
            nonce
        );

    const inputs = {
        sharedKey: sharedKey,
        sharedKeyHash: sharedKeyHash,
        poseidonNonce: nonce,
        encryptedPrivECDSAKey: encryptedPrivECDSAKey,
        privECDSAKey: soldPrivateECDSAKeyBigInt.getPrivECDSAKeyAsTuple(),
    };

    const pathCircom = 'circom/eth-address/no-ecdh-check';
    const pathWasm = '/bin/sellETHAddressNoECDH_js/sellETHAddressNoECDH.wasm';
    const pathZkey = '/zkey/sellETHAddressNoECDH_1.zkey';

    console.log('Computing proof...');

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        path.join(pathCircom + pathWasm),
        path.join(pathCircom + pathZkey)
    );

    const addressOut = BigInt(publicSignals[0]).toString(16);
    const pub = utils.bytesToHex(sellerECDSAPub).slice(2); // remove '04' prefix
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
            'scripts/out/eth-address/no-ecdh-check/inputsSellETHAddressNoECDH.json'
        ),
        JSON.stringify(inputs)
    );

    fs.writeFileSync(
        path.join(
            'scripts/out/eth-address/no-ecdh-check/proofSellETHAddressNoECDH.json'
        ),
        JSON.stringify(proof)
    );

    fs.writeFileSync(
        path.join(
            'scripts/out/eth-address/no-ecdh-check/publicSignalsSellETHAddressNoECDH.json'
        ),
        JSON.stringify(publicSignals)
    );

    fs.writeFileSync(
        path.join('scripts/out/eth-address/no-ecdh-check/sellerJubJub.json'),
        JSON.stringify({
            pub: seller.pubJubJubKey.rawPubKey,
            priv: seller.privJubJubKey.rawPrivKey,
        })
    );
    fs.writeFileSync(
        path.join('scripts/out/eth-address/no-ecdh-check/buyerJubJub.json'),
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
                        '/vkey/verification_key_sellETHAddressNoECDH.json'
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
