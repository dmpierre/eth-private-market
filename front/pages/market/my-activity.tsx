import { AskCard } from '@/components/market/ask-card';
import { BidCard } from '@/components/market/bid-card';
import { ListingsTable } from '@/components/market/listings-table';
import {
    MarketNavBar,
    MarketPageTop,
} from '@/components/market/market-components';
import { OrderCard } from '@/components/market/order-card';
import { TopContainer } from '@/components/page-components';
import { WaitForInfo } from '@/components/wait-info';
import { ConnectWallet } from '@/components/wallet';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useListingEvent, useListings } from '@/hooks/useListings';
import { LOADING_SPINNER, useLoadingSpinner } from '@/hooks/useLoadingSpinner';
import { useAskIDOrders } from '@/hooks/useOrders';
import {
    Ask,
    AskResult,
    Bid,
    BidResult,
    JubJubPubKey,
    Order,
} from '@/types/types';
import { formatAsk, formatBid } from '@/utils/formatListing';
import { getListingRow, getOrderRow } from '@/utils/listings';
import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function MyActivity() {
    const [inspectingOrder, setinspectingOrder] = useState<undefined | Order>();
    const { data: askData, refetch: refetchAsks } = useListings('asks');
    const { data: bidsData, refetch: refetchBids } = useListings('bids');
    const { address, isConnecting, isDisconnected, isConnected } = useAccount();
    const isMounted = useIsMounted();

    useListingEvent('Ask', refetchAsks);
    useListingEvent('AskCancelled', refetchAsks);
    useListingEvent('Bid', refetchBids);
    useListingEvent('BidCancelled', refetchBids);

    const loadText = useLoadingSpinner(
        { spinner: LOADING_SPINNER },
        !isMounted
    );
    const [inspectingAsk, setinspectingAsk] = useState<undefined | Ask>();
    const [inspectingBid, setinspectingBid] = useState<undefined | Bid>();
    const askElements: JSX.Element[] = [];
    const askIds: bigint[] = [];

    if (askData) {
        const n = askData.pages[0].length;
        for (let i = n - 1; i >= 0; i -= 2) {
            const askResult = askData.pages[0][i - 1];
            const pubKey = askData.pages[0][i];
            if (askResult.result) {
                const ask = formatAsk(
                    askResult.result as AskResult,
                    pubKey.result as JubJubPubKey
                );
                askIds.push(ask.id);
                if (ask.from == address) {
                    askElements.push(
                        getListingRow(ask, setinspectingAsk, 'Manage')
                    );
                }
            }
        }
    }

    const { orders: ordersData, refetch: refetchOrders } =
        useAskIDOrders(askIds);
    const orderElements: JSX.Element[] = [];
    if (ordersData) {
        ordersData.forEach((order: Order) => {
            if (order.from == address) {
                orderElements.push(getOrderRow(order, setinspectingOrder));
            }
        });
    }

    useListingEvent('Order', refetchOrders);
    useListingEvent('OrderAccepted', refetchOrders);
    useListingEvent('OrderCancelled', refetchOrders);

    const bidElements: JSX.Element[] = [];
    const fillsElements: JSX.Element[] = [];

    if (bidsData) {
        const n = bidsData.pages[0].length;

        for (let i = n - 1; i >= 0; i -= 2) {
            const bidResult = bidsData.pages[0][i - 1];
            const pubKey = bidsData.pages[0][i];
            if (bidResult.result) {
                const bid = formatBid(
                    bidResult.result as BidResult,
                    pubKey.result as JubJubPubKey
                );
                if (bid.from == address) {
                    bidElements.push(
                        getListingRow(bid, setinspectingBid, 'Manage')
                    );
                }
                if (bid.fill.from == address) {
                    fillsElements.push(
                        getListingRow(bid, setinspectingBid, 'Details')
                    );
                }
            }
        }
    }

    return (
        <TopContainer>
            <MarketPageTop></MarketPageTop>
            <MarketNavBar active='activity'/>
            {isMounted ? (
                isConnected ? (
                    inspectingBid ? (
                        <BidCard
                            manageView={true}
                            inspectingBid={inspectingBid}
                            setinspectingBid={setinspectingBid}
                        />
                    ) : inspectingAsk ? (
                        <AskCard
                            inspectingAsk={inspectingAsk}
                            setinspectingAsk={setinspectingAsk}
                            manageView={true}
                        />
                    ) : inspectingOrder ? (
                        <OrderCard
                            order={inspectingOrder}
                            setinspectingOrder={setinspectingOrder}
                            action="cancel"
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="font-mono underline underline-offset-4">
                                My asks
                            </div>
                            <ListingsTable
                                type="asks"
                                listingsElements={askElements}
                                isMounted
                            />
                            <div className="font-mono underline underline-offset-4">
                                My orders
                            </div>
                            <ListingsTable
                                type="orders"
                                listingsElements={orderElements}
                                isMounted
                            />
                            <div className="font-mono underline underline-offset-4">
                                My bids
                            </div>
                            <ListingsTable
                                type="bids"
                                listingsElements={bidElements}
                                isMounted
                            />
                            <div className="font-mono underline underline-offset-4">
                                My fills
                            </div>
                            <ListingsTable
                                type="bids"
                                listingsElements={fillsElements}
                                isMounted
                            />
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center space-y-4">
                        <ConnectWallet />
                    </div>
                )
            ) : (
                <></>
            )}
        </TopContainer>
    );
}
