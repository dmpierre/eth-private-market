import { Ask } from '@/types/types';
import { formatPubJubJubKey } from '@/utils/crypto';
import { formatEther } from 'viem';

interface AskInspectProps {
    inspectingAsk: Ask;
}

export const AskInspect: React.FC<AskInspectProps> = ({ inspectingAsk }) => {
    const objType =
        inspectingAsk.objectType == 'ETHAddress'
            ? 'address'
            : inspectingAsk.objectType == 'SigMerkleGroth16Proof'
            ? 'proof'
            : 'signature';
    const price =
        inspectingAsk.objectType == 'ETHAddress'
            ? inspectingAsk.ethAddress.price
            : inspectingAsk.objectType == 'SigMerkleGroth16Proof'
            ? inspectingAsk.sigMerkleGroth16Proof.price
            : inspectingAsk.signature.price;

    return (
        <>
            <div className="font-mono font-bold capitalize">
                Ask - {objType}{' '}
            </div>
            <div>
                {' '}
                <span className="font-mono font-bold"> Ask ID</span>:{' '}
                {inspectingAsk.id.toString()}
            </div>
            <div className="text-ellipsis overflow-clip">
                <span className="font-mono md:text-base font-bold">Asker</span>:{' '}
                {inspectingAsk.from}
            </div>
            <div className="text-ellipsis overflow-clip">
                <span className="font-mono font-bold">For</span>:
                <span className="md:text-base ">
                    {' ' + inspectingAsk.objectType}
                </span>
            </div>
            <div className="text-ellipsis overflow-clip">
                {inspectingAsk.objectType == 'SigMerkleGroth16Proof' ? (
                    <>
                        <span className="font-mono font-bold">Group root</span>:{' '}
                        {inspectingAsk.sigMerkleGroth16Proof.groupRoot
                            .toString()
                            .slice(0, 10) + '...'}
                        <br />
                        <span className="font-mono font-bold">
                            VKey Hash
                        </span>:{' '}
                        {inspectingAsk.sigMerkleGroth16Proof.vKeyhash
                            .toString()
                            .slice(0, 10) + '...'}
                    </>
                ) : inspectingAsk.objectType == 'ETHAddress' ? (
                    <>
                        <span className="font-mono font-bold">Address</span>:{' '}
                        {inspectingAsk.ethAddress.keccakAddress}
                    </>
                ) : (
                    <>
                        <span className="font-mono font-bold">
                            Signing keys
                        </span>
                        :{' '}
                        {inspectingAsk.signature.signingKey[0]
                            .toString()
                            .slice(0, 10) + '...'}
                        ,{' '}
                        {inspectingAsk.signature.signingKey[1]
                            .toString()
                            .slice(0, 10) + '...'}
                    </>
                )}
            </div>
            <div>
                <span className="font-mono font-bold">Price</span>:
                {' ' + formatEther(price).toString()} ETH
            </div>
            <div>
                <span className="font-mono font-bold">Public key</span>:{' '}
                {formatPubJubJubKey(inspectingAsk.fromPubKey)}
            </div>
        </>
    );
};
