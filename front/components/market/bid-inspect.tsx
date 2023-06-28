import { Bid } from '@/types/types';
import { formatPubJubJubKey } from '@/utils/crypto';
import { useState } from 'react';
import { formatEther } from 'viem';

interface BidInspectProps {
    inspectingBid: Bid;
}

export const BidInspect: React.FC<BidInspectProps> = ({ inspectingBid }) => {
    return (
        <>
            <div className="font-mono font-bold">Bid - ETH Address</div>
            <div>
                {' '}
                <span className="font-mono font-bold"> Bid ID</span>:{' '}
                {inspectingBid.id.toString()}
            </div>
            <div className="text-ellipsis overflow-clip">
                <span className="md:text-base font-bold">Bidder</span>:{' '}
                {inspectingBid.from}
            </div>
            <div className="text-ellipsis overflow-clip">
                <span className="font-mono font-bold">For</span>:
                <span className="md:text-base ">
                    {' ' + inspectingBid.ethAddress.keccakAddress}
                </span>
            </div>
            <div>
                <span className="font-mono font-bold">Price</span>:
                {' ' + formatEther(inspectingBid.ethAddress.price).toString()}{' '}
                ETH
            </div>
            <div>
                <span className="font-mono font-bold">Public key</span> :
                {formatPubJubJubKey(inspectingBid.fromPubKey)}
            </div>
        </>
    );
};
