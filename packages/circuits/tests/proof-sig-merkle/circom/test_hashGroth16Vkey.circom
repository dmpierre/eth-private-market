pragma circom 2.0.3;

include "../../../node_modules/circomlib/circuits/poseidon.circom";
include "../../../circom/proof-sig-merkle/hashGroth16Vkey.circom";

// our circuit sig-merkle circuit originally has 5 inputs
component main = HashGroth16Vkey(12, 16);
