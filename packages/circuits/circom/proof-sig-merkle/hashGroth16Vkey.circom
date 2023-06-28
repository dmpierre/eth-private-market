pragma circom 2.0.3;

template HashGroth16Vkey(nPoseidonHash, nHashInputs) {
    // we hash our verification key in n parts due to poseidon hashing size limits
    // poseidon impl limits to nHashInputs inputs max, see in PoseidonEx:
    // var t = nInputs + 1;
    // var N_ROUNDS_P[nHashInputs] = [56, 57, 56, 60, 60, 63, 64, 63, 60, 66, 60, 65, 70, 60, 64, 68];
    // N_ROUNDS_P[t - 2]

    // nPoseidonHash: number of poseidon components
    // nHashInputs: number of inputs to each poseidon component
    // nInputs: number of inputs in total (flattened vKey)
    assert(nHashInputs < 17); // poseidon impl limits to 16 inputs max
    assert(nPoseidonHash < 17); // all results of each will be hashed into a single output

    var k = 6;
    var j;
    var i;
    var l;
    var nInputs = nPoseidonHash * nHashInputs;

    // verification key inputs is flattened into a single array
    signal input inputs[nInputs];
    signal output out;

    component poseidonHasher[nPoseidonHash];
    for (j = 0; j < nPoseidonHash; j++) {
        poseidonHasher[j] = Poseidon(nHashInputs);
    }

    for (j = 0; j < nPoseidonHash; j++) {
        for (i = 0; i < nHashInputs; i++) {
            poseidonHasher[j].inputs[i] <== inputs[j * nHashInputs + i];
        }
    }

    // to make onchain calldata smaller hash to a single output
    component finalHasher = Poseidon(nPoseidonHash);
    for (j = 0; j < nPoseidonHash; j++) {
        finalHasher.inputs[j] <== poseidonHasher[j].out;
    }
    out <== finalHasher.out;
}