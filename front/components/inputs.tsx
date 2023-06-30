import { EncryptedOrderData } from '@/types/types';
import { ECDSAKeyPair } from 'private-market-utils/lib/browser';
import { SetStateAction, useState } from 'react';
import { MarketObjectType } from '@/types/types';
import { getObjectTypeFromActionType } from '../utils/misc';
import { PrivKey, PubKey, Keypair } from 'maci-domainobjs';
import { EcdhSharedKey } from 'maci-crypto';
import assert from 'assert';

interface InputPrivKeyProps {
    setsoldPriv: React.Dispatch<React.SetStateAction<string | undefined>>;
    type?: undefined | 'eddsa' | 'ecdsa';
}
export const InputPrivKey: React.FC<InputPrivKeyProps> = ({
    setsoldPriv,
    type,
}) => {
    const [privatekeyFeedback, setprivatekeyFeedback] = useState<
        string | undefined
    >();
    const placeholderText =
        type == 'eddsa' ? 'Bigint-like private key' : 'Hex private key';
    return (
        <>
            <input
                onChange={(e) => {
                    try {
                        let privKey: bigint;
                        let soldKey;
                        if (type == 'eddsa') {
                            privKey = BigInt(e.target.value); // expect int-like input for eddsa
                            soldKey = new PrivKey(privKey);
                        } else if (type == 'ecdsa') {
                            privKey = BigInt('0x' + e.target.value); // expect hex input for ecsda
                            soldKey = new ECDSAKeyPair(privKey);
                        } else {
                            privKey = BigInt('0x' + e.target.value); // expect hex input for ecsda
                            soldKey = new ECDSAKeyPair(privKey);
                        }
                        setsoldPriv(e.target.value);
                        setprivatekeyFeedback(undefined);
                    } catch (error) {
                        setsoldPriv(undefined);
                        setprivatekeyFeedback('Invalid private key value');
                    }
                }}
                type="password"
                className="border-b-2 truncate focus:outline-none"
                placeholder={placeholderText}
            />
            <span> {privatekeyFeedback}</span>{' '}
        </>
    );
};

interface InputMarketOrderProps {
    setecdh: React.Dispatch<SetStateAction<EcdhSharedKey | undefined>>;
    setsharedKeyCommitment: React.Dispatch<SetStateAction<bigint | undefined>>;
    setobjectType: React.Dispatch<SetStateAction<MarketObjectType | undefined>>;
    setnonce: React.Dispatch<SetStateAction<bigint | undefined>>;
    setprivJubJub?: React.Dispatch<SetStateAction<bigint | undefined>>;
}

export const InputMarketOrder: React.FC<InputMarketOrderProps> = ({
    setecdh,
    setsharedKeyCommitment,
    setobjectType,
    setnonce,
    setprivJubJub,
}) => {
    const [orderValidity, setorderValidity] = useState<undefined | string>(
        'invalid order format'
    );
    const marketOrderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            try {
                const fileReader = new FileReader();
                fileReader.readAsBinaryString(e.target.files[0]);
                fileReader.onload = (e) => {
                    if (e.target) {
                        try {
                            const order = JSON.parse(e.target.result as string);
                            if (
                                (order.action as string).includes('bid') &&
                                setprivJubJub
                            ) {
                                setprivJubJub(BigInt(order.privJubJub));
                                setobjectType('ETHAddress');
                                setorderValidity(undefined);
                            } else {
                                let ecdh: bigint[] = [];
                                order.ecdh.forEach((element: string) => {
                                    ecdh.push(BigInt(element));
                                });
                                setecdh(ecdh);
                                const objectType = getObjectTypeFromActionType(
                                    order.action
                                );
                                setobjectType(
                                    getObjectTypeFromActionType(order.action)
                                );
                                setsharedKeyCommitment(
                                    BigInt(order.sharedKeyCommitment)
                                );
                                setnonce(BigInt(order.nonce));
                                setorderValidity(undefined);
                            }
                        } catch (error) {
                            setorderValidity('invalid order format');
                            setecdh(undefined);
                            setobjectType(undefined);
                            setsharedKeyCommitment(undefined);
                            setnonce(undefined);
                        }
                    }
                };
            } catch (error) {
                setorderValidity('invalid order format');
                setecdh(undefined);
                setobjectType(undefined);
                setsharedKeyCommitment(undefined);
                setnonce(undefined);
            }
        }
    };
    return (
        <div className="space-y-1">
            <div>
                <span className="font-mono font-bold">Bid/Order File:</span>{' '}
            </div>
            <input className="pt-1" type="file" onChange={marketOrderUpload} />
            <div>
                <span className="text-sm">{orderValidity}</span>
            </div>
        </div>
    );
};

interface InputMarketKeysProps {
    setmarketKey: React.Dispatch<React.SetStateAction<undefined | PrivKey>>;
}

interface InputEncryptedOrderProps {
    setencryptedOrder: React.Dispatch<
        React.SetStateAction<EncryptedOrderData | undefined>
    >;
    setecdh?: React.Dispatch<SetStateAction<EcdhSharedKey | undefined>>;
    privkey?: bigint;
    setnonce: React.Dispatch<SetStateAction<bigint | undefined>>;
}

export const InputEncryptedOrder: React.FC<InputEncryptedOrderProps> = ({
    setencryptedOrder,
    setecdh,
    privkey,
    setnonce,
}) => {
    const [orderValidity, setorderValidity] = useState<undefined | string>(
        'invalid encrypted format'
    );
    const orderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            try {
                const fileReader = new FileReader();
                fileReader.readAsBinaryString(e.target.files[0]);
                fileReader.onload = (e) => {
                    if (e.target) {
                        try {
                            const order = JSON.parse(e.target.result as string);
                            if (
                                'bidId' in order &&
                                privkey &&
                                setecdh &&
                                setnonce
                            ) {
                                const pubSeller = order.pubJubJubFrom.map(
                                    (element: string) => BigInt(element)
                                );
                                const bidderPriv = new PrivKey(privkey);
                                const ecdh = Keypair.genEcdhSharedKey(
                                    bidderPriv,
                                    new PubKey(pubSeller)
                                );
                                setecdh(ecdh);
                                setnonce(BigInt(order.nonce));
                            }
                            const encryptedData: bigint[] = [];
                            order.encryptedData.forEach((element: string) => {
                                encryptedData.push(BigInt(element));
                            });
                            setencryptedOrder(encryptedData);
                            setorderValidity(undefined);
                        } catch (error) {
                            setorderValidity('invalid encrypted format');
                            setencryptedOrder(undefined);
                        }
                    }
                };
            } catch (error) {
                setorderValidity('invalid encrypted format');
                setencryptedOrder(undefined);
            }
        }
    };
    return (
        <div className="space-y-1">
            <div>
                <span className="font-mono font-bold">Encrypted data:</span>{' '}
            </div>
            <input className="pt-1" type="file" onChange={orderUpload} />
            <div>
                <span className="text-sm">{orderValidity}</span>
            </div>
        </div>
    );
};

export const InputMarketKeys: React.FC<InputMarketKeysProps> = ({
    setmarketKey,
}) => {
    const [keyValidity, setkeyValidity] = useState<undefined | string>(
        'invalid key format'
    );
    const marketKeyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            try {
                const fileReader = new FileReader();
                fileReader.readAsBinaryString(e.target.files[0]);
                fileReader.onload = (e) => {
                    if (e.target) {
                        try {
                            const key = JSON.parse(e.target.result as string);
                            setmarketKey(new PrivKey(BigInt(key.privJubJub)));
                            setkeyValidity(undefined);
                        } catch (error) {
                            setkeyValidity('invalid key format');
                            setmarketKey(undefined);
                        }
                    }
                };
            } catch (error) {
                setkeyValidity('invalid key format');
                setmarketKey(undefined);
            }
        }
    };
    return (
        <div className="space-y-1">
            <div>
                <span className="font-mono font-bold">Keypair:</span>{' '}
            </div>
            <input className="pt-1" type="file" onChange={marketKeyUpload} />
            <div>
                <span className="text-sm">{keyValidity}</span>
            </div>
        </div>
    );
};

interface InputGroth16ProofProps {
    setgroth16Proof: React.Dispatch<SetStateAction<undefined>>;
    setgroth16PublicSignals: React.Dispatch<
        SetStateAction<undefined | bigint[] | string[]>
    >;
}

export const InputGroth16Proof: React.FC<InputGroth16ProofProps> = ({
    setgroth16Proof,
    setgroth16PublicSignals,
}) => {
    const [groth16ProofValidity, setgroth16ProofValidity] = useState<
        undefined | 'invalid proof format'
    >();
    const [groth16PublicSignalsValidity, setgroth16PublicSignalsValidity] =
        useState<undefined | 'invalid public format'>();
    const groth16ProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            try {
                const fileReader = new FileReader();
                fileReader.readAsBinaryString(e.target.files[0]);
                fileReader.onload = (e) => {
                    if (e.target) {
                        try {
                            const proof = JSON.parse(e.target.result as string);
                            assert('pi_a' in proof);
                            assert('pi_b' in proof);
                            assert('pi_c' in proof);
                            setgroth16ProofValidity(undefined);
                            setgroth16Proof(proof);
                            console.log(proof);
                        } catch (error) {
                            setgroth16ProofValidity('invalid proof format');
                            setgroth16Proof(undefined);
                        }
                    }
                };
            } catch (error) {
                setgroth16Proof(undefined);
                setgroth16ProofValidity('invalid proof format');
            }
        }
    };

    const groth16PublicSignalsUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files) {
            try {
                const fileReader = new FileReader();
                fileReader.readAsBinaryString(e.target.files[0]);
                fileReader.onload = (e) => {
                    if (e.target) {
                        try {
                            const signalsString = JSON.parse(
                                e.target.result as string
                            );
                            const signals: bigint[] = signalsString.map(
                                (signal: string) => BigInt(signal)
                            );
                            setgroth16PublicSignalsValidity(undefined);
                            setgroth16PublicSignals(signals);
                        } catch (error) {
                            setgroth16PublicSignalsValidity(
                                'invalid public format'
                            );
                            setgroth16PublicSignals(undefined);
                        }
                    }
                };
            } catch (error) {
                setgroth16PublicSignals(undefined);
                setgroth16PublicSignalsValidity('invalid public format');
            }
        }
    };
    return (
        <>
            <div className="space-y-1">
                <div>
                    <span className="font-mono font-bold">Proof:</span>{' '}
                </div>
                <input
                    className="pt-1"
                    type="file"
                    onChange={groth16ProofUpload}
                />
                <div>
                    <span className="text-sm">{groth16ProofValidity}</span>
                </div>
            </div>
            <div className="space-y-1">
                <div>
                    <span className="font-mono font-bold">Public Signals:</span>{' '}
                </div>
                <input
                    className="pt-1"
                    type="file"
                    onChange={groth16PublicSignalsUpload}
                />
                <div>
                    <span className="text-sm">
                        {groth16PublicSignalsValidity}
                    </span>
                </div>
            </div>
        </>
    );
};
