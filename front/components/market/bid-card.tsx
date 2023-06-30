import {
    BUCKET_URL,
    PRIVATE_MARKET_ADDRESS,
    SELL_ECDSA_ECDH_ZKEY,
} from '@/app.conf';
import { BidCardProps, ZERO_ADDRESS } from '@/types/types';
import { useState } from 'react';
import { useAccount, useContractWrite } from 'wagmi';
import { privateMarketABI } from '../../wagmi-src/generated';
import {
    BackButton,
    CancelButton,
    DownloadBidButton,
    FillButton,
    ProveButton,
} from './buttons';
import { BidInspect } from './bid-inspect';
import { prepareInputsSellETHAddressECDH } from '@/utils/contractUtils';
import { ConnectWallet } from '../wallet';
import { ECDSAKeyPair } from 'private-market-utils/lib/browser';

export const BidCard: React.FC<BidCardProps> = ({
    inspectingBid,
    setinspectingBid,
    manageView
}) => {
    //@ts-expect-error
    const snarkjs = window.snarkjs;

    const [fillView, setfillView] = useState(false);
    const [proof, setproof] = useState();
    const [publicSignals, setpublicSignals] = useState<
        undefined | string[] | bigint[]
    >();
    const { address, isConnecting, isDisconnected, isConnected } = useAccount();
    const [privatekeyFeedback, setprivatekeyFeedback] = useState<
        string | undefined
    >();
    const { data, isLoading, isSuccess, write, error } = useContractWrite({
        address: PRIVATE_MARKET_ADDRESS,
        abi: privateMarketABI,
        functionName: 'fillETHAddressBid',
    });
    const [soldPriv, setsoldPriv] = useState<undefined | string>();

    const isFilled = inspectingBid.fill.from != ZERO_ADDRESS;
    const button =
        inspectingBid.status == BigInt(1) && !proof && !publicSignals ? (
            <button
                onClick={() => setfillView(true)}
                className="border-4 px-4 py-1 rounded-md hover:bg-gray-100 text-end"
            >
                Fill
            </button>
        ) : (
            <></>
        );

    return (
        <div className="flex flex-col space-y-2">
            <div className="text-center">
                <BackButton setbackToPage={setinspectingBid} />
            </div>
            <div className="border-4 p-2 md:text-base text-sm rounded-md flex-col space-y-3 ">
                <BidInspect inspectingBid={inspectingBid} />
            </div>
            {
                fillView ? <></> :
                    manageView ?
                        inspectingBid.status == BigInt(1) ?
                            <div className='text-end'>
                                <CancelButton cancelData={{ bid: inspectingBid, cancelType: 'Bid' }} />
                            </div>
                            : <></>
                        :
                        <div className="text-end">{button}</div>
            }
            {isFilled ? (
                <div className="flex flex-col space-y-3 text-end">
                    <div className="md:text-base text-sm text-ellipsis overflow-clip rounded-md space-y-3">
                        <span className="font-bold">Filled</span>:{' '}
                        {inspectingBid.fill.from}
                    </div>
                    <DownloadBidButton bid={inspectingBid} />
                </div>
            ) : (
                <></>
            )}
            {fillView ? (
                <div>
                    {!proof && !publicSignals ? (
                        <div className="p-2 space-y-2 pt-2">
                            <div>
                                <input
                                    onChange={(e) => {
                                        try {
                                            const privKey = BigInt(
                                                '0x' + e.target.value
                                            );
                                            const soldKey = new ECDSAKeyPair(
                                                privKey
                                            );
                                            setsoldPriv(e.target.value);
                                            setprivatekeyFeedback(undefined);
                                        } catch (error) {
                                            setsoldPriv(undefined);
                                            setprivatekeyFeedback(
                                                'Invalid private key value(s)'
                                            );
                                        }
                                    }}
                                    type="password"
                                    className="border-b-2 truncate focus:outline-none"
                                    placeholder="Hex private key"
                                />
                                <span> {privatekeyFeedback}</span>
                            </div>
                            {soldPriv && !privatekeyFeedback ? (
                                <div className="text-end">
                                    <ProveButton
                                        disabled={
                                            privatekeyFeedback != undefined
                                        }
                                        setproof={setproof}
                                        setpublicSignals={setpublicSignals}
                                        inputs={prepareInputsSellETHAddressECDH(
                                            inspectingBid,
                                            soldPriv
                                        )}
                                        wasmName="sellETHAddressECDH.wasm"
                                        zkeyUrl={
                                            BUCKET_URL + SELL_ECDSA_ECDH_ZKEY
                                        }
                                    />
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    ) : (
                        <></>
                    )}
                    {proof && publicSignals && !isSuccess ? (
                        <div className="text-end">
                            {isConnected ? (
                                <FillButton
                                    disabled={error != undefined}
                                    proof={proof}
                                    publicSignals={publicSignals}
                                    write={write}
                                    args={[inspectingBid.id]}
                                />
                            ) : (
                                <ConnectWallet />
                            )}
                        </div>
                    ) : (
                        <></>
                    )}
                    {error ? (
                        <div>Tx reverted</div>
                    ) : data?.hash ? (
                        <div className="md:text-base pt-2 text-sm">
                            Tx: {data?.hash.slice(0, 10) + '...'}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};
