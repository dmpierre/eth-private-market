import { CHAIN_ID, PRIVATE_MARKET_ADDRESS } from '@/app.conf';
import { privateMarketABI } from '@/wagmi-src/generated';
import { useContractWrite } from 'wagmi';
import { MarketActionType } from '@/types/types';
export const useBidAsk = (marketAction: MarketActionType) => {
    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: PRIVATE_MARKET_ADDRESS,
        abi: privateMarketABI,
        functionName: marketAction,
        chainId: CHAIN_ID
    });

    return {
        data,
        isLoading,
        isSuccess,
        write,
    };
};
