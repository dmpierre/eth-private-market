pragma circom 2.0.3;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circom-ecdsa/circuits/ecdsa.circom";
include "../../node_modules/circom-ecdsa/circuits/zk-identity/eth.circom";
include "../../node_modules/heyanon-circuits/circuits/dizkus.circom";

/*
     From HeyAnon repo: 
               https://github.com/personaelabs/heyanon-circuits
     This circuit:
          1. Checks the validity of an ECDSA sig
          2. Calculates pubkey --> address 
          3. Checks Merkle proof
     Detailed comments can be found in the Dizkus circuit file
*/

component main { public [ root, msghash ] } = Dizkus(64, 4, 30);