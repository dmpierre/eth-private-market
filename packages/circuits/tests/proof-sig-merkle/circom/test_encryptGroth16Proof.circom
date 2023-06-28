pragma circom 2.0.3;

include "../../../circom/lib/poseidon.circom"; // from maci-circuits initially
include "../../../circom/proof-sig-merkle/encryptGroth16Proof.circom";

// our poseidon encrypted groth16 proof is composed of 55 field elements
component main { public [ encryptedProof, poseidonNonce ] } = EncryptGroth16Proof(48);