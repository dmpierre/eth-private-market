// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import 'forge-std/Test.sol';
import '../src/PrivateMarket.sol';
import './Shared.sol';

/**
    * @title PrivateMarketEdDSASigTest
    * @dev You can generate your own inputs when running a prove
    * script from packages/circuits. 
    * also see: yarn sig-eddsa:calldata
*/
contract PrivateMarketEdDSASigTest is Test, Shared {
    
    PrivateMarket public market;
    
    uint256[2] public signingKey = [
        19563043210874191006414833909890747477948066826349224887735652276936454972866,
        4313080986016539230899338404215930452516056786700912678745282875938458898347
    ];
    uint256[2] public pubKey = [
        19563043210874191006414833909890747477948066826349224887735652276936454972866,
        4313080986016539230899338404215930452516056786700912678745282875938458898347
    ];

    uint256[2] public messagePreImage = [
        1770103662352287879494575447226287239307999831992266523450769205078101229489,
        16466417850381441009430518137214327578841172189069445000875561550298324172419
    ];
    uint256 public message =
        9001018732871380923027263161070576090280368777722045227414210945032600201177;
    uint256 public sharedKeyCommitment =
        1317086134717038954780673537331722543077493327915722406222842507657055157594;
    uint256[2] public buyerPubkey = messagePreImage;
    uint256 public poseidonNonce = 1685784795419;

    uint256[2] public a = [
        0x2f8a590c44269f304aa51b6f916e28619834a3ba828dce29254aa3f0b706abe0,
        0x0bc3f7252e1dc71b3d48c9514cfc0340c8ebc37ec91d9950b7b26a6555177fce
    ];
    uint256[2][2] public b = [
        [
            0x295fab4f81420b8711bcf56e5122e83fa32ef98aa7946a0d39e818878f1a5ab3,
            0x05db740a46364032d6381ce43e0afb6e49ed4de6c41459a1c5aed4b409cbad56
        ],
        [
            0x22c027524c8b587279129b49cbadec3d99db5ee73aaf48e36931f1bec60bad99,
            0x3030c48ff65b0579833b8353b5e6b9f8aa31cf9fd8248dcb22ce45fb8ed9c61e
        ]
    ];
    uint256[2] public c = [
        0x07154c4e6c25db604486798dfd28c3350dcd2b0e08d4fae04a390c3275059a7f,
        0x0a22f118dbc47e9f143b6e86bf5160300ec7c405e53a24a8b7e9ff26c09bd6cc
    ];

    uint256[11] public inputs = [
        0x2b404a420a15098efd01ccf0638f393109c3a10f9406642a429301ea911025c2,
        0x09891e0937ab2417db55a636eb2fa92c6b5d35723cb1b16f93c9fbc9011d0fab,
        0x03e9d7d9eae238bb61d705114e9c478d291696cdaac806abecdab703884e7fb1,
        0x2467a987b44910af8b400690d6440ebc3c3eaacf24fcea82c5fcedc72eec7e83,
        0x13e6656476d54dd1dcbed51e0cf351099d858a7c43a2c20e906ec8c8afdca7d9,
        0x02e971bfeb34e121082d611628e6a041a1b77d99b9757ba7ded5f98557c9bd5a,
        0x00000000000000000000000000000000000000000000000000000188809a991b,
        0x0a1151f8650314c5bc020b5b3fed86902a82c79043ece22963ff4667956c46b5,
        0x16106aeb983ba3a58d969cbc53efb559b5e9607917c669c496cf800be222c360,
        0x0a7266b88cceb5d1a7d65cef0c38a09f89495edf3b133d225d7681342a19fd61,
        0x26cc7ab6069b51238334f34e0e0b97b259b23cd859d4f16d0ef6a234e9927b69
    ];

    function setUp() public {
        vm.deal(seller, 1 ether);
        vm.deal(buyer, 1 ether);
        market = new PrivateMarket(cancelBlockTime);
    }

    function testEdDSASignatureSale() public {
        uint256 sellerBalance = seller.balance;
        uint256 buyerBalance = buyer.balance;

        uint256 askId = market.asksCounter();
        uint256 orderId = market.getNOrdersForAskId(askId);
        vm.startBroadcast(seller);
        market.askSignature(signaturePrice, signingKey, pubKey);
        vm.stopBroadcast();

        
        vm.startBroadcast(buyer);
        market.orderSignature{value: signaturePrice}(
            askId,
            messagePreImage,
            message,
            sharedKeyCommitment,
            buyerPubkey,
            poseidonNonce
        );
        vm.stopBroadcast();

        assertEq(buyer.balance, buyerBalance - signaturePrice);

        vm.startBroadcast(seller);
        market.acceptOrderSignature(a, b, c, inputs, askId, orderId);
        vm.stopBroadcast();

        assertEq(seller.balance, sellerBalance + signaturePrice);
    }
}
