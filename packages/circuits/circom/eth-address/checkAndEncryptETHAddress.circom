pragma circom 2.0.3;

include "../../node_modules/circom-ecdsa/circuits/eth_addr.circom";
include "../lib/poseidon.circom"; // from maci-circuits initially

/*
     This circuit carries out the following:
          1. Derives an Ethereum address from an ECDSA private key
          2. Checks the correctness of an encryption of the ECDSA private key
     The private key is split in k registers of n bits each.
*/

template CheckAndEncryptETHAddress(n, k) { // usually n: 64, k: 4

     signal input sharedKey[2]; // private

     signal input poseidonNonce; // public
     signal input encryptedPrivECDSAKey[7]; // public
     
     signal input privECDSAKey[4]; // private

     signal output address;

     var i;

     /* 
          1. Ensure provided ECDSA private key is correct
          Derive eth address from priv key
     */ 

     component ethAddr = PrivKeyToAddr(n, k);
     for (i = 0; i < k; i++) {
          ethAddr.privkey[i] <== privECDSAKey[i];
     }

     address <== ethAddr.addr;

     /* 
          2. Check correctness of the encryption
          Decrypt provided ciphertext, ensure that it corresponds to encrypted priv key.
     */

     component p = PoseidonEncryptCheck(4);
     p.nonce <== poseidonNonce;

     for (i = 0; i < 7; i++) {
          p.ciphertext[i] <== encryptedPrivECDSAKey[i];
     }

     for (i = 0; i < k; i++) {
          p.message[i] <== privECDSAKey[i];
     }

     p.key[0] <== sharedKey[0];
     p.key[1] <== sharedKey[1];
     p.out === 1;


}
