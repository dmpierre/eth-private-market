import { getRandomECDSAPrivKey } from '@/../packages/private-market-utils/dist/lib/src/crypto';
import {
    User,
    ECDSAKeyPair,
} from '@/../packages/private-market-utils/dist/lib/src/market';
import { Ask, Bid, Order } from '@/types/types';
import { Keypair, PubKey, PrivKey } from 'maci-domainobjs';
import { hash2, sign } from 'maci-crypto';
import { p256 } from '@/utils/solidity';
//@ts-ignore
import { utils } from 'ffjavascript';
import { poseidonEncrypt } from 'poseidon-encryption';

export const initUser = () => {
    const user = new User(getRandomECDSAPrivKey(false));
    const nonce = BigInt(Date.now().toString());
    const pubJubjub = user.jubJubKeypair.pubKey.rawPubKey as [bigint, bigint];
    return {
        user,
        nonce,
        pubJubjub,
    };
};

export const prepareInputsOrder = (ask: Ask) => {
    const { user, nonce, pubJubjub } = initUser();
    const sellerJubJub = new PubKey(ask.fromPubKey);
    const ecdh = Keypair.genEcdhSharedKey(
        user.jubJubKeypair.privKey,
        sellerJubJub
    );
    const sharedKeyCommitment = hash2(ecdh);
    return {
        user,
        pubJubjub,
        nonce,
        ecdh,
        sharedKeyCommitment,
    };
};

export const prepareInputsSellETHAdddressNoECDH = (
    order: Order,
    sharedKey: bigint[],
    keyCommitment: bigint,
    priv: string
) => {
    const privKey = BigInt('0x' + priv);
    const soldKey = new ECDSAKeyPair(privKey);
    const encrypted = soldKey.getPoseidonEncryptedPrivECDSAKey(
        sharedKey,
        order.poseidonNonce.toString()
    );

    const inputs = {
        sharedKey: sharedKey,
        sharedKeyHash: keyCommitment,
        poseidonNonce: order.poseidonNonce,
        encryptedPrivECDSAKey: encrypted,
        privECDSAKey: soldKey.getPrivECDSAKeyAsTuple(),
    };
    return inputs;
};

export const prepareInputsSellEdDSASig = (
    order: Order,
    sharedKey: bigint[],
    keyCommitment: bigint,
    priv: string
) => {
    const sellerPriv = new PrivKey(BigInt(priv));
    const keypair = new Keypair(sellerPriv);
    const messagePreImage = new PubKey(order.fromPubKey);
    const message = hash2(messagePreImage.rawPubKey);
    const signature = sign(sellerPriv.rawPrivKey, message);

    const encryptedSig = poseidonEncrypt(
        [signature.R8[0], signature.R8[1], signature.S],
        sharedKey,
        order.poseidonNonce.toString()
    );
    const inputs = {
        pubKeyJubJubSeller: keypair.pubKey.asCircuitInputs(),
        messagePreImage: messagePreImage.rawPubKey,
        message: message,
        sharedKey: sharedKey,
        sharedKeyHash: keyCommitment,
        signaturePoseidonNonce: order.poseidonNonce,
        eddsaSigR8: signature.R8,
        eddsaSigS: signature.S,
        poseidonEncryptedSig: encryptedSig,
    };
    return inputs;
};

export const prepareInputsSellETHAddressECDH = (
    inspectingBid: Bid,
    priv: string
) => {
    const seller = new User(getRandomECDSAPrivKey(false));
    const buyerJubjub = new PubKey(inspectingBid.fromPubKey);

    const ecdh = Keypair.genEcdhSharedKey(seller.privJubJubKey, buyerJubjub);

    const nonce = inspectingBid.poseidonNonce.toString();
    const privKey = BigInt('0x' + priv);
    const soldKey = new ECDSAKeyPair(privKey);
    const encrypted = soldKey.getPoseidonEncryptedPrivECDSAKey(ecdh, nonce);
    const privkeyFormatted = soldKey.getPrivECDSAKeyAsTuple();
    const inputs = {
        sellerPubJubJub: seller.pubJubJubKey.asCircuitInputs(),
        sellerPrivJubJub: seller.privJubJubKey.asCircuitInputs(),
        buyerPubJubJub: buyerJubjub.asCircuitInputs(),
        sharedKey: ecdh,
        poseidonNonce: nonce,
        encryptedPrivECDSAKey: encrypted,
        privECDSAKey: privkeyFormatted,
    };
    return inputs;
};
export const prepareCallData = (proof: any, publicSignals: any) => {
    proof = utils.unstringifyBigInts(proof);
    publicSignals = utils.unstringifyBigInts(publicSignals);
    const pi_a = [p256(proof.pi_a[0]), p256(proof.pi_a[1])];
    const pi_b = [
        [p256(proof.pi_b[0][1]), p256(proof.pi_b[0][0])],
        [p256(proof.pi_b[1][1]), p256(proof.pi_b[1][0])],
    ];
    const pi_c = [p256(proof.pi_c[0]), p256(proof.pi_c[1])];
    const pubInputs = [];
    for (let i = 0; i < publicSignals.length; i++) {
        pubInputs.push(p256(publicSignals[i]));
    }
    return {
        pi_a,
        pi_b,
        pi_c,
        pubInputs,
    };
};
