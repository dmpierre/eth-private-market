pragma circom 2.0.2;

include "../../node_modules/circomlib/circuits/babyjub.circom";
include "../lib/poseidon.circom"; // from maci-circuits initially
include "../lib/verifySignature.circom"; // from maci-circuits initially

/*
     A seller has placed an ask order for a signature over a public message
     A buyer has escrowed some value for it, along with a public preimage
     The seller makes a proof that:
          1. The signature has been encrypted with the committed shared key
          2. The signature signs a hash whose preimage is the publicly committed one
          3. The signature is correct
          4. The encryption is correct
*/

template SellSigPublicMessageEdDSA() {

     signal input pubKeyJubJubSeller[2]; // public
     signal input messagePreImage[2]; // public

     signal input message; // public h( messagePreImage )

     signal input sharedKey[2]; // private
     signal input sharedKeyHash; // public
     signal input signaturePoseidonNonce; // public
     
     signal input eddsaSigR8[2]; // private
     signal input eddsaSigS; // private
     signal input poseidonEncryptedSig[4]; // public 

     var i;

     /* 
          1. Hash the shared key 
          Ensures that it corresponds to the committed one
     */

     component poseidonSharedKey = Poseidon(2);
     poseidonSharedKey.inputs[0] <== sharedKey[0];
     poseidonSharedKey.inputs[1] <== sharedKey[1];

     poseidonSharedKey.out === sharedKeyHash;

     /*
          2. Hash message preimage
          Check that h( messagePreImage ) === message
     */

     component poseidonPubJubJubBuyer = Poseidon(2);
     poseidonPubJubJubBuyer.inputs[0] <== messagePreImage[0];
     poseidonPubJubJubBuyer.inputs[1] <== messagePreImage[1];

     poseidonPubJubJubBuyer.out === message;

     /* 
          3. Check correctness of the signature
          Ensures that no other message than h( payload ) has been signed
     */

     component sigVerifier = EdDSAPoseidonVerifier_patched();
 
     sigVerifier.Ax <== pubKeyJubJubSeller[0];
     sigVerifier.Ay <== pubKeyJubJubSeller[1];
     sigVerifier.S <== eddsaSigS;
     sigVerifier.R8x <== eddsaSigR8[0];
     sigVerifier.R8y <== eddsaSigR8[1];
     sigVerifier.M <== message;
 
     sigVerifier.valid === 1;

     /*
          4. Check correctness of the encryption
          Ensures that encryption has been carried out with correct shared key
     */

     component pSig = PoseidonEncryptCheck(3);

     pSig.nonce <== signaturePoseidonNonce;
     for (i = 0; i < 4; i++) {
          pSig.ciphertext[i] <== poseidonEncryptedSig[i];
     }
     pSig.message[0] <== eddsaSigR8[0];
     pSig.message[1] <== eddsaSigR8[1];
     pSig.message[2] <== eddsaSigS;
     pSig.key[0] <== sharedKey[0];
     pSig.key[1] <== sharedKey[1];

     pSig.out === 1;

}
