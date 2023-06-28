pragma circom 2.0.2;

include "../../node_modules/circomlib/circuits/babyjub.circom";
include "ecdh.circom";

template SharedJubJubKeyCheck () {
     
     signal input pubA[2];
     signal input privA;
     signal input pubB[2];
     signal input sharedKey[2];

     /* 
          1. Derive the public jubjub key from the private key
          Ensures that the computed shared key will use correct keys.
     */

     component privToPub = BabyPbk();

     privToPub.in <== privA;

     privToPub.Ax === pubA[0];
     privToPub.Ay === pubA[1];

     /* 
          2. Compute the ECDH value to obtain the shared key
          Ensures that the computed shared key is correct.
     */
     component ecdh = Ecdh();

     ecdh.privKey <== privA;
     ecdh.pubKey[0] <== pubB[0];
     ecdh.pubKey[1] <== pubB[1];

     ecdh.sharedKey[0] === sharedKey[0];
     ecdh.sharedKey[1] === sharedKey[1];

}