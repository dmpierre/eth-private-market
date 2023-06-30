import {
    MarketNavBar,
    MarketPageTop,
} from '@/components/market/market-components';
import { TopContainer } from '@/components/page-components';
import { useListingEvent, useListings } from '@/hooks/useListings';
import { JubJubPubKey, BidResult, Bid, Ask } from '@/types/types';
import { getListingRow } from '@/utils/listings';
import { formatBid } from '@/utils/formatListing';
import { useState } from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';
import { BidCard } from '@/components/market/bid-card';
import { ListingsTable } from '@/components/market/listings-table';
import { WaitForInfo } from '@/components/wait-info';
import { LOADING_SPINNER, useLoadingSpinner } from '@/hooks/useLoadingSpinner';

export default function Bids() {
    const { data, refetch } = useListings('bids');

    useListingEvent('Bid', refetch);
    useListingEvent('Fill', refetch);

    const isMounted = useIsMounted();
    const loadText = useLoadingSpinner(
        { spinner: LOADING_SPINNER },
        !isMounted
    );
    const [inspectingListing, setinspectingListing] = useState<
        undefined | Bid
    >();
    const bidElements: JSX.Element[] = [];

    if (data) {
        const n = data.pages[0].length;
        for (let i = n - 1; i >= 0; i -= 2) {
            const bidData = data.pages[0][i - 1];
            const pubKey = data.pages[0][i];

            if (bidData.result && pubKey.result) {
                const bid = formatBid(
                    bidData.result as BidResult,
                    pubKey.result as JubJubPubKey
                );
                bidElements.push(getListingRow(bid, setinspectingListing));
            }
        }
    }

    return (
        <>
            <TopContainer>
                <MarketPageTop></MarketPageTop>
                <MarketNavBar active='bids' />
                {inspectingListing ? (
                    <BidCard
                        manageView={false}
                        inspectingBid={inspectingListing}
                        setinspectingBid={setinspectingListing}
                    />
                ) : isMounted ? (
                    <ListingsTable
                        type="bids"
                        listingsElements={bidElements}
                        isMounted
                    />
                ) : (
                    <WaitForInfo loadText={loadText} description="Loading..." />
                )}
            </TopContainer>
        </>
    );
}
