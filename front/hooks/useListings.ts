import {
    paginatedIndexesConfig,
    useContractEvent,
    useContractInfiniteReads,
    useContractRead,
} from 'wagmi';
import { privateMarketABI } from '@/wagmi-src/generated';
import { PRIVATE_MARKET_ADDRESS, CHAIN_ID } from '@/app.conf';
import { StringETHAddress } from '@/types/types';

export const privateMarketContractConfig = {
    address: PRIVATE_MARKET_ADDRESS as `0x${StringETHAddress}`,
    abi: privateMarketABI,
    chainId: CHAIN_ID,
};

export const useListingEvent = (
    eventName:
        | 'Ask'
        | 'Bid'
        | 'Order'
        | 'Fill'
        | 'OrderAccepted'
        | 'OrderCancelled'
        | 'BidCancelled'
        | 'AskCancelled',
    refetch: any
) => {
    useContractEvent({
        address: PRIVATE_MARKET_ADDRESS,
        abi: privateMarketABI,
        eventName: eventName,
        chainId: CHAIN_ID,
        listener: (event) => {
            refetch();
        },
    });
};

export const useListings = (listingType: 'bids' | 'asks') => {
    const getPubKeyFunction =
        listingType === 'bids' ? 'getBidPubKey' : 'getAskPubKey';
    const getPriceFunction =
        listingType === 'bids' ? 'getBidPrice' : 'getAskPrice';

    const nReads = useContractRead({
        address: PRIVATE_MARKET_ADDRESS,
        abi: privateMarketABI,
        functionName: `${listingType}Counter`,
        chainId: CHAIN_ID,
        cacheTime: 2_000,
    });

    const n = nReads.data ? Number(nReads.data) : 0;

    const { data, fetchNextPage, refetch } = useContractInfiniteReads({
        cacheKey: listingType,
        ...paginatedIndexesConfig(
            (index: bigint) => {
                return [
                    {
                        ...privateMarketContractConfig,
                        functionName: listingType,
                        args: [index] as const,
                    },
                    {
                        ...privateMarketContractConfig,
                        functionName: getPubKeyFunction,
                        args: [index] as const,
                    },
                ];
            },
            { start: 0, perPage: n, direction: 'increment' }
        ),
    });

    return { data, n, refetch };
};
