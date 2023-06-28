import fs from 'fs';
import { utilsProof } from '../lib/index';
import { ethers } from 'ethers';
const main = async () => {
    // take as cli args: path to an example proof, public signals, vkey
    const proofPath = process.argv[2];
    const publicInputsPath = process.argv[3];
    const vkeyPath = process.argv[4];
    const pyOut = 'vKeyHashPrepared.json';

    const m = await utilsProof.pyMakeInputsForGroth16Proof(
        `${proofPath}`,
        `${publicInputsPath}`,
        `${vkeyPath}`,
        `${pyOut}`
    );

    const preparedProof = JSON.parse(
        fs.readFileSync(__dirname + '/../' + pyOut).toString()
    );
    const flattenedVkey = utilsProof.flattenGroth16Vkey(preparedProof);
    const vkeyHash = await utilsProof.hashGroth16Vkey(flattenedVkey, 12, 16);

    console.log('Vkey Hash:', vkeyHash.toString());

    fs.unlinkSync(__dirname + '/../' + pyOut);

    return 0;
};

main();
