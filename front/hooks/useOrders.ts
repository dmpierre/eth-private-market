import { useContractRead, useContractReads } from 'wagmi';
import { privateMarketABI } from '@/wagmi-src/generated';
import { PRIVATE_MARKET_ADDRESS, CHAIN_ID } from '@/app.conf';
import { Order } from '@/types/types';

export const useAskIDOrders = (askId: bigint | bigint[]) => {
    if (typeof askId === 'bigint') {
        // orders are for a single askId

        const { data, refetch } = useContractRead({
            address: PRIVATE_MARKET_ADDRESS,
            abi: privateMarketABI,
            functionName: `getOrdersForAskId`,
            chainId: CHAIN_ID,
            cacheTime: 2_000,
            args: [askId] as const,
        });

        const orders: Order[] = [];
        data?.forEach((order: any) => {
            orders.push({ ...order });
        });

        return { orders, refetch };
    } else {
        // orders are for multiple askIds
        // useful for the my-activity page
        //@ts-expect-error
        const contracts = [];

        askId.forEach((id) => {
            contracts.push({
                abi: privateMarketABI,
                address: PRIVATE_MARKET_ADDRESS,
                functionName: `getOrdersForAskId`,
                args: [id] as const,
                chainId: CHAIN_ID,
            });
        });

        const { data, refetch } = useContractReads({
            //@ts-expect-error
            contracts: contracts,
        });

        const orders: Order[] = [];
        data?.forEach((ask: any, i: number) => {
            ask.result?.forEach((order: any) => {
                orders.push(order);
            });
        });

        return {
            orders,
            refetch,
        };
    }
};
