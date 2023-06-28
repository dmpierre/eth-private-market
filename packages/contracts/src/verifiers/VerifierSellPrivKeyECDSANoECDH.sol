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

import './PairingLib.sol';

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
            [14570670513779948059277829551660706267678935281737076644783556168312262548967,
             15310336022576332724359660989944424194964259169392853007699412354786565102054],
            [17321907561285911898851029716696908032844016551376343824806225139503777437799,
             8379225342956644422669691764081023549407777513565834777990872662219644377469]
        );
        vk.IC = new Pairing.G1Point[](11);
        
        vk.IC[0] = Pairing.G1Point( 
            8770391279673133166540129406460497272066446786541567217183348236312753041985,
            16537247464128582282856719236949930318650171860728445757516968465337595524563
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            5621990617886881825283491167547844696221310399052975435005016779537394697047,
            19569706647377757342283461201879969194099947682678611812032603703336244865674
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            13480177205078132454253599934521218797200177300185776161036686842968976248558,
            17029518292566313140742651359973405107103274687735470607806136915492402044272
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            21054300193771974353718880516431881686826769776534030637596929944303203604482,
            4791779051817084183623835857907124463172736983849767620303040251812765945444
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            1396267230894711962200604305933356781290640912023669290868473187461055185810,
            2295095502055824533993220724322028849042191442366875824450622513795992383751
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            10660432672823237947776108089418509833205330158045050892722039959835938298871,
            3900198807204467568083361271914744758568771849553374179310689278298843597915
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            15310540971506600274577479890729275315188344617773616252159558403324882692556,
            2792003670619011010355772131201028273098844974979208053711960531159450812253
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            1644571841307420375418659483580592272589733773856387732641818617771151398494,
            2056561412300825281109930515746682997989238969105271382553999026798408063999
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            16702355371788724973208668544295659061245848938476292012637865913721382121544,
            15545856717635567590318971118648784443917238215972082123764254828960404879870
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            19591080289096512283576774519665171394432668053749279766243106688946467757766,
            10889849136485880741425268814947802409162997825495622428601403733217628868888
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            17502255725138529790144155968150024438600749008063141449182519422973927691958,
            11625406066819730702383971620468951137032211566497523328654600036876851984354
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
            uint[10] memory input
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
