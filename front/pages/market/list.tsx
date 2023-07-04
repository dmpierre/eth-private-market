import {
    MarketNavBar,
    MarketPageTop,
} from '@/components/market/market-components';
import { TopContainer } from '@/components/page-components';
import { useState } from 'react';
import { useBidAsk } from '@/hooks/useBidAsk';
import { utils } from 'ethers';
import { LOADING_SPINNER, useLoadingSpinner } from '@/hooks/useLoadingSpinner';
import {
    ActionType,
    MarketActionType,
    MarketObjectType,
    SigningKey,
} from '@/types/types';
import { isAddress } from 'viem';
import { useAccount, useNetwork } from 'wagmi';
import { ConnectWallet } from '@/components/wallet';
import { WaitForInfo } from '@/components/wait-info';
import assert from 'assert';
import { initUser } from '@/utils/contractUtils';
import { exportMarketKey } from '@/utils/misc';
import { CHAIN_ID } from '@/app.conf';

enum Groth16Feedback {
    InvalidVKeyHash = 'Invalid vkey hash',
    InvalidRoot = 'Invalid root',
}

enum UserFeedback {
    InvalidETHAddress = 'Invalid address',
    InvalidSignature = 'Invalid signing key',
}

export default function List() {
    const [soldETHAddress, setsoldETHAddress] = useState<`0x${string}`>('0x');
    const [soldSigningKeys, setsoldSigningKeys] = useState<SigningKey>([
        0n,
        0n,
    ]);
    const [soldVkeyHash, setsoldVkeyHash] = useState<bigint>(0n);
    const [soldRoot, setsoldRoot] = useState<bigint>(0n);
    const [objectType, setobjectType] =
        useState<MarketObjectType>('ETHAddress');
    const [actionType, setactionType] = useState<ActionType>('ask');
    const [signatureFeedback, setsignatureFeedback] = useState<
        undefined | 'Invalid signing key'
    >('Invalid signing key');
    const [addressFeedback, setaddressFeedback] = useState<
        undefined | 'Invalid address'
    >('Invalid address');
    const [vkeyHashFeeback, setvkeyHashFeeback] = useState<
        Groth16Feedback.InvalidVKeyHash | undefined
    >(Groth16Feedback.InvalidVKeyHash);
    const [rootFeedback, setrootFeedback] = useState<
        Groth16Feedback.InvalidRoot | undefined
    >(Groth16Feedback.InvalidRoot);
    const [priceFeedback, setpriceFeedback] = useState<
        undefined | 'Invalid price'
    >();
    const [marketAction, setmarketAction] = useState(
        (actionType + objectType) as MarketActionType
    );
    const { data, isLoading, isSuccess, write } = useBidAsk(marketAction);
    const loadingText = useLoadingSpinner(
        { spinner: LOADING_SPINNER },
        isLoading
    );

    const [price, setprice] = useState<number>(1);
    const { address, isConnecting, isDisconnected } = useAccount();

    const { user, nonce, pubJubjub } = initUser();
    
    const { chain } = useNetwork()

    /**
     * Bid is only available for ETHAddress
     */
    const bidSelectElement =
        objectType === 'ETHAddress' ? <option value="bid">Bid</option> : <></>;
    const actionSelectElement = (
        <select
            className="border-2 font-mono rounded-md p-2 focus:outline-none"
            onChange={(e) => {
                const action = e.target.value as ActionType;
                setactionType(action);
                setmarketAction((action + objectType) as MarketActionType);
            }}
            name="action-type"
            id=""
        >
            <option value="ask">Ask</option>
            {bidSelectElement}
        </select>
    );

    /**
     * Sold element is different for each object type
     */
    const soldElement =
        objectType === 'ETHAddress' ? (
            <>
                <input
                    onChange={(e) => {
                        const address = e.target.value;
                        if (!isAddress(address)) {
                            setaddressFeedback(UserFeedback.InvalidETHAddress);
                        } else {
                            setaddressFeedback(undefined);
                        }
                        setsoldETHAddress(address as `0x${string}`);
                    }}
                    className="border-b-2 truncate focus:outline-none"
                    placeholder="0x..."
                    type="text"
                />
                <span className="ml-4">{addressFeedback}</span>
            </>
        ) : objectType === 'Signature' ? (
            <>
                <input
                    onChange={(e) => {
                        if (e.target.value == '') {
                            setsignatureFeedback(UserFeedback.InvalidSignature);
                        } else {
                            const key = e.target.value.split(',');
                            try {
                                const keys: SigningKey = [
                                    BigInt(key[0]),
                                    BigInt(key[1]),
                                ];
                                setsoldSigningKeys(keys);
                                setsignatureFeedback(undefined);
                            } catch (error) {
                                setsignatureFeedback(
                                    UserFeedback.InvalidSignature
                                );
                            }
                        }
                    }}
                    className="border-b-2 truncate focus:outline-none"
                    placeholder="x, y"
                    type="text"
                />
                <span className="ml-4">{signatureFeedback}</span>
            </>
        ) : (
            <>
                <input
                    onChange={(e) => {
                        const vkeyHash = e.target.value;
                        if (vkeyHash == '') {
                            setvkeyHashFeeback(Groth16Feedback.InvalidVKeyHash);
                        } else {
                            try {
                                setsoldVkeyHash(BigInt(vkeyHash));
                                setvkeyHashFeeback(undefined);
                            } catch (error) {
                                setvkeyHashFeeback(
                                    Groth16Feedback.InvalidVKeyHash
                                );
                            }
                        }
                    }}
                    className="border-b-2 truncate focus:outline-none"
                    placeholder="VKey Hash"
                    type="text"
                />
                <span className="ml-4">{vkeyHashFeeback}</span>
                <br />
                <input
                    onChange={(e) => {
                        const root = e.target.value;
                        if (root == '') {
                            setrootFeedback(Groth16Feedback.InvalidRoot);
                        } else {
                            try {
                                setsoldRoot(BigInt(root));
                                setrootFeedback(undefined);
                            } catch (error) {
                                setrootFeedback(Groth16Feedback.InvalidRoot);
                            }
                        }
                    }}
                    className="border-b-2 truncate focus:outline-none"
                    placeholder="Group root"
                    type="text"
                />
                <span className="ml-4">{rootFeedback}</span>
            </>
        );
    
    
    const listButton = 
        chain?.id == CHAIN_ID ? (
        <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(exportMarketKey(user, marketAction))
            )}`}
            download={`${marketAction}-user-${Date.now()}.json`}
        >
            <button
                disabled={
                    !!priceFeedback ||
                    isConnecting ||
                    isDisconnected ||
                    (objectType == 'Signature' && !!signatureFeedback) ||
                    (objectType == 'ETHAddress' && !!addressFeedback) ||
                    (objectType == 'SigMerkleGroth16Proof' &&
                        (!!vkeyHashFeeback || !!rootFeedback))
                }
                onClick={() => {
                    const value = BigInt(
                        utils.parseEther(price.toString()).toString()
                    );

                    if (marketAction === 'askETHAddress') {
                        write?.({
                            args: [value, soldETHAddress, pubJubjub],
                        });
                    }
                    if (marketAction === 'askSignature') {
                        write?.({
                            args: [value, soldSigningKeys, pubJubjub],
                        });
                    }
                    if (marketAction === 'askSigMerkleGroth16Proof') {
                        write?.({
                            args: [value, soldVkeyHash, soldRoot, pubJubjub],
                        });
                    }
                    if (marketAction === 'bidETHAddress') {
                        if (isAddress(soldETHAddress)) {
                            write?.({
                                args: [soldETHAddress, nonce, pubJubjub],
                                value: value,
                            });
                            setaddressFeedback(undefined);
                        } else {
                            setaddressFeedback(UserFeedback.InvalidETHAddress);
                        }
                    }
                }}
                style={{
                    textTransform: 'capitalize',
                }}
                className="border-4 hover:bg-gray-100 py-1 px-4 rounded-md"
            >
                {actionType}
            </button>
        </a>
    ) : 
        <ConnectWallet />
    ;
    
    return (
        <TopContainer>
            <MarketPageTop></MarketPageTop>
            <MarketNavBar active="list" />
            <div
                style={{ margin: '0 auto' }}
                className="lg:w-1/4 sm:w-1/2 p-5 border-4 rounded-md space-y-5"
            >
                <form className="space-y-5" action="">
                    <select
                        className="border-2 font-mono rounded-md p-2 focus:outline-none"
                        onChange={(e) => {
                            const objectType = e.target
                                .value as MarketObjectType;
                            if (
                                objectType === 'Signature' ||
                                objectType === 'SigMerkleGroth16Proof'
                            ) {
                                setactionType('ask');
                            }
                            setobjectType(objectType);
                            setmarketAction(
                                (actionType + objectType) as MarketActionType
                            );
                        }}
                        name="object-type"
                        id=""
                    >
                        <option value="ETHAddress">ETH Address</option>
                        <option value="Signature">EdDSA Signature</option>
                        <option value="SigMerkleGroth16Proof">
                            Groth16 Proof
                        </option>
                    </select>
                    <br />
                    {actionSelectElement}
                    <br />
                    {soldElement}
                    <br />
                    <input
                        onChange={(e) => {
                            let price;
                            try {
                                price = Number(e.target.value);
                                assert(price > 0);
                                setpriceFeedback(undefined);
                                setprice(price);
                            } catch (error) {
                                setpriceFeedback('Invalid price');
                            }
                        }}
                        placeholder="ETH Price"
                        className="border-b-2 focus:outline-none"
                        type="number"
                        defaultValue={1}
                    />
                    <span className="ml-4">{priceFeedback}</span>
                    <br />
                </form>
                <div className="text-end">
                    {isSuccess ? (
                        <div className="pt-2">
                            {' '}
                            {`Tx: ${data?.hash.slice(0, 10)}...`}{' '}
                        </div>
                    ) : (
                        <div className="h-9">
                            {isLoading ? (
                                <WaitForInfo
                                    loadText={loadingText}
                                    description="Waiting for tx approval"
                                />
                            ) : (
                                <div>
                                    {isConnecting || isDisconnected ? (
                                        <ConnectWallet />
                                    ) : (
                                        listButton
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </TopContainer>
    );
}
