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

library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() internal pure returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() internal pure returns (G2Point memory) {
        // Original code point
        return G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );

/*
        // Changed by Jordi point
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
*/
    }
    /// @return r the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) internal pure returns (G1Point memory r) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-add-failed");
    }
    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success,"pairing-mul-failed");
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length,"pairing-lengths-failed");
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[0];
            input[i * 6 + 3] = p2[i].X[1];
            input[i * 6 + 4] = p2[i].Y[0];
            input[i * 6 + 5] = p2[i].Y[1];
        }
        uint[1] memory out;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-opcode-failed");
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}
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
            [20811421595103055531497797642014257951029967857584721324620770552576936347277,
             3734535041904303363458670783213342858964687368834351564716339214823507257061],
            [5126746770964100463724354789930131651807753714583657710396809449250371844000,
             20720453072711127432421114579727590131300082703361461661689354417623999199001]
        );
        vk.IC = new Pairing.G1Point[](58);
        
        vk.IC[0] = Pairing.G1Point( 
            9698585186919394218156802851403755497250702875586764643121477031807029830183,
            10951600263106208970368881063799484025923770703370180070175320492262576494407
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            21003407290445081274796395760963260872197155867348574094389868937102558661612,
            17410540861674568261209669856830766176314459683539813161440676239855335199660
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            12021476361513125632700239437900159682731284972054075746865394458804651140354,
            13908599406134462088103291952668983456591591761401812219486127641260261217060
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            11840086243570915138656269197265900665260384352961470087635504989839477676655,
            15880449860369187268546708637816196279430652882827411479256290355593409126877
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            16982192699828443807961549220991497238757558753993140072037974517932132470605,
            12509399037624146065656634400458458130428954666838241416938806857646014416948
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            8149433142731124377623718466379902917468154313922741750684314339877901597784,
            1548562107386373775489362814736387099926037005302586837830694904511961062356
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            12204004214384384195329160384249848748271919502659271445705127961582700679998,
            8714004843944667820588367406756842302775105033144680857397053231212865246979
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            13319553960657202358969997577395705996400863123161800459892818053146889548555,
            17568560112311585882907140966430713624964389203162678470131414112101812139749
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            8138173923554491002846575118937717235376362311053411718356208003870260914082,
            19721380524555319073468133083406825125319902533635001805817221429623979067668
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            17595488290682254531165242435914110264036174181387287544492946970534630610793,
            15567721315407525816656793595781509282432035564546705881201180518497846262561
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            21246926139146040076878164835188347468472475358209066965116165809721467966653,
            4253567513352300470432188214622540771377645380170299471921413710488479831801
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            14752461278957044119157363072851805079717233428315438341940929963183590903503,
            21753177153017060630647540579478873751122693945304637186270171807256196178147
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            785514901077036187869275347858215999194508626508251692394151052802665342562,
            13720281190898226405048922480258626677311965728981872559900732684374839879696
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            1862474445489119109946372786157511998170290673559101677194198472132632491460,
            6475229305728851103399846622493506337449948880066090102563690423957997867921
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            19445509689811459001871428630909095380325308281832616276672554222149853816798,
            10218485412455201669269519162033239717026149579645823459112968022764945705668
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            14921008697215004316667791642481274346968193258332170296013572104492010255915,
            3976744756309086624078609643229600765493017922655092486586342469937665721441
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            8450788410766637589490570100200987923380945596464966756662481212462451533519,
            17905822810682822442706492571555779207612026967644543788413877355486602639776
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            3586262884796138661364412587962101107942157712451127333046952257863977416489,
            21702014906827914715269965134598318870386759068632504030489657223628956172910
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            2156327868701823837990175856515421581405005933749021206627156824019714848717,
            19448275868494876193960449864479490593357345585608966234115273864084202576268
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            18030521957052139185624544078988057458948987761422114345400160799684049469657,
            18184407252657424316641138089745997319348944532001537735283585119337556275435
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            18630320611937323298781382543873391867884314254750966354534074348143807075953,
            11311730599920385331586120134825684303844199134541753051082017946272597796802
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            5146128575966996047027976344030890093731287400688182027636667133315297263407,
            6585799090527646135461968145789616870837132627009923491778944616843526233899
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            18139563414999736899030346646995022071993150960635496360827574430172799936013,
            163248036213558448011611008134093653497436202239201252807687932543545799948
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            15965960031762244816360254206233125740467707337710985805864474425182627217400,
            7781610073052663596811741192603552003362299153284507538425287125279845119048
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            21397462624508971709795110897572055049780784328983297338604401570717837853011,
            5484404263964385505785457351686383396621881362060706441999338935131002434186
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            9592077251449139751626527769597249100286643560268007006792512621976524982667,
            21140700735233435788989089059672942361427163372212820398640702815273776282215
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            450341348104022506803823117728114861616205740934710617990709994950157878612,
            15333820387540208053870801627102737961053920177589119147058668605060117784815
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            15212745469376706577695659061547856399701605200678380883515398834826528774312,
            10979411701928505036194364697126805949678227083338323452293020262193914731169
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            11882715599640185435016513179004859823998310313453102188607363393959540804639,
            6339234466598957164325204020200516890733952864644857819553098557772060832205
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            5146514479561182248374382158049666981983505723627710422622946540088347347287,
            20215846865777469174210785953288968901253836155222002509480163778761935253177
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            18933950822249578940008537272872496010522193200564136371131774941317575931790,
            14242430318203147318609587746778963904120601929651026780402494760351747233509
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            1176349613842439967070515980581011490111594668188905929093846083911578331522,
            7429516837810605416395327569076800779803066137906389236252083023488571073731
        );                                      
        
        vk.IC[32] = Pairing.G1Point( 
            14242527361145491204074153629532257153373843046783492973484326787485113216541,
            18253427981260623526881608855991663322693585905065000625460220589141171474472
        );                                      
        
        vk.IC[33] = Pairing.G1Point( 
            19342244282845367854757597117339367858561757307750039719414794631945096468182,
            14179752208750378348735401546579149219928298641023282563796656673984860568461
        );                                      
        
        vk.IC[34] = Pairing.G1Point( 
            14104861589452504937136047772733936924225683404867129116244564776358994350433,
            19525460918886549768873366141610868038169470310006220388327991145761828548369
        );                                      
        
        vk.IC[35] = Pairing.G1Point( 
            19882327737002011707242481134500446345028904159662878600793260957112212811962,
            2614146290398322209384833715224330986815376681361285436216646134773120429747
        );                                      
        
        vk.IC[36] = Pairing.G1Point( 
            8396811717874554719066021138857927606087885918923090751181369614472515732077,
            508029648684649705861367038157302993120496589460247467286383289607997104152
        );                                      
        
        vk.IC[37] = Pairing.G1Point( 
            11260619275395631449310567528322566771511708080426819273333763674337894988886,
            11609880608715007840909173233568459522496032614498420819367915723759899948772
        );                                      
        
        vk.IC[38] = Pairing.G1Point( 
            20939639390942080947340172243332865637424513405859568854252851994125880444365,
            1354677566665407109779060363689170477013053489829350672599894131331154886091
        );                                      
        
        vk.IC[39] = Pairing.G1Point( 
            16016443467293692207524160058274684121064864635157799894586353278112656759415,
            6416586574673112172881435174315414214886132707177075615436479692830692601261
        );                                      
        
        vk.IC[40] = Pairing.G1Point( 
            9731309082777259380242094923391558776463872635054878771897679232728561768412,
            15078751466788589361207759243106880544928950689973159083146399723557767154050
        );                                      
        
        vk.IC[41] = Pairing.G1Point( 
            21417650433914782853031334760066226891397873186254291837803543098918033970710,
            21281549137085411790563947186337231231193172825709139662453710668150684139089
        );                                      
        
        vk.IC[42] = Pairing.G1Point( 
            3849986056661078712254394350684385948780275550305967867402925543968519961570,
            12903675626390456645405884272886937425590427857841019161379951832161418942370
        );                                      
        
        vk.IC[43] = Pairing.G1Point( 
            11054210340983120231225034755166282660601995653476128920988729859081996114171,
            6115744919989553920450531518061305900150054849883837581604310563589604655069
        );                                      
        
        vk.IC[44] = Pairing.G1Point( 
            4354653769041808560478147092778043165959874272984650663415519487667197260443,
            8965699664074603954043103046152772611933577623798033100616430328792443328148
        );                                      
        
        vk.IC[45] = Pairing.G1Point( 
            4741889976026028384735850476750831133763832376219094755439672096218346585267,
            10557205162140055898510065714756127009406644738768237995981294056162546856538
        );                                      
        
        vk.IC[46] = Pairing.G1Point( 
            13294382385400738917318592119654512874167973891372228524208108990186085200906,
            15832099679997019301683078920900131139107606629286964109813610409393792509037
        );                                      
        
        vk.IC[47] = Pairing.G1Point( 
            17520719670425085784513013645009543699793410415367336629194425756877482120060,
            3851010526177502908575737944592469978308638134975129033825049327800841772066
        );                                      
        
        vk.IC[48] = Pairing.G1Point( 
            20232301066160292852328206857905484426291947757215183782139303220328071002135,
            9875225367031358848284104090253226491301521351346220310712046394408366612799
        );                                      
        
        vk.IC[49] = Pairing.G1Point( 
            13414177918145842332595921938672204108952371840460500201919542901903292471280,
            16926883908640098608986106752668073239248856604069382243790380226309120697911
        );                                      
        
        vk.IC[50] = Pairing.G1Point( 
            9739185318103782214030252283164143660875086515800324828795124612661793609742,
            21132966217108841508780646148024767642557078715252276670279401571571013903177
        );                                      
        
        vk.IC[51] = Pairing.G1Point( 
            5963249024104547592221580898996638962482382208182504910434483987951360246131,
            21597755355441446776139812336479121520890719302028008081222259994095343402096
        );                                      
        
        vk.IC[52] = Pairing.G1Point( 
            4329753201766795050113229784787693588587375371795199482942482306386614436138,
            19860323407462752859274289403438285391862084546682430784235999151001437031227
        );                                      
        
        vk.IC[53] = Pairing.G1Point( 
            3004571356698144088354789674068527949203601242299852854158850539231603239288,
            3273916576191686238023281648851033242719080219219108642421468931277040495092
        );                                      
        
        vk.IC[54] = Pairing.G1Point( 
            21661359790891303188540552000279338687542003370245569898941452019368468831092,
            4979865762856360028165967966546581107627523027442067137109691546819190290605
        );                                      
        
        vk.IC[55] = Pairing.G1Point( 
            17386942218877934583514168327796575477150717039593272513153592020041057966691,
            19203528913696151942876092235624665954143967317721129258562869734899181509475
        );                                      
        
        vk.IC[56] = Pairing.G1Point( 
            4502430157376374031419255331681199683093983173212781590638101929860787797264,
            12676724830011697832928796028588474804934851106159907078239646709730444554169
        );                                      
        
        vk.IC[57] = Pairing.G1Point( 
            2324012128824893442154951529343411980332748265092272468533373907664878495109,
            2906463770222646074093159885780014695968765352167539934456145667725756749703
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
            uint[57] memory input
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
