import { LOADING_SPINNER, useLoadingSpinner } from '@/hooks/useLoadingSpinner';
import { useSnarkWorker } from '@/hooks/useSnarkWorker';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { WaitForInfo } from '../wait-info';
import { prepareCallData } from '@/utils/contractUtils';
import { exportEncryptedOrderData } from '@/utils/misc';
import { Order, Ask, Bid } from '@/types/types';
import { useContractWrite } from 'wagmi';
import { CHAIN_ID, PRIVATE_MARKET_ADDRESS } from '@/app.conf';
import { privateMarketABI } from '@/wagmi-src/generated';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export interface BackButtonProps {
    setbackToPage: (value: SetStateAction<any>) => void;
}

export interface ProveButtonProps {
    disabled: boolean;
    inputs: any;
    zkeyUrl: string;
    setproof: Dispatch<SetStateAction<undefined>>;
    setpublicSignals: Dispatch<SetStateAction<undefined | string[] | bigint[]>>;
    wasmName: string;
    customButtonText?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ setbackToPage }) => {
    return (
        <button
            className="border-4 px-4 py-1 rounded-md hover:bg-gray-100"
            onClick={() => setbackToPage(undefined)}
        >
            Back
        </button>
    );
};

export const ProveButton: React.FC<ProveButtonProps> = ({
    disabled,
    inputs,
    zkeyUrl,
    wasmName,
    setproof,
    setpublicSignals,
    customButtonText,
}) => {
    const { proof, error, publicSignals, workerRef } = useSnarkWorker();
    const [loading, setloading] = useState(false);
    const loadText = useLoadingSpinner({ spinner: LOADING_SPINNER }, loading);
    const buttonText = customButtonText ? customButtonText : 'Prove';
    const [proofError, setproofError] = useState<string | undefined>();
    useEffect(() => {
        if (proof && publicSignals) {
            setloading(false);
            setproof(proof);
            setpublicSignals(publicSignals);
            setproofError(undefined);
        } else if (error) {
            setloading(false);
        }
    }, [
        proof,
        publicSignals,
        error,
        proofError,
        setproofError,
        setproof,
        setpublicSignals,
    ]);

    return (
        <>
            {loading ? (
                <>
                    <WaitForInfo
                        loadText={loadText}
                        description={'Generating proof...'}
                    />
                </>
            ) : error ? (
                <div>Error while generating proof</div>
            ) : (
                <button
                    disabled={disabled}
                    onClick={async () => {
                        setloading(true);
                        const zkeyDownload = await fetch(zkeyUrl, {
                            method: 'GET',
                        });
                        const zkeyBuffer = await zkeyDownload.arrayBuffer();
                        workerRef.current?.postMessage({
                            inputs,
                            zkey: zkeyBuffer,
                            wasm: wasmName,
                        });
                    }}
                    className="border-4 px-4 py-1 rounded-md hover:bg-gray-100"
                >
                    {buttonText}
                </button>
            )}
        </>
    );
};

interface FillButtonProps {
    write: any;
    disabled: boolean;
    proof: any;
    publicSignals: any;
    args: any[];
}

export const FillButton: React.FC<FillButtonProps> = ({
    disabled,
    proof,
    publicSignals,
    write,
    args,
}) => {
    return (
        <button
            disabled={disabled}
            className="border-4 py-1 px-3 hover:bg-gray-100 rounded-md"
            onClick={() => {
                const { pi_a, pi_b, pi_c, pubInputs } = prepareCallData(
                    proof,
                    publicSignals
                );
                const result = write?.({
                    args: [pi_a, pi_b, pi_c, pubInputs, ...args],
                });
            }}
        >
            Confirm
        </button>
    );
};

interface DownloadOrderButtonProps {
    order: Order;
    ask: Ask;
}

export const DownloadOrderButton: React.FC<DownloadOrderButtonProps> = ({
    order,
    ask,
}) => {
    // The signature part should be changed.
    // This button is to retrieve the order data.
    const encryptedData = exportEncryptedOrderData(order);

    const data =
        order.orderType == 0n
            ? {
                  messageHash:
                      order.orderedGroth16SigMerkleProof.messageHash.map((x) =>
                          x.toString()
                      ),
              }
            : order.orderType == 1n
            ? order.orderedSignature.message
            : ask.ethAddress.keccakAddress;
    return (
        <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify({
                    orderId: order.id.toString(),
                    from: order.from,
                    askId: order.askId.toString(),
                    data: data,
                    sharedKeyCommitment: order.sharedKeyCommitment.toString(),
                    nonce: order.poseidonNonce.toString(),
                    pubJubjub: [
                        order.fromPubKey[0].toString(),
                        order.fromPubKey[1].toString(),
                    ],
                    type:
                        order.orderType == 0n
                            ? 'proof'
                            : order.orderType == 1n
                            ? 'signature'
                            : 'address',
                    ...encryptedData,
                })
            )}`}
            download={`orderId-${order.id.toString()}-askId-${order.askId.toString()}.json`}
        >
            <button className="border-4 py-1 px-3 hover:bg-gray-100 rounded-md">
                {' '}
                Download{' '}
            </button>
        </a>
    );
};

interface DownloadAskButtonProps {
    ask: Ask;
}

export const DownloadAskButton: React.FC<DownloadAskButtonProps> = ({
    ask,
}) => {
    const data =
        ask.objectType == 'SigMerkleGroth16Proof'
            ? {
                  vkeyHash: ask.sigMerkleGroth16Proof.vKeyhash.toString(),
                  groupRoot: ask.sigMerkleGroth16Proof.groupRoot.toString(),
              }
            : ask.objectType == 'Signature'
            ? {}
            : ask.ethAddress.keccakAddress;

    return (
        <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify({
                    askId: ask.id.toString(),
                    from: ask.from,
                    pubJubjub: [
                        ask.fromPubKey[0].toString(),
                        ask.fromPubKey[1].toString(),
                    ],
                    type: ask.objectType,
                    data: data,
                })
            )}`}
            download={`askId-${ask.id.toString()}.json`}
        >
            <button className="border-4 py-1 px-3 hover:bg-gray-100 rounded-md">
                Download
            </button>
        </a>
    );
};

interface DownloadBidButtonProps {
    bid: Bid;
}

export const DownloadBidButton: React.FC<DownloadBidButtonProps> = ({
    bid,
}) => {
    return (
        <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify({
                    bidId: bid.id.toString(),
                    nonce: bid.poseidonNonce.toString(),
                    filledBy: bid.fill.from,
                    pubJubJubFrom: bid.fill.fromPubkey,
                    encryptedData: bid.fill.orderedEthAddress.encryptedPrivKey,
                })
            )}`}
            download={`bidId-${bid.id.toString()}.json`}
        >
            <button className="border-4 py-1 px-3 hover:bg-gray-100 rounded-md">
                Download
            </button>
        </a>
    );
};

type CancelBidData = { cancelType: 'Bid'; bid: Bid };
type CancelAskData = { cancelType: 'Ask'; ask: Ask };
type CancelOrderData = { cancelType: 'Order'; ask: Ask; order: Order };

interface CancelButtonProps {
    cancelData: CancelBidData | CancelAskData | CancelOrderData;
}

export const CancelButton: React.FC<CancelButtonProps> = ({ cancelData }) => {
    const button = (
        <button className="border-4 py-1 px-3 hover:bg-gray-100 rounded-md">
            Cancel
        </button>
    );
    // can cancel bid, order or ask
    const { data, isLoading, isSuccess, write, error } = useContractWrite({
        address: PRIVATE_MARKET_ADDRESS,
        abi: privateMarketABI,
        functionName: ('cancel' + cancelData.cancelType) as
            | 'cancelBid'
            | 'cancelAsk'
            | 'cancelOrder',
        chainId: CHAIN_ID,
    });
    let args: {};
    if (cancelData.cancelType == 'Bid') {
        const bid = cancelData.bid;
        args = { args: [bid.id] };
    } else if (cancelData.cancelType == 'Ask') {
        const ask = cancelData.ask;
        args = { args: [ask.id] };
    } else {
        args = {
            args: [
                cancelData.ask.id,
                cancelData.order.id,
                cancelData.order.orderType,
            ],
        };
    }
    const cancelCall = () => write?.(args);
    return (
        <>
            <button
                onClick={cancelCall}
                className="border-4 py-1 px-3 hover:bg-gray-100 rounded-md"
            >
                Cancel
            </button>
        </>
    );
};
