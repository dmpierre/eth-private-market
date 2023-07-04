import { CHAIN_ID, PRIVATE_MARKET_ADDRESS } from '@/app.conf';
import { Ask, Order } from '@/types/types';
import { privateMarketABI } from '@/wagmi-src/generated';
import { useState } from 'react';
import { useAccount, useContractWrite, useNetwork } from 'wagmi';
import { BackButton, CancelButton, DownloadAskButton } from './buttons';
import { AskInspect } from './ask-inspect';
import { WaitForInfo } from '../wait-info';
import { LOADING_SPINNER, useLoadingSpinner } from '@/hooks/useLoadingSpinner';
import { ConnectWallet } from '../wallet';
import { prepareInputsOrder } from '@/utils/contractUtils';
import { hashPersonalMessage } from 'ethereumjs-util';
import {
    bigint_to_array,
    Uint8Array_to_bigint,
} from 'private-market-utils/lib/browser';
import { hash2 } from 'maci-crypto';
import { useAskIDOrders } from '@/hooks/useOrders';
import { ListingsTable } from './listings-table';
import { useIsMounted } from '@/hooks/useIsMounted';
import { getOrderRow } from '@/utils/listings';
import { useListingEvent } from '@/hooks/useListings';
import { OrderCard } from './order-card';
import { User } from 'private-market-utils/lib/browser';
import { EcdhSharedKey } from 'maci-crypto';
import { exportMarketKey } from '@/utils/misc';

export interface AskCardProps {
    inspectingAsk: Ask;
    setinspectingAsk: React.Dispatch<React.SetStateAction<undefined | Ask>>;
    manageView?: boolean;
}

export const getAskPrice = (ask: Ask) => {
    const price =
        ask.objectType == 'ETHAddress'
            ? ask.ethAddress.price
            : ask.objectType == 'SigMerkleGroth16Proof'
            ? ask.sigMerkleGroth16Proof.price
            : ask.signature.price;
    return price;
};

export const AskCard: React.FC<AskCardProps> = ({
    inspectingAsk,
    setinspectingAsk,
    manageView,
}) => {
    //@ts-expect-error
    const snarkjs = window.snarkjs;
    const [orderView, setorderView] = useState(false);
    const [inspectingOrder, setinspectingOrder] = useState<undefined | Order>();
    const [message, setmessage] = useState<undefined | string>();
    const [proof, setproof] = useState();
    const [publicSignals, setpublicSignals] = useState();
    const [user, setuser] = useState<User | undefined>();
    const [ecdh, setecdh] = useState<EcdhSharedKey | undefined>();
    const [nonce, setnonce] = useState<bigint | undefined>();
    const [sharedKeyCommitment, setsharedKeyCommitment] = useState<
        undefined | BigInt
    >();

    const { address, isConnecting, isDisconnected, isConnected } = useAccount();
    const isMounted = useIsMounted();
    const { orders, refetch: refetchOrders } = useAskIDOrders(inspectingAsk.id);
    const { chain } = useNetwork();
    useListingEvent('Order', refetchOrders);
    useListingEvent('OrderAccepted', refetchOrders);

    const ordersElements: JSX.Element[] = [];
    orders?.forEach((order) => {
        manageView
            ? order.status == BigInt(1)
                ? ordersElements.unshift(getOrderRow(order, setinspectingOrder))
                : ordersElements.unshift(getOrderRow(order))
            : ordersElements.unshift(getOrderRow(order));
    });

    const functionName = ('order' + inspectingAsk.objectType) as
        | 'orderETHAddress'
        | 'orderSigMerkleGroth16Proof'
        | 'orderSignature';

    const value =
        inspectingAsk.objectType == 'ETHAddress'
            ? inspectingAsk.ethAddress.price
            : inspectingAsk.objectType == 'SigMerkleGroth16Proof'
            ? inspectingAsk.sigMerkleGroth16Proof.price
            : inspectingAsk.signature.price;

    const { data, isLoading, isSuccess, write, error } = useContractWrite({
        address: PRIVATE_MARKET_ADDRESS,
        abi: privateMarketABI,
        functionName: functionName,
        value: value,
        chainId: CHAIN_ID,
    });
    const loadText = useLoadingSpinner({ spinner: LOADING_SPINNER }, isLoading);

    const button =
        inspectingAsk.status == BigInt(1) && !proof && !publicSignals ? (
            <button
                disabled={error ? true : false}
                onClick={() => {
                    const askId = inspectingAsk.id;
                    // const { user, pubJubjub, nonce } = initUser();
                    const { user, nonce, ecdh, sharedKeyCommitment } =
                        prepareInputsOrder(inspectingAsk);
                    setuser(user);
                    setecdh(ecdh);
                    setsharedKeyCommitment(sharedKeyCommitment);
                    setnonce(nonce);
                    const price = getAskPrice(inspectingAsk);
                    setorderView(true);
                }}
                className="border-4 py-1 px-3 hover:bg-gray-100 rounded-md"
            >
                Order
            </button>
        ) : (
            <></>
        );

    const marketAction = `order${inspectingAsk.objectType}`;

    const confirmButton = (
        <div className="text-end ">
            {nonce && user && ecdh && sharedKeyCommitment ? (
                <a
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(
                        JSON.stringify(
                            exportMarketKey(
                                user,
                                marketAction,
                                nonce,
                                ecdh,
                                sharedKeyCommitment as bigint,
                                inspectingAsk.id
                            )
                        )
                    )}`}
                    download={`${marketAction}-user-${Date.now()}.json`}
                >
                    <button
                        className="border-4 px-4 py-1 rounded-md hover:bg-gray-100"
                        onClick={() => {
                            const pubJubjub = user?.pubJubJubKey.rawPubKey as [
                                bigint,
                                bigint
                            ];
                            const commitment: bigint =
                                sharedKeyCommitment as bigint;
                            if (inspectingAsk.objectType == 'ETHAddress') {
                                write({
                                    args: [
                                        inspectingAsk.id,
                                        commitment,
                                        pubJubjub,
                                        nonce,
                                    ],
                                    value: inspectingAsk.ethAddress.price,
                                });
                            } else if (
                                inspectingAsk.objectType ==
                                    'SigMerkleGroth16Proof' &&
                                message
                            ) {
                                const hashedMessage = hashPersonalMessage(
                                    Buffer.from(message)
                                );
                                const m = bigint_to_array(
                                    64,
                                    4,
                                    Uint8Array_to_bigint(hashedMessage)
                                ) as [bigint, bigint, bigint, bigint];

                                write({
                                    args: [
                                        inspectingAsk.id,
                                        m,
                                        commitment,
                                        pubJubjub,
                                        nonce,
                                    ],
                                    value: inspectingAsk.sigMerkleGroth16Proof
                                        .price,
                                });
                            } else if (
                                inspectingAsk.objectType == 'Signature'
                            ) {
                                const message = hash2(pubJubjub);
                                write({
                                    args: [
                                        inspectingAsk.id,
                                        pubJubjub,
                                        message as bigint,
                                        commitment,
                                        pubJubjub,
                                        nonce,
                                    ],
                                    value: inspectingAsk.signature.price,
                                });
                            }
                        }}
                    >
                        Confirm
                    </button>
                </a>
            ) : (
                <></>
            )}
        </div>
    );

    console.log(chain);

    return (
        <div className="flex flex-col space-y-2">
            {inspectingOrder ? (
                <OrderCard
                    order={inspectingOrder}
                    setinspectingOrder={setinspectingOrder}
                    action="accept"
                />
            ) : (
                <>
                    <div className="text-center">
                        <BackButton setbackToPage={setinspectingAsk} />
                    </div>
                    <div className="border-4 p-2 md:text-base text-sm rounded-md flex-col space-y-3 ">
                        <AskInspect inspectingAsk={inspectingAsk} />
                    </div>
                    {orderView ? (
                        <></>
                    ) : (
                        <div className="flex items-center space-x-4 justify-end">
                            <div className="">
                                <DownloadAskButton ask={inspectingAsk} />
                            </div>
                            {isConnected && chain?.id == CHAIN_ID ? (
                                manageView ? (
                                    inspectingAsk.status == BigInt(1) ? (
                                        <div className="text-end">
                                            <CancelButton
                                                cancelData={{
                                                    cancelType: 'Ask',
                                                    ask: inspectingAsk,
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <></>
                                    )
                                ) : (
                                    <div className="text-end">{button}</div>
                                )
                            ) : (
                                <div className="text-end">
                                    <ConnectWallet />
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
            {orderView ? (
                <div className="p-2 space-y-2 text-end pt-2">
                    {' '}
                    {inspectingAsk.objectType == 'SigMerkleGroth16Proof' &&
                    !isSuccess ? (
                        <input
                            onChange={(e) => setmessage(e.target.value)}
                            className="border-b-2 truncate focus:outline-none"
                            placeholder="message"
                        />
                    ) : (
                        <></>
                    )}
                    {isLoading ? (
                        <WaitForInfo
                            description="Waiting for tx approval"
                            loadText={loadText}
                        />
                    ) : isSuccess ? (
                        <div className="md:text-base pt-2 text-sm">
                            Tx: {data?.hash.slice(0, 10) + '...'}
                        </div>
                    ) : error ? (
                        <div>Tx reverted</div>
                    ) : inspectingAsk.objectType == 'ETHAddress' ||
                      inspectingAsk.objectType == 'Signature' ? (
                        confirmButton
                    ) : message ? (
                        confirmButton
                    ) : (
                        <></>
                    )}
                </div>
            ) : (
                <></>
            )}
            {orders && isMounted && !inspectingOrder ? (
                <div className="space-y-4">
                    <div>Orders for Ask ID {inspectingAsk.id.toString()}</div>
                    <ListingsTable
                        type="orders"
                        listingsElements={ordersElements}
                        isMounted
                    ></ListingsTable>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};
