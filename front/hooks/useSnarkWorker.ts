import { useRef, useEffect, useState } from 'react';

export const useSnarkWorker = () => {
    const workerRef = useRef<Worker>();
    const [proof, setproof] = useState();
    const [publicSignals, setpublicSignals] = useState();
    const [error, seterror] = useState<string | undefined>();
    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../utils/worker/snark.ts', import.meta.url)
        );
        workerRef.current.onmessage = (
            e: MessageEvent<{
                proof: any;
                publicSignals: any;
                error: undefined | any;
            }>
        ) => {
            setproof(e.data.proof);
            seterror(e.data.error);
            setpublicSignals(e.data.publicSignals);
        };
        workerRef.current.onerror = (e) => {
            console.log('Worker error: ', e);
        };
        return () => {
            workerRef.current?.terminate();
        };
    }, [setproof, setpublicSignals]);

    return {
        proof,
        publicSignals,
        workerRef,
        error,
    };
};
