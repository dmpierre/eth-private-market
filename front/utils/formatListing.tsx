import {
    Ask,
    AskResult,
    Bid,
    BidResult,
    JubJubPubKey,
    MarketObjectType,
} from '@/types/types';

export const formatBid = (bidResult: BidResult, pubKeyResult: JubJubPubKey) => {
    const bid: Bid = {
        type: 'bid',
        objectType: 'ETHAddress',
        id: bidResult[0],
        from: bidResult[1],
        status: bidResult[2],
        cancelBlock: bidResult[3],
        fromPubKey: pubKeyResult,
        poseidonNonce: bidResult[4],
        ethAddress: {
            keccakAddress: bidResult[5].keccakAddress,
            price: bidResult[5].price,
        },
        fill: {
            from: bidResult[6].from,
            fromPubkey: bidResult[6].fromPubkey,
            orderedEthAddress: {
                encryptedPrivKey:
                    bidResult[6].orderedEthAddress.encryptedPrivKey,
            },
        },
    };
    return bid;
};

export const getObjectType = (askResult: AskResult) => {
    const objectType: MarketObjectType =
        askResult[5].price != 0n
            ? 'SigMerkleGroth16Proof'
            : askResult[6].price != 0n
            ? 'Signature'
            : 'ETHAddress';
    return objectType;
};
export const formatAsk = (askResult: AskResult, pubKeyResult: JubJubPubKey) => {
    const objectType: MarketObjectType = getObjectType(askResult);

    const ask: Ask = {
        type: 'ask',
        id: askResult[0],
        ordersCounter: askResult[1]._value,
        from: askResult[2],
        status: askResult[3],
        cancelBlock: askResult[4],
        fromPubKey: pubKeyResult,
        sigMerkleGroth16Proof: askResult[5],
        signature: askResult[6],
        ethAddress: askResult[7],
        objectType,
    };

    return ask;
};
