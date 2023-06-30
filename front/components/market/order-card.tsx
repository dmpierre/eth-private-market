import {
    Ask,
    AskResult,
    JubJubPubKey,
    MarketActionType,
    Order,
} from '@/types/types';
import {
    BackButton,
    FillButton,
    ProveButton,
    DownloadOrderButton,
} from './buttons';
import { useAccount, useContractReads, useContractWrite } from 'wagmi';
import { privateMarketABI } from '@/wagmi-src/generated';
import {
    BUCKET_URL,
    PRIVATE_MARKET_ADDRESS,
    SELL_ECDSA_NOECDH_ZKEY,
    SELL_EDDSA_SIG,
} from '@/app.conf';
import { formatAsk } from '@/utils/formatListing';
import { AskInspect } from './ask-inspect';
import { useEffect, useState } from 'react';
import { ConnectWallet } from '../wallet';
import { InputGroth16Proof, InputMarketKeys, InputPrivKey } from '../inputs';
import {
    prepareInputsSellETHAdddressNoECDH,
    prepareInputsSellEdDSASig,
} from '@/utils/contractUtils';
import { Keypair, PrivKey, PubKey } from 'maci-domainobjs';
import { hash2 } from 'maci-crypto';
import { WaitForInfo } from '../wait-info';
import { useLoadingSpinner, LOADING_SPINNER } from '@/hooks/useLoadingSpinner';

interface AcceptOrderProps {
    order: Order;
    ask: Ask;
}

const AcceptButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <button
            className="text-end border-4 py-1 px-3 hover:bg-gray-100 rounded-md"
            onClick={() => {
                onClick();
            }}
        >
            {' '}
            Accept{' '}
        </button>
    );
};

export const AcceptOrder: React.FC<AcceptOrderProps> = ({ ask, order }) => {
    const [acceptView, setacceptView] = useState(false);
    const [soldPriv, setsoldPriv] = useState<string | undefined>();

    const { address, isConnecting, isDisconnected, isConnected } = useAccount();

    // result of proving
    const [proof, setproof] = useState();
    const [publicSignals, setpublicSignals] = useState<bigint[] | string[] | undefined>();

    const [askKey, setaskKey] = useState<PrivKey | undefined>();
    const [commitment, setcommitment] = useState<bigint | undefined>();
    const [ecdh, setecdh] = useState<bigint[] | undefined>();
    const [commitmentFeedback, setcommitmentFeedback] = useState<
        string | undefined
    >();

    const { data, isLoading, isSuccess, write, error } = useContractWrite({
        address: PRIVATE_MARKET_ADDRESS,
        abi: privateMarketABI,
        functionName: ('acceptOrder' + `${ask.objectType}`) as MarketActionType,
    });
    const loadText = useLoadingSpinner({ spinner: LOADING_SPINNER }, isLoading);

    useEffect(() => {
        if (askKey) {
            const calculatedEcdh = Keypair.genEcdhSharedKey(
                askKey,
                new PubKey(order.fromPubKey)
            );
            const calculatedCommitment = hash2(calculatedEcdh);
            if (calculatedCommitment != order.sharedKeyCommitment) {
                setcommitmentFeedback('Commitment not matching.');
            } else {
                setecdh(calculatedEcdh as bigint[]);
                setcommitment(calculatedCommitment as bigint);
            }
        }
    }, [askKey, commitment, order.sharedKeyCommitment, order.fromPubKey]);

    return (
        <>
            {
                acceptView ? (
                    isConnected ? (
                        <>
                            {
                                proof && publicSignals && askKey && commitment == order.sharedKeyCommitment && ecdh ?
                                    // we have everything we need to accept the order. go to tx. 
                                    <div className="text-end">
                                        {
                                            isLoading ? (
                                                <WaitForInfo
                                                    description="Waiting for tx approval"
                                                    loadText={loadText}
                                                />
                                            ) : data ? (
                                                <div className="md:text-base pt-2 text-sm">
                                                    {isSuccess ? (
                                                        <>
                                                            Tx:{' '}
                                                            {data?.hash.slice(0, 10) +
                                                                '...'}
                                                        </>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                            ) : error ? (
                                                <>Tx reverted</>
                                            ) : (
                                                <FillButton
                                                    disabled={false}
                                                    proof={proof}
                                                    publicSignals={
                                                        publicSignals
                                                    }
                                                    write={write}
                                                    args={[ask.id, order.id]}
                                                />
                                            )
                                        }
                                    </div>
                                    :

                                    ask.objectType == 'SigMerkleGroth16Proof' ?
                                        // specific flow for sig merkle proof. the proof is already generated and uploaded by the user
                                        <>
                                            <InputMarketKeys setmarketKey={setaskKey} />
                                            <InputGroth16Proof
                                                setgroth16PublicSignals={
                                                    setpublicSignals
                                                }
                                                setgroth16Proof={
                                                    setproof
                                                }
                                            />
                                        </>
                                        :
                                        <>
                                            <InputMarketKeys setmarketKey={setaskKey} />
                                            {
                                                ask.objectType == 'ETHAddress' ?
                                                    <InputPrivKey setsoldPriv={setsoldPriv} />
                                                    :
                                                    <InputPrivKey setsoldPriv={setsoldPriv} type="eddsa" />
                                            }
                                            {
                                                soldPriv && ecdh && commitment ?
                                                    <div className="text-end">
                                                        {
                                                            // generate proof
                                                            ask.objectType == 'ETHAddress' ?
                                                                <ProveButton
                                                                    inputs={prepareInputsSellETHAdddressNoECDH(
                                                                        order,
                                                                        ecdh,
                                                                        commitment,
                                                                        soldPriv
                                                                    )}
                                                                    wasmName="sellETHAddressNoECDH.wasm"
                                                                    disabled={soldPriv == undefined}
                                                                    setpublicSignals={
                                                                        setpublicSignals
                                                                    }
                                                                    setproof={setproof}
                                                                    zkeyUrl={
                                                                        BUCKET_URL +
                                                                        SELL_ECDSA_NOECDH_ZKEY
                                                                    }
                                                                    customButtonText="Prove"
                                                                />
                                                                : <ProveButton
                                                                    inputs={prepareInputsSellEdDSASig(
                                                                        order,
                                                                        ecdh,
                                                                        commitment,
                                                                        soldPriv
                                                                    )}
                                                                    wasmName="mainSellSigPublicMessageEdDSA.wasm"
                                                                    disabled={soldPriv == undefined}
                                                                    setpublicSignals={
                                                                        setpublicSignals
                                                                    }
                                                                    setproof={setproof}
                                                                    zkeyUrl={
                                                                        BUCKET_URL + SELL_EDDSA_SIG
                                                                    }
                                                                    customButtonText="Prove"
                                                                />
                                                        }
                                                    </div>
                                                    :
                                                    <></>
                                            }
                                        </>

                            }
                        </>
                    ) : (
                        <ConnectWallet />
                    )
                ) : (
                    <div className="flex items-center space-x-5 justify-end">
                        <div>
                            <DownloadOrderButton ask={ask} order={order} />
                        </div>
                        <div className=" text-end">
                            <AcceptButton onClick={() => setacceptView(true)} />
                        </div>
                    </div>
                )
            }
        </>
    );
};

export const AcceptSigOrder: React.FC<AcceptOrderProps> = ({ ask, order }) => {
    return <></>;
};

export const AcceptProofOrder: React.FC<AcceptOrderProps> = ({
    ask,
    order,
}) => {
    return <></>;
};

interface OrderCardProps {
    order: Order;
    setinspectingOrder: React.Dispatch<React.SetStateAction<Order | undefined>>;
    action: 'accept' | 'cancel' | 'download';
}

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    setinspectingOrder,
    action,
}) => {
    // for viewing orders either from an ask-card or from the my-activity page
    // can do 3 things from an order card.
    // 1. accept the order --> from my-activity page --> manage --> accept if active
    // 2. cancel the order. --> from my-activity page --> manage --> cancel if active
    // 3. download the filled order data --> manage --> download if filled
    const { data, error } = useContractReads({
        contracts: [
            {
                abi: privateMarketABI,
                address: PRIVATE_MARKET_ADDRESS,
                functionName: 'asks',
                args: [order.askId],
            },
            {
                abi: privateMarketABI,
                address: PRIVATE_MARKET_ADDRESS,
                functionName: 'getAskPubKey',
                args: [order.askId],
            },
        ],
    });

    let ask: Ask | undefined;
    if (!error && data) {
        ask = formatAsk(
            data[0].result as AskResult,
            data[1].result as JubJubPubKey
        );
    }

    const orderType =
        order.orderType == 0n
            ? 'proof'
            : order.orderType == 1n
                ? 'signature'
                : 'address';
    const status = order.status == 1n ? 'open' : 'closed';

    return (
        <div className="flex flex-col space-y-2">
            <div className="text-center">
                <BackButton setbackToPage={setinspectingOrder} />
            </div>
            {ask ? (
                <div className="border-4 p-2 md:text-base text-sm rounded-md flex-col space-y-3 ">
                    <AskInspect inspectingAsk={ask} />
                </div>
            ) : (
                <></>
            )}
            <div className="border-4 p-2 md:text-base text-sm rounded-md flex-col space-y-3 ">
                <div>
                    {' '}
                    <span className="font-bold">Order ID</span>:{' '}
                    {order.id.toString()}
                </div>
                <div>
                    {' '}
                    <span className="font-bold">From</span>: {order.from}
                </div>
                <div>
                    {' '}
                    <span className="font-bold">Key Commitment</span>:{' '}
                    {order.sharedKeyCommitment.toString().slice(0, 10) + '...'}{' '}
                </div>
                <div>
                    {' '}
                    <span className="font-bold">Nonce</span>:{' '}
                    {order.poseidonNonce.toString()}
                </div>
                <div>
                    {' '}
                    <span className="font-bold">Status</span>: {status}
                </div>
            </div>
            <div className="p-2 space-y-2 pt-2">
                {action == 'accept' && ask ? (
                    <AcceptOrder ask={ask} order={order} />
                ) : action == 'cancel' && order.status == 1n ? (
                    <div> Cancel Order </div>
                ) : ask ? (
                    <div className="text-end">
                        {' '}
                        <DownloadOrderButton ask={ask} order={order} />{' '}
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};
