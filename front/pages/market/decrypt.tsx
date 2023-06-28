import { InputEncryptedOrder, InputMarketOrder } from '../../components/inputs';
import { useEffect, useState } from 'react';
import {
    MarketPageTop,
    MarketNavBar,
} from '@/components/market/market-components';
import { TopContainer } from '@/components/page-components';
import {
    EncryptedOrderData,
    Groth16Proof,
    MarketObjectType,
    Order,
} from '@/types/types';
import { tuple_to_bigint } from 'private-market-utils/dist/lib/src/bigint';
import { decrypt as poseidonDecrypt, EcdhSharedKey } from 'maci-crypto';
import { BN128_MOD } from '@/app.conf';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const DecryptOrder: React.FC = () => {
    const [encryptedData, setencryptedData] = useState<
        EncryptedOrderData | undefined
    >();
    const [ecdh, setecdh] = useState<undefined | EcdhSharedKey>();
    const [sharedKeyCommitment, setsharedKeyCommitment] = useState<
        bigint | undefined
    >();
    const [objectType, setobjectType] = useState<
        MarketObjectType | undefined
    >();
    const [result, setresult] = useState<
        | undefined
        | { data: string }
        | Groth16Proof
        | { data: { R8: bigint[]; S: bigint } }
    >();
    const [nonce, setnonce] = useState<bigint | undefined>();
    const [decryptionValidity, setdecryptionValidity] = useState<
        'decryption failed' | undefined
    >();
    const [privJubJub, setprivJubJub] = useState<bigint | undefined>();

    useEffect(() => {
        if (encryptedData && ecdh && nonce && objectType) {
            switch (objectType) {
                case 'ETHAddress': {
                    try {
                        const decrypted = decryptPrivKey(
                            ecdh,
                            nonce,
                            encryptedData
                        );
                        setresult(decrypted);
                        setdecryptionValidity(undefined);
                    } catch (error) {
                        setdecryptionValidity('decryption failed');
                        setresult(undefined);
                    }
                    break;
                }
                case 'SigMerkleGroth16Proof': {
                    try {
                        const decrypted = decryptGroth16Proof(
                            ecdh,
                            nonce,
                            encryptedData
                        );
                        setdecryptionValidity(undefined);
                        setresult(decrypted);
                    } catch (error) {
                        setdecryptionValidity('decryption failed');
                        setresult(undefined);
                    }
                    break;
                }
                case 'Signature': {
                    try {
                        const decrypted = decryptEdDSASig(
                            ecdh,
                            nonce,
                            encryptedData
                        );
                        setresult(decrypted);
                        setdecryptionValidity(undefined);
                    } catch (error) {
                        setdecryptionValidity('decryption failed');
                        setresult(undefined);
                    }
                    break;
                }
            }
        }
    }, [encryptedData, ecdh, nonce, objectType]);

    return (
        <div className="space-y-4 border-4 rounded-md p-3 md:p-4">
            <InputMarketOrder
                setecdh={setecdh}
                setobjectType={setobjectType}
                setnonce={setnonce}
                setsharedKeyCommitment={setsharedKeyCommitment}
                setprivJubJub={setprivJubJub}
            />
            <InputEncryptedOrder
                setnonce={setnonce}
                privkey={privJubJub}
                setecdh={setecdh}
                setencryptedOrder={setencryptedData}
            />
            <div className="text-end">
                {encryptedData && ecdh ? (
                    <>
                        {
                            <>
                                {result && (
                                    <a
                                        href={`data:text/json;charset=utf-8,${encodeURIComponent(
                                            JSON.stringify(result)
                                        )}`}
                                        download={`decrypted-${objectType}-${Date.now()}.json`}
                                    >
                                        <button className="border-4 px-4 py-1 rounded-md hover:bg-gray-100">
                                            Download
                                        </button>
                                    </a>
                                )}
                                <div>{decryptionValidity}</div>
                            </>
                        }
                    </>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};

const decryptPrivKey = (
    ecdh: EcdhSharedKey,
    nonce: bigint,
    encryptedData: EncryptedOrderData
) => {
    try {
        //@ts-expect-error
        const decrypted: [bigint, bigint, bigint, bigint] = poseidonDecrypt(
            encryptedData,
            ecdh,
            nonce,
            4
        );
        return { data: tuple_to_bigint(decrypted).toString(16) };
    } catch (error) {
        throw new Error('decryption failed');
    }
};

const decryptEdDSASig = (
    ecdh: EcdhSharedKey,
    nonce: bigint,
    encryptedData: EncryptedOrderData
) => {
    try {
        //@ts-expect-error
        const decrypted: [bigint, bigint, bigint] = poseidonDecrypt(
            encryptedData,
            ecdh,
            nonce,
            3
        );
        return {
            data: {
                R8: [decrypted[0], decrypted[1]],
                S: decrypted[2],
            },
        };
    } catch (error) {
        throw new Error('decryption failed');
    }
};

const decryptGroth16Proof = (
    ecdh: EcdhSharedKey,
    nonce: bigint,
    encryptedData: EncryptedOrderData
) => {
    try {
        const encryptedProof = encryptedData.slice(0, 49) as bigint[];

        const decrypted = poseidonDecrypt(encryptedProof, ecdh, nonce, 48);
        const negpa_0 = decrypted.slice(0, 6) as bigint[];
        const negpa_1 = decrypted.slice(6, 12) as bigint[];
        const pb_0_0 = decrypted.slice(12, 18) as bigint[];
        const pb_0_1 = decrypted.slice(18, 24) as bigint[];
        const pb_1_0 = decrypted.slice(24, 30) as bigint[];
        const pb_1_1 = decrypted.slice(30, 36) as bigint[];
        const pc_0 = decrypted.slice(36, 42) as bigint[];
        const pc_1 = decrypted.slice(42, 48) as bigint[];

        const proof = {
            pi_a: [
                tuple_to_bigint(negpa_0, 43),
                BN128_MOD - tuple_to_bigint(negpa_1, 43),
                BigInt(1),
            ] as [bigint, bigint, bigint],
            pi_b: [
                [tuple_to_bigint(pb_0_0, 43), tuple_to_bigint(pb_0_1, 43)],
                [tuple_to_bigint(pb_1_0, 43), tuple_to_bigint(pb_1_1, 43)],
                [BigInt(1), BigInt(0)],
            ] as [[bigint, bigint], [bigint, bigint], [bigint, bigint]],
            pi_c: [
                tuple_to_bigint(pc_0, 43),
                tuple_to_bigint(pc_1, 43),
                BigInt(1),
            ] as [bigint, bigint, bigint],
            protocol: 'groth16',
            curve: 'bn128',
        };

        return proof;
    } catch (error) {
        throw new Error('decryption failed');
    }
};

export default function Decrypt() {
    return (
        <TopContainer>
            <MarketPageTop></MarketPageTop>
            <MarketNavBar />
            <DecryptOrder />
        </TopContainer>
    );
}
