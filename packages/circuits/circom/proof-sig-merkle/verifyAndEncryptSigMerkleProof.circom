pragma circom 2.0.3;

include "../lib/poseidon.circom"; // from maci-circuits initially
include "../../node_modules/circom-pairing/circuits/bn254/groth16.circom";
include "./encryptGroth16Proof.circom";
include "./hashGroth16Vkey.circom";

/*
     This circuit:
          1. verifies a proof
          2. encrypts the proof's content
          3. hashes the verification key
          4. hashes the shared key
*/

template verifyAndEncryptSigMerkleProof(publicInputCount, l, nPoseidonHash, nHashInputs) {
     /*
          In our setup, we werify a proof of a proof of:
               1. a valid signature over a message m 
               2. a merkle path resolving to root r
     */
     var k = 6;
     var m;
     var i;
     var j;
     var encryptedProofLength = l + 1;

     // verification key
     signal input negalfa1xbeta2[6][2][k]; // private
     signal input gamma2[2][2][k]; // private
     signal input delta2[2][2][k]; // private
     signal input IC[publicInputCount+1][2][k]; // private
     signal input vkHash; // public

     // proof
     signal input negpa[2][k]; // private
     signal input pb[2][2][k]; // private
     signal input pc[2][k]; // private
     signal input pubInput[publicInputCount]; // public

     // encryption
     signal input encryptedProof[encryptedProofLength]; // public
     signal input poseidonNonce; // public
     signal input sharedKey[2]; // private
     signal input sharedKeyHash; // public

     component verify = verifyProof(publicInputCount);
     component encrypt = EncryptGroth16Proof(l);
     component hash = HashGroth16Vkey(nPoseidonHash, nHashInputs);
     component poseidonSharedKey = Poseidon(2);

     var startIdxHashGamma2 = (k * 2 * k); // offset 
     var startIdxHashDelta2 = startIdxHashGamma2 + (k * 4);
     var startIdxHashIC = startIdxHashDelta2 + (k * 4);

     for (i = 0; i < 2; i ++) {
          for (j = 0; j < k; j++) {

               for (m = 0; m < k; m++) {
                    verify.negalfa1xbeta2[m][i][j] <== negalfa1xbeta2[m][i][j];

                    var idx = (m * k * 2) + (k * i) + (j);
                    hash.inputs[idx] <== negalfa1xbeta2[m][i][j];

               }

               verify.negpa[i][j] <== negpa[i][j];
               encrypt.negpa[i][j] <== negpa[i][j];

               verify.pc[i][j] <== pc[i][j];
               encrypt.pc[i][j] <== pc[i][j];

               for (m = 0; m < 2; m++) {

                    verify.gamma2[m][i][j] <== gamma2[m][i][j];

                    var idxGamma2 = startIdxHashGamma2 + (m * k * 2) + (k * i) + (j);
                    hash.inputs[idxGamma2] <== gamma2[m][i][j];

                    verify.delta2[m][i][j] <== delta2[m][i][j];

                    var idxDelta2 = startIdxHashDelta2 + (m * k * 2) + (k * i) + (j);
                    hash.inputs[idxDelta2] <== delta2[m][i][j];

                    verify.pb[m][i][j] <== pb[m][i][j];
                    encrypt.pb[m][i][j] <== pb[m][i][j];
               }

          }
     }

     for (i = 0; i < publicInputCount; i++) {
          verify.pubInput[i] <== pubInput[i];
          for (j = 0; j < k; j++) {
               for (m = 0; m < 2; m++) {
                    verify.IC[i][m][j] <== IC[i][m][j];

                    var idxIC = startIdxHashIC + (i * k * 2) + (k * m) + (j);
                    hash.inputs[idxIC] <== IC[i][m][j];
               }
          }
     }

     var lastStartHashIdx = startIdxHashIC + (publicInputCount * k * 2);
     for (j = 0; j < k; j++) {
          // last IC input
          for (m = 0; m < 2; m++) {
               verify.IC[publicInputCount][m][j] <== IC[publicInputCount][m][j];

               var lastIdxIC = lastStartHashIdx + (k * m) + (j);
               hash.inputs[lastIdxIC] <== IC[publicInputCount][m][j];

          }
     }

     for (i = 0; i < encryptedProofLength; i++) {
          encrypt.encryptedProof[i] <== encryptedProof[i];
     }

     encrypt.poseidonNonce <== poseidonNonce;
     encrypt.sharedKey[0] <== sharedKey[0];
     encrypt.sharedKey[1] <== sharedKey[1];

     poseidonSharedKey.inputs[0] <== sharedKey[0];
     poseidonSharedKey.inputs[1] <== sharedKey[1];
     
     poseidonSharedKey.out === sharedKeyHash; // check shared key commitment

     hash.out === vkHash; // check vkey commitment

     verify.out === 1; // check proof
}

component main { public [ vkHash, pubInput, encryptedProof, poseidonNonce, sharedKeyHash ] } = verifyAndEncryptSigMerkleProof(5, 48, 12, 16);