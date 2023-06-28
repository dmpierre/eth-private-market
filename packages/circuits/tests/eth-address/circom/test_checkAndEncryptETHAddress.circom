pragma circom 2.0.3;

include "../../../circom/eth-address/checkAndEncryptETHAddress.circom";

component main{ public [ poseidonNonce, encryptedPrivECDSAKey ] } = CheckAndEncryptETHAddress(64, 4);