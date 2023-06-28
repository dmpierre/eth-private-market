pragma circom 2.0.3;

include "../checkAndEncryptETHAddress.circom";
include "../../lib/poseidon.circom"; // from maci-circuits initially

/*
     This circuit is used within the ask setup. It does not require to check
     the validity of an ECDH shared key, since it is not used. The shared key
     has been committed onchain, we make the hash of this shared key public 
     and check against this commmitment when posting the proof.
*/

template SellETHAddressNoECDH(n, k) {

     signal input sharedKey[2]; // private
     signal input sharedKeyHash; // public

     signal input poseidonNonce; // public
     signal input encryptedPrivECDSAKey[7]; // public
     
     signal input privECDSAKey[4]; // private

     signal output address;

     var i;

     /* 
          1. Hash the shared key 
          Ensure that it corresponds to the committed one. 
     */

     component poseidonSharedKey = Poseidon(2);
     poseidonSharedKey.inputs[0] <== sharedKey[0];
     poseidonSharedKey.inputs[1] <== sharedKey[1];

     poseidonSharedKey.out === sharedKeyHash;

     /*
          2. Check that the private key derives to the sold address and that its encryption is correct
     */
     component sellETHAddress = CheckAndEncryptETHAddress(n, k);

     sellETHAddress.sharedKey[0] <== sharedKey[0];
     sellETHAddress.sharedKey[1] <== sharedKey[1];
     sellETHAddress.poseidonNonce <== poseidonNonce;


     for (i = 0; i < 7; i++) {
          sellETHAddress.encryptedPrivECDSAKey[i] <== encryptedPrivECDSAKey[i];
     }

     for (i = 0; i < 4; i++) {
          sellETHAddress.privECDSAKey[i] <== privECDSAKey[i];
     }

     address <== sellETHAddress.address;
}

component main{ public [ sharedKeyHash, poseidonNonce, encryptedPrivECDSAKey ] } = SellETHAddressNoECDH(64, 4);
