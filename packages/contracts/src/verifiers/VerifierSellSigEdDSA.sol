//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "./PairingLib.sol";

contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }
    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }
    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(
            20491192805390485299153009773594534940189261866228447918068658471970481763042,
            9383485363053290200918347156157836566562967994039712273449902621266178545958
        );

        vk.beta2 = Pairing.G2Point(
            [4252822878758300859123897981450591353533073413197771768651442665752259397132,
             6375614351688725206403948262868962793625744043794305715222011528459656738731],
            [21847035105528745403288232691147584728191162732299865338377159692350059136679,
             10505242626370262277552901082094356697409835680220590971873171140371331206856]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [13886535127403282457994632896760589609537938338081536671444459509996352306288,
             21293440185375192506668497380559837448672791041415249650751060322380486522809],
            [19547667889154214097227367082536675371020298080745481755064107761275176068296,
             8576274909947860127298429199352877846365754974584344616998989714659692826974]
        );
        vk.IC = new Pairing.G1Point[](12);
        
        vk.IC[0] = Pairing.G1Point( 
            4242647131886638098116196932094568765990688897114549990956534400233658279626,
            13435646575381443350281780967409613500187751151227179351825700930837428729380
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            11826462094514984119387023938276574997084487941801344330739664642326336353516,
            18669174517111299613810911363456953212904205294341823869291975791668553559299
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            19130334412590982252498456857169758507659397026414770083611831123862618845052,
            3534301075379190203247888784510131011643797936044633392053194801373458810331
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            19037115780750426967551672763703196489617568459372464596251670660115033056826,
            8549851571842015576318058295698303698066317947045350886279617612084870747119
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            19076828209270961853536882141617943149649877504621654629927069793231253780390,
            14932059292342908146811749934087899182014676681807437958939328994298149781526
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            8619003341292962059382098963814167182306021827969043854317084217711583663431,
            3715811641410352097054102239320725905320324098395950391943479937630552978936
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            20077431755623861993223472308534724094297858124638659595220155783218918569745,
            14871612075154813791227821417229416973310633493693122214703496845027199067113
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            19643183201216400505273527965796240763799745084965959303643985759053615684244,
            15208566706551890259537205508173697815273292823333904246056135053418216959293
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            16322939438836201295806742515084677085836553621327506064020507085849892994465,
            20674419799734170449075592929688531907927448373660362612697991796110182128298
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            9240663053394247490465202479214640506535970089089359362915326072240299028769,
            8291078381551798617059292122165481218525073590991031970711911939920069881915
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            14337827560065283521321877266317803198328810393583544787030639232639489819948,
            20768303970447021709077972897408970422250829213743288088856221478090297638636
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            10552112648427965122024203817367444433061093328325775329039883801040122217752,
            11492528744144353739554883372353371754473732628682747787955352421626028571644
        );                                      
        
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.IC.length,"verifier-bad-input");
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.IC[0]);
        if (!Pairing.pairingProd4(
            Pairing.negate(proof.A), proof.B,
            vk.alfa1, vk.beta2,
            vk_x, vk.gamma2,
            proof.C, vk.delta2
        )) return 1;
        return 0;
    }
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[11] memory input
        ) public view returns (bool r) {
        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.C = Pairing.G1Point(c[0], c[1]);
        uint[] memory inputValues = new uint[](input.length);
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
