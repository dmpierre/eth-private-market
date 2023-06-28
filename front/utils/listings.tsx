import { Ask, Bid, Order } from '@/types/types';
import { SetStateAction } from 'react';
import { formatEther } from 'viem';

export const getOrderRow = (
    order: Order,
    setinspectingOrder?: (value: SetStateAction<any | undefined>) => void,
    customButtomText?: string
) => {
    const status = order.status == BigInt(1) ? 'open' : 'closed';
    return (
        <tr key={order.poseidonNonce.toString()}>
            <td className="text-sm md:text-base text-center">
                {order.id.toString()}
            </td>
            <td className="text-sm md:text-base text-center">
                {order.askId.toString()}
            </td>
            <td className="text-sm md:text-base text-center">
                {order.from.slice(0, 8) + '...'}
            </td>
            <td className="text-sm md:text-base text-center">{status}</td>
            {setinspectingOrder ? (
                <td className="text-center hover:bg-gray-100 border-4 px-4 rounded-md">
                    <button
                        className="text-sm md:text-base"
                        onClick={() => setinspectingOrder(order)}
                    >
                        Manage
                    </button>
                </td>
            ) : (
                <></>
            )}
        </tr>
    );
};

export const getListingRow = (
    obj: Bid | Ask,
    setinspectingObj: (value: SetStateAction<any | undefined>) => void,
    customButtonText?: string
) => {
    const status = obj.status == BigInt(1) ? 'open' : 'closed';
    let buttonText;
    const fillText = obj.type == 'bid' ? 'Fill' : 'Order';
    buttonText = status == 'open' ? fillText : 'Details';
    if (customButtonText) {
        buttonText = customButtonText;
    }
    const selling =
        obj.objectType == 'ETHAddress'
            ? obj.ethAddress.keccakAddress.slice(0, 8)
            : obj.objectType == 'SigMerkleGroth16Proof'
            ? obj.sigMerkleGroth16Proof.groupRoot.toString().slice(0, 10)
            : obj.signature.signingKey[0].toString().slice(0, 10);
    const price =
        obj.objectType == 'ETHAddress'
            ? obj.ethAddress.price
            : obj.objectType == 'SigMerkleGroth16Proof'
            ? obj.sigMerkleGroth16Proof.price
            : obj.signature.price;
    const objType =
        obj.objectType == 'ETHAddress'
            ? 'address'
            : obj.objectType == 'SigMerkleGroth16Proof'
            ? 'proof'
            : 'signature';

    return (
        <tr key={obj.id.toString()}>
            <td>{objType}</td>
            <td className="text-sm md:text-base text-center">
                {selling + '...'}
            </td>
            <td className="text-sm md:text-base text-center">{status}</td>
            <td className="text-sm md:text-base text-center">
                {formatEther(price).toString()}
            </td>
            <td className="text-sm md:text-base text-center hover:bg-gray-100 border-4 px-4 rounded-md">
                <button
                    className="text-sm md:text-base"
                    onClick={() => setinspectingObj(obj)}
                >
                    {buttonText}
                </button>
            </td>
        </tr>
    );
};
