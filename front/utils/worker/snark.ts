importScripts('/snarkjs.min.js');

addEventListener(
    'message',
    async (event: MessageEvent<{ inputs: any; zkey: any; wasm: string }>) => {
        console.log('Proof generation', event.data);
        try {
            //@ts-expect-error
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                event.data.inputs,
                `/${event.data.wasm}`,
                { type: 'mem', data: new Uint8Array(event.data.zkey) }
            );
            console.log('Proof generated', proof);
            postMessage({
                proof: proof,
                publicSignals: publicSignals,
                error: undefined,
            });
        } catch (error) {
            postMessage({
                proof: undefined,
                publicSignals: undefined,
                error: 'Proof generation failed',
            });
        }
    }
);
