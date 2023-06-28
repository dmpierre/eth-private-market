pragma circom 2.0.3;

include "./sellSigPublicMessageEdDSA.circom";

component main { public [ pubKeyJubJubSeller, messagePreImage, message, sharedKeyHash, signaturePoseidonNonce, poseidonEncryptedSig ] } = SellSigPublicMessageEdDSA();