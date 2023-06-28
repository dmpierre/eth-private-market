pragma circom 2.0.3;

include "../checkAndEncryptETHAddress.circom";
include "../../lib/sharedKeyCheck.circom";

/*
     This circuit is used within the bid setup. We check here that 
     the ECDH value has been correctly computed. We make the public key of the seller
     public so that the buyer - bidder - can compute the shared key value after the
     sale has been made. 
*/

template SellETHAddressECDH(n, k) {
     
     signal input sellerPubJubJub[2]; // public
     signal input sellerPrivJubJub; // private

     signal input buyerPubJubJub[2]; // public

     signal input sharedKey[2]; // private

     signal input poseidonNonce; // public
     signal input encryptedPrivECDSAKey[7]; // public
     
     signal input privECDSAKey[4]; // private

     signal output address;

     /*
          1. Check that the shared key is correctly computed
     */
     component sharedKeyCheck = SharedJubJubKeyCheck();
     
     sharedKeyCheck.pubA[0] <== sellerPubJubJub[0];
     sharedKeyCheck.pubA[1] <== sellerPubJubJub[1];
     sharedKeyCheck.privA <== sellerPrivJubJub;
     
     sharedKeyCheck.pubB[0] <== buyerPubJubJub[0];
     sharedKeyCheck.pubB[1] <== buyerPubJubJub[1];
     
     sharedKeyCheck.sharedKey[0] <== sharedKey[0];
     sharedKeyCheck.sharedKey[1] <== sharedKey[1];

     /*
          2. Check the sold address is correct
     */
     component sellETHAddress = CheckAndEncryptETHAddress(n, k);

     sellETHAddress.sharedKey[0] <== sharedKey[0];
     sellETHAddress.sharedKey[1] <== sharedKey[1];
     sellETHAddress.poseidonNonce <== poseidonNonce;

     var i;

     for (i = 0; i < 7; i++) {
          sellETHAddress.encryptedPrivECDSAKey[i] <== encryptedPrivECDSAKey[i];
     }

     for (i = 0; i < 4; i++) {
          sellETHAddress.privECDSAKey[i] <== privECDSAKey[i];
     }

     address <== sellETHAddress.address;
}

component main{ public [ sellerPubJubJub, buyerPubJubJub, poseidonNonce, encryptedPrivECDSAKey ] } = SellETHAddressECDH(64, 4);