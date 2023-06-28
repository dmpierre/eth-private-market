pragma circom 2.0.3;

include "../../../circom/eddsa-signature/sellSigPublicMessageEdDSA.circom";

component main { public [ pubKeyJubJubSeller, messagePreImage, message, sharedKeyHash, signaturePoseidonNonce, poseidonEncryptedSig ] } = SellSigPublicMessageEdDSA();