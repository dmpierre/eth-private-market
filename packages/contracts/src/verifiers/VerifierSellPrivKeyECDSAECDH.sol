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
            [4356737843766884846258605518176956617595634546919223061113503228165012476185,
             14958072704016454351012013685750355300365791487035184174308670020632625450543],
            [19498602049235632719115897029699649963835770845662591363609136642426762978300,
             7763496510193562669491784362477227053898821518588190905261836504010493679430]
        );
        vk.IC = new Pairing.G1Point[](14);
        
        vk.IC[0] = Pairing.G1Point( 
            21452859615317586429027031716710017869712094086381651302864271769962390252091,
            6603338324707166987361881601453185689585436648641424552628595879287240493394
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            9306538242394099897381296327645349681629155716832221578331162636095739996206,
            5277096821994856768409698656877883425278958772475045894075369734881142154127
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            9485063129319938256866298305156120802955056696501264728565119870460546533223,
            13434381468867705188860905976386077782362628084834997821650192302691031489391
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            6510035403371907559442689444084260405644109749179094583992423826747581532984,
            10042867508833701791115413557247806039574588150982130794925033186654923680704
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            9601526665507972733623430542452970017857225655311157418100210558367946061215,
            18336226875316644845346648933098248939297193494636132358063363032283681990847
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            8865985302205915320951861403565891570255386762555139359321740665246901141964,
            8202508604974366228962689757897043576410301600280469057522650723882230415491
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            12974082011309371278436786123366531430257242188586568302905541414776537140327,
            5474294539622073575057425360237962099667308561467707412275428448097896584041
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            14350870005626934328221077709618479825285908706263089472600251986261357153525,
            2678487843242995693725986248109664091732691065730220870760328826548749072501
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            5790387270837335810927839632912692667299800531378200251665179480906368871943,
            9320539315784202353719529360963758779994536827121094276398920056678069586614
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            16887275061831852100877623086772255745763949053898068857511505876670795666507,
            6967504118393583338069488151606335437158951151454234040326845345309141763680
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            7877107204087427147778953582112774370219300605274901488707944370452895207409,
            13191921724717627205008310289261477375741836425731077133054265822926136378907
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            20756412484142494063922421783520237746278104366793418297152479001602039123983,
            3711388858382561248573786432189721667203974207804768774754564258880900810169
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            18742347527811156223204342266041260831913971243584004527372866258117694970546,
            19756428271257544971225623904717903368620930003463666214042840421730721006471
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            14488198197799372301866165996994272165297634907919122479498031432999209061632,
            19380868459253300691108469181961146032892804953798405935129799019941490463584
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
            uint[13] memory input
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
