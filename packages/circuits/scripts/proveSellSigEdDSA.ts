import path from 'node:path';
import fs from 'fs';
import { utilsMarket, utilsCrypto } from 'private-market-utils';
import { Keypair as JubJubKeyPair } from 'maci-domainobjs';
import { hash2, sign } from 'maci-crypto';
import { poseidonEncrypt } from 'poseidon-encryption';

//@ts-expect-error - no typing provided with circom_tester
import * as snarkjs from 'snarkjs';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const main = async () => {
    // Buyer and Seller + ECDH
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
    const sharedKeyHash = hash2(sharedKeyBuyer);

    const message = hash2(buyer.pubJubJubKey.rawPubKey);
    const signature = sign(seller.privJubJubKey.rawPrivKey, message);
    const signaturePoseidonNonce = Date.now().toString();

    const encryptedSig = poseidonEncrypt(
        [signature.R8[0], signature.R8[1], signature.S],
        sharedKeySeller,
        signaturePoseidonNonce
    );

    const inputs = {
        pubKeyJubJubSeller: seller.pubJubJubKey.asCircuitInputs(),
        messagePreImage: buyer.pubJubJubKey.rawPubKey,
        message: message,
        sharedKey: sharedKeySeller,
        sharedKeyHash: sharedKeyHash,
        signaturePoseidonNonce: signaturePoseidonNonce,
        eddsaSigR8: signature.R8,
        eddsaSigS: signature.S,
        poseidonEncryptedSig: encryptedSig,
    };

    console.log('Computing proof...');
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        path.join(
            'circom/eddsa-signature/bin/mainSellSigPublicMessageEdDSA/mainSellSigPublicMessageEdDSA_js/mainSellSigPublicMessageEdDSA.wasm'
        ),
        path.join(
            'circom/eddsa-signature/zkey/mainSellSigPublicMessageEdDSA_1.zkey'
        )
    );

    // write inputs, proof and public signals in out folder
    fs.writeFileSync(
        path.join(
            'scripts/out/eddsa-signature/inputsmainSellSigPublicMessageEdDSA.json'
        ),
        JSON.stringify(inputs)
    );
    fs.writeFileSync(
        path.join(
            'scripts/out/eddsa-signature/proofmainSellSigPublicMessageEdDSA.json'
        ),
        JSON.stringify(proof)
    );
    fs.writeFileSync(
        path.join(
            'scripts/out/eddsa-signature/publicSignalsmainSellSigPublicMessageEdDSA.json'
        ),
        JSON.stringify(publicSignals)
    );

    fs.writeFileSync(
        path.join('scripts/out/eddsa-signature/sellerJubJub.json'),
        JSON.stringify({
            pub: seller.pubJubJubKey.rawPubKey,
            priv: seller.privJubJubKey.rawPrivKey,
        })
    );
    fs.writeFileSync(
        path.join('scripts/out/eddsa-signature/buyerJubJub.json'),
        JSON.stringify({
            pub: buyer.pubJubJubKey.rawPubKey,
            priv: buyer.privJubJubKey.rawPrivKey,
        })
    );

    const vkey = JSON.parse(
        fs
            .readFileSync(
                path.join(
                    'circom/eddsa-signature/vkey/verification_key_mainSellSigPublicMessageEdDSA.json'
                )
            )
            .toString()
    );
    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    return res;
};

main()
    .then((res) => console.log(`Proof verified as: ${res}`))
    .catch((reason) => console.log(reason))
    .then(() => process.exit());
