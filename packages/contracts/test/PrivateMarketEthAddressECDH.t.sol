// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import 'forge-std/Test.sol';
import '../src/PrivateMarket.sol';
import './Shared.sol';

/**
 * @title PrivateMarketEthAddressECDH test
 * @dev You can generate your own inputs when running a prove
 * script from packages/circuits.
 * see: yarn eth-address-ecdh:calldata
 */
contract PrivateMarketEthAddressECDH is Test, Shared {
    PrivateMarket public market;

    uint256[2] public buyerPubJubJub = [
        6013967459248025804450771197829240609496314626720505963246340551759953607051,
        15083277397420271422777865034396200541742152048680127847030637649016386770913
    ];

    uint256 public poseidonNonce = 1685806633357;
    address public soldAddress = 0xcEcF89EcbE409544C13713D6f78e1Eb57B3C105B;

    uint256[2] public a = [
        0x04a46db269fb4a4ceddf28fa2c83d7e64e75ebd015c007410db027d4cc822219,
        0x1478f8db65d972e2bde9f20178e3ce34e2db5cbec7f4a77381ac3319d66c8d5a
    ];

    uint256[2][2] public b = [
        [
            0x1921b18b25869f21e37174d20b7f9c01f63ecd70bc7a1efa0ea9a52de309d33d,
            0x1d98c59669a0f893cbe34c7ea4b11d504f1331343aa1be3bab1f17630348dd06
        ],
        [
            0x1dea42b215ef14c22f565e16d4152a3cd9d3fbfa828d45a16b599bd35c077673,
            0x0f6fcd5a4fc22b902bb9a7247c0cc500444f5018ff53f63fa22d8b39074dc360
        ]
    ];

    uint256[2] public c = [
        0x11ff2b1a5596ac34240ba529af3661d508cb6bf8912cad3b792a4e8c4910a056,
        0x0f7bf514bd6b8268ba1a32d07ce161af9a1a08d7f3dc7e6a71156a41e663cb9e
    ];

    uint256[13] public input = [
        0x000000000000000000000000cecf89ecbe409544c13713d6f78e1eb57b3c105b,
        0x068a696f93a9d656efee765275d0d0bd5ec35eed507284cba3ceb62b7dcdd2cb,
        0x26e70e3690a0f0ab02e8b6535f2277b07391a90b4fe5b6d799eee9f71b7bff9b,
        0x0d4bc8f2e615a5c593110257e8be24f0fc3fba4f24c5a2c3ddfe54a05ea3398b,
        0x2158d51cf34aaedebd66670246ec1bd00c773bb4c8f7b8ca13862787393457e1,
        0x0000000000000000000000000000000000000000000000000000018881e7d18d,
        0x068b273598ba226342b5eca1be2711d43521e98b5c3406799e93dceeb3e7d841,
        0x0c37d296629a7d567b1ed7a0e8127bb4c2e9ca5cd60bab06d8a540c3514fbfe1,
        0x303265dcefee04c715ca0f83c30829fe4a4fae471d249f665000be3f361b01a9,
        0x0517858fa9f41ee55d5e1d59abd5fd5ae0c9929c8545a1d313dfc32d1517efde,
        0x20846c118a94abe24fecfe602a6e47843a96521df1bda4cb8613aaf0c5e51728,
        0x2afbb611f717d32573b923053c73807c933c88f98f84e080eca36388ee76affb,
        0x10240b3b025cdd12ce0845426cce17dc32eb33425b2db411c80c3ebbc6f135db
    ];

    function setUp() public {
        vm.deal(buyer, 1 ether);
        vm.deal(seller, 1 ether);
        market = new PrivateMarket(cancelBlockTime);
    }

    function buyerValidBid() private {
        market.bidETHAddress{value: addressPrice}(
            soldAddress,
            poseidonNonce,
            buyerPubJubJub
        );
    }

    function sellerValidFill(uint256 bidId) private {
        market.fillETHAddressBid(a, b, c, input, bidId);
    }

    function testCancelBid() public {
        uint256 buyerBalance = buyer.balance;
        uint256 bidId = market.bidsCounter();
        vm.startBroadcast(buyer);
        buyerValidBid();
        vm.expectRevert(bytes('Cancel block is not past'));
        market.cancelBid(bidId);

        vm.roll(cancelBlockTime + 2);
        market.cancelBid(bidId);
        vm.stopBroadcast();
        assertEq(buyerBalance, buyer.balance);

    }

    function testBidETHAddress() public {
        uint256 bidderBalance = buyer.balance;
        uint256 sellerBalance = seller.balance;

        uint256 bidId = market.bidsCounter();

        vm.startBroadcast(buyer);
        buyerValidBid();
        vm.stopBroadcast();
        assertEq(bidderBalance - addressPrice, buyer.balance);

        vm.startBroadcast(seller);
        sellerValidFill(bidId);
        vm.stopBroadcast();
        assertEq(sellerBalance + addressPrice, seller.balance);
    }
}
