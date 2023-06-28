import {
    EncryptedOrderData,
    MarketActionType,
    MarketObjectType,
    Order,
} from '@/types/types';
import { User } from 'private-market-utils/dist/lib/src/market';
import { EcdhSharedKey } from 'maci-crypto';

export const exportMarketKey = (
    user: User,
    action: string,
    nonce?: bigint,
    ecdh?: EcdhSharedKey,
    sharedKeyCommitment?: bigint,
    id?: bigint
) => {
    let data = {
        privJubJub: user.privJubJubKey.rawPrivKey.toString(),
        pubJubJubX: user.pubJubJubKey.rawPubKey[0].toString(),
        pubJubJubY: user.pubJubJubKey.rawPubKey[1].toString(),
        action: action,
        sharedKeyCommitment: '',
        nonce: '',
        askId: '',
        ecdh: [''],
    };

    if (sharedKeyCommitment) {
        data = {
            ...data,
            sharedKeyCommitment: sharedKeyCommitment.toString(),
        };
    }

    if (id !== undefined) {
        data = {
            ...data,
            askId: id.toString(), // askId or bidId
        };
    }

    const strEcdh: string[] = [];
    if (ecdh) {
        ecdh.forEach((value, key) => {
            strEcdh.push(value.toString());
        });
        data = {
            ...data,
            ecdh: strEcdh,
        };
    }

    if (nonce) {
        data = {
            ...data,
            nonce: nonce.toString(),
        };
    }
    return data;
};

export const exportEncryptedOrderData = (
    order: Order
): { encryptedData: EncryptedOrderData } => {
    let data;
    if (order.orderType == 0n) {
        data = order.orderedGroth16SigMerkleProof.encryptedProof;
    } else if (order.orderType == 1n) {
        data = order.orderedSignature.encryptedSignature;
    } else {
        data = order.orderedEthAddress.encryptedPrivKey;
    }

    data.forEach((value, key) => {
        data[key] = value.toString();
    });

    return {
        encryptedData: data,
    };
};

export const getObjectTypeFromActionType = (
    action: MarketActionType
): MarketObjectType => {
    switch (action) {
        case 'orderETHAddress':
            return 'ETHAddress';
        case 'orderSignature':
            return 'Signature';
        case 'orderSigMerkleGroth16Proof':
            return 'SigMerkleGroth16Proof';
        default:
            throw new Error('Invalid action type');
    }
};
