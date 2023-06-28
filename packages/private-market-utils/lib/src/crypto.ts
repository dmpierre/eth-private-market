import { getSharedSecret, utils } from '@noble/secp256k1';
import {
    PrivKey as JubJubPrivKey,
    Keypair as JubJubKeyPair,
} from 'maci-domainobjs';
import { formatPrivKeyForBabyJub } from 'maci-crypto';

export function getRandomECDSAPrivKey<T extends boolean>(
    asUint8Array: T
): T extends true ? Uint8Array : bigint;
export function getRandomECDSAPrivKey(
    asUint8Array: boolean
): Uint8Array | bigint {
    const soldPrivateECDSAKey = utils.randomPrivateKey();
    if (asUint8Array) {
        return soldPrivateECDSAKey;
    }
    const soldPrivateECDSAKeyBigInt = BigInt(
        '0x' + utils.bytesToHex(soldPrivateECDSAKey)
    );
    return soldPrivateECDSAKeyBigInt;
}

export const getJubJubKeyPairFromECDSAPrivKey = (
    privECDSAKey: bigint
): JubJubKeyPair => {
    const privJubJub: JubJubPrivKey = new JubJubPrivKey(
        formatPrivKeyForBabyJub(privECDSAKey)
    );
    return new JubJubKeyPair(privJubJub);
};

export const ecdh = (priv: bigint, pub: Uint8Array) => {
    const shared = getSharedSecret(priv, pub);
    const sharedKey = getJubJubKeyPairFromECDSAPrivKey(
        BigInt('0x' + utils.bytesToHex(shared))
    ).pubKey.rawPubKey;
    return sharedKey;
};
