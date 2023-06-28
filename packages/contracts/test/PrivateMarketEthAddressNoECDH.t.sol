// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import 'forge-std/Test.sol';
import '../src/PrivateMarket.sol';
import './Shared.sol';

/**
 * @title PrivateMarketEthAddressNoECDH
 * @dev You can generate your own inputs when running a prove
 * script from packages/circuits.
 * see: yarn eth-address-no-ecdh:calldata
 */
contract PrivateMarketEthAddressNoECDH is Test, Shared {
    PrivateMarket public market;
    uint256[2] public sellerPubKey = [
        16631921501199158891723472477892552621753360468998085822994136234483675278775,
        16149235307946079264290781137933809710560201118259605301505053879258596746730
    ];
    uint256 public sharedKeyCommitment =
        15486139144816434160089744269623519578031481368720424425074444855996499309589;
    uint256[2] public buyerPubKey = [
        19734921133353591004784305394741437860821368383753169741028155437199770514228,
        10851597125719251439853404443015001068094618562188863706677338040695759194791
    ];
    uint256 public poseidonNonce = 1685797596672;

    uint256[2] public a = [
        0x1e0ee933703510c3c46bc1f69022b3656b93a59219b91b02adfdaa5e95e9efae,
        0x0b21bb218e27d10600b71483100d0f3cf23727ae8e2cbdc5ffdcdc2680b36502
    ];
    uint256[2][2] public b = [
        [
            0x0762cff891b6c4f49e2c3b6c75b57ce5ee997b3b4eb00313b3b043f673bac2f0,
            0x1d7b73aa01902ccd1751ece232a0f65c0ac4adced97eca95fdfedaa53c2cb7cb
        ],
        [
            0x2027f04ef0eb1e85250cb88675634149295bca3970b6f513e4c99044887b34e3,
            0x1ff8bea3064c4e4984d0b9a7e958472125d1161331c3bf65182c27f386eb9ec1
        ]
    ];
    uint256[2] public c = [
        0x2e376e020995388c5ece1aca74e0187298d60cc1e410d6d1d1ce5c8ab992a806,
        0x108b2c43a00b465006edc765aad3449a1f5a5085fec87447efb4fd4734a391a6
    ];
    uint256[10] public input = [
        0x000000000000000000000000e856f9a2b397759b882223780769b68ce3cebf82,
        0x223cd819a9ddfe8b3df424e69b6e3888fc68ffb67a100400c4040eee22133415,
        0x00000000000000000000000000000000000000000000000000000188815dee00,
        0x058290f37b153593c81dd6917a96ccc7d8e427a5fa85e5f7009e5738bf37a4f3,
        0x13c991d51f8858e3dbbf31b67bff128115043135838520af048a878b03e8df05,
        0x29a8c05c082fc491a31abc0f79f7730a6df15fefe0b2c8c1eee0e58073a9a43a,
        0x20ed3dfb70a265a2c75cd895a7f7764da886934a8e0ab2c794ebb5ae84d0b60b,
        0x1dcd98f8b37f74e61835df66d157b69819e23fa4c035161b1542f783a61f9879,
        0x105c2cf375019796a915ce202cffeb2e6b8fd199378185781b5d32465d9ee92f,
        0x1d8a29771b48d8312d509d03efa1adb4f951934be4fc7d30d61e6899ef73bb11
    ];

    address public soldAddress = 0xE856f9a2B397759b882223780769b68ce3CEBF82;

    function validAsk() public {
        market.askETHAddress(addressPrice, soldAddress, sellerPubKey);
    }

    function validOrder(uint256 askId) public {
        market.orderETHAddress{value: addressPrice}(
            askId,
            sharedKeyCommitment,
            buyerPubKey,
            poseidonNonce
        );
    }

    function validAcceptOrder(uint256 askId, uint256 orderId) public {
        market.acceptOrderETHAddress(a, b, c, input, askId, orderId);
    }

    function setUp() public {
        vm.deal(buyer, 1 ether);
        vm.deal(seller, 1 ether);
        market = new PrivateMarket(cancelBlockTime);
    }

    function testRevertOrderIfAskNotActive() public {
        uint256 askId = market.asksCounter();

        vm.startBroadcast(seller);
        validAsk();
        vm.stopBroadcast();

        vm.startBroadcast(seller);
        vm.expectRevert(bytes('Cancel block is not past'));
        market.cancelAsk(askId);
        vm.roll(cancelBlockTime + 2); 
        market.cancelAsk(askId);
        vm.stopBroadcast();

        vm.startBroadcast(buyer);
        vm.expectRevert(bytes('Ask is not active'));
        validOrder(askId);

    }
    
    function testRevertFillIfOrderNotActive() public {
        uint256 askId = market.asksCounter();
        uint256 orderId = market.getNOrdersForAskId(askId);

        vm.startBroadcast(seller);
        validAsk();
        vm.stopBroadcast();

        vm.startBroadcast(buyer);
        validOrder(askId);

        vm.roll(cancelBlockTime + 2);
        market.cancelOrder(askId, orderId, 2);
        vm.stopBroadcast();

        vm.startBroadcast(seller);
        vm.expectRevert(bytes('Order is not active'));
        validAcceptOrder(askId, orderId);
        vm.stopBroadcast();
        
    }

    function testCancelOrder() public {
        uint256 buyerBalance = buyer.balance;

        uint256 askId = market.asksCounter();
        uint256 orderId = market.getNOrdersForAskId(askId);

        vm.startBroadcast(seller);
        validAsk();
        vm.stopBroadcast();

        vm.startBroadcast(buyer);
        validOrder(askId);

        vm.expectRevert(bytes('Cancel block is not past'));
        market.cancelOrder(askId, orderId, 2);

        vm.roll(cancelBlockTime + 2);

        vm.expectRevert(bytes('Refund can not be 0'));
        market.cancelOrder(askId, orderId, 0);
        vm.expectRevert(bytes('Refund can not be 0'));
        market.cancelOrder(askId, orderId, 1);

        // valid cancel now
        market.cancelOrder(askId, orderId, 2);

        vm.expectRevert(bytes('Order is not active'));
        market.cancelOrder(askId, orderId, 2);
        vm.stopBroadcast();

        assertEq(buyer.balance, buyerBalance);
    }

    function testEthAddressSale() public {
        uint256 sellerBalance = seller.balance;
        uint256 buyerBalance = buyer.balance;

        uint256 askId = market.asksCounter();
        uint256 orderId = market.getNOrdersForAskId(askId);

        vm.startBroadcast(seller);
        validAsk();
        vm.stopBroadcast();

        vm.startBroadcast(buyer);
        validOrder(askId);
        vm.stopBroadcast();

        assertEq(buyer.balance, buyerBalance - addressPrice);

        vm.startBroadcast(seller);
        validAcceptOrder(askId, orderId);
        vm.stopBroadcast();

        assertEq(seller.balance, sellerBalance + addressPrice);
    }
}
