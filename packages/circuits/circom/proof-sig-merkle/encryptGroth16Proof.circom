pragma circom 2.0.3;

template EncryptGroth16Proof(l) {
    var k = 6;
    var i;
    var j;

    signal input encryptedProof[l+1];
    signal input poseidonNonce;
    signal input negpa[2][k];
    signal input pc[2][k];
    signal input pb[2][2][k];
    signal input sharedKey[2];

    component p = PoseidonEncryptCheck(l);
    p.nonce <== poseidonNonce;

    for (i = 0; i < l+1; i++) {
        p.ciphertext[i] <== encryptedProof[i];
    }

    for (i = 0; i < k; i++) {
        p.message[i] <== negpa[0][i];
        p.message[i+k] <== negpa[1][i];
        p.message[i+2*k] <== pb[0][0][i];
        p.message[i+3*k] <== pb[0][1][i];
        p.message[i+4*k] <== pb[1][0][i];
        p.message[i+5*k] <== pb[1][1][i];
        p.message[i+6*k] <== pc[0][i];
        p.message[i+7*k] <== pc[1][i];
    }

    p.key[0] <== sharedKey[0];
    p.key[1] <== sharedKey[1];

    p.out === 1;

}
