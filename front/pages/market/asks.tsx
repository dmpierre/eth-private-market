import {
    MarketNavBar,
    MarketPageTop,
} from '@/components/market/market-components';
import { TopContainer } from '@/components/page-components';
import { useListingEvent, useListings } from '@/hooks/useListings';
import { JubJubPubKey, Ask, AskResult } from '@/types/types';
import { getListingRow } from '@/utils/listings';
import { useState } from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';
import { ListingsTable } from '@/components/market/listings-table';
import { formatAsk } from '@/utils/formatListing';
import { AskCard } from '@/components/market/ask-card';
import { WaitForInfo } from '@/components/wait-info';
import { LOADING_SPINNER, useLoadingSpinner } from '@/hooks/useLoadingSpinner';
import { useNetwork } from 'wagmi';
import { CHAIN_ID } from '@/app.conf';
import { ConnectWallet } from '@/components/wallet';

export default function Asks() {
    const { data, refetch } = useListings('asks');
    useListingEvent('Ask', refetch);
    const isMounted = useIsMounted();
    const [inspectingListing, setinspectingListing] = useState<
        undefined | Ask
    >();
    const askElements: JSX.Element[] = [];
    const loadText = useLoadingSpinner(
        { spinner: LOADING_SPINNER },
        !isMounted
    );

    const { chain } = useNetwork();
    if (data) {
        const n = data.pages[0].length;

        for (let i = n - 1; i >= 0; i -= 2) {
            const askData = data.pages[0][i - 1];

            const pubKey = data.pages[0][i];
            if (askData.result && pubKey.result) {
                const ask = formatAsk(
                    askData.result as AskResult,
                    pubKey.result as JubJubPubKey
                );
                if (ask) {
                    askElements.push(getListingRow(ask, setinspectingListing));
                }
            }
        }
    }

    return (
        <>
            <TopContainer>
                <MarketPageTop></MarketPageTop>
                <MarketNavBar active="asks" />
                {chain?.id == CHAIN_ID ? (
                    <div className="white-background">
                        {inspectingListing ? (
                            <AskCard
                                inspectingAsk={inspectingListing}
                                setinspectingAsk={setinspectingListing}
                            />
                        ) : isMounted ? (
                            <ListingsTable
                                type="asks"
                                listingsElements={askElements}
                                isMounted
                            />
                        ) : (
                            <WaitForInfo
                                loadText={loadText}
                                description="Loading..."
                            />
                        )}
                    </div>
                ) : (
                    <ConnectWallet />
                )}
            </TopContainer>
        </>
    );
}
