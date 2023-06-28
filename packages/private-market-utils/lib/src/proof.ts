import { buildPoseidon } from 'circomlibjs';
import { PythonShell } from 'python-shell';

export const pyMakeInputsForGroth16Proof = async (
    proofPath: string,
    publicInputsPath: string,
    vkeyPath: string,
    outFile: string
) => {
    const m = await PythonShell.run('lib/src/py/script.py', {
        args: [
            `${proofPath}`,
            `${publicInputsPath}`,
            `${vkeyPath}`,
            `${outFile}`,
        ],
    });
    return m;
};

export const flattenGroth16Proof = (chunkedGroth16Proof: any) => {
    const flat = [
        ...chunkedGroth16Proof.negpa[0],
        ...chunkedGroth16Proof.negpa[1],
        ...chunkedGroth16Proof.pb[0][0],
        ...chunkedGroth16Proof.pb[0][1],
        ...chunkedGroth16Proof.pb[1][0],
        ...chunkedGroth16Proof.pb[1][1],
        ...chunkedGroth16Proof.pc[0],
        ...chunkedGroth16Proof.pc[1],
    ];
    return flat;
};

export const flattenGroth16Vkey = (chunkedGroth16Proof: any) => {
    const flat = [
        ...chunkedGroth16Proof.negalfa1xbeta2,
        ...chunkedGroth16Proof.gamma2,
        ...chunkedGroth16Proof.delta2,
        ...chunkedGroth16Proof.IC,
    ];
    const flattened = flat.flat(100); // generous flat depth
    flattened.forEach((el: any, i: number) => {
        flattened[i] = BigInt(el);
    });
    return flattened;
};

export const hashGroth16Vkey = async (
    flattenedVkey: bigint[],
    nPoseidonInstances: number,
    nInputs: number
) => {
    const poseidon = await buildPoseidon();
    const F = poseidon.F;
    const baseHashes = [];

    for (let i = 0; i < nPoseidonInstances; i++) {
        // 12 is the number of poseidon hashing instances in circuit
        // each poseidon instance takes 16 inputs
        const input = flattenedVkey.slice(i * nInputs, (i + 1) * nInputs);
        const hash = F.toObject(poseidon(input));
        baseHashes.push(hash);
    }

    const finalHash = F.toObject(poseidon(baseHashes));
    return finalHash;
};
