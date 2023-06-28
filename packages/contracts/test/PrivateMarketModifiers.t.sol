// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import 'forge-std/Test.sol';
import '../src/PrivateMarket.sol';
import './Shared.sol';

contract PrivateMarketModifiers is Test, Shared {

    PrivateMarket public market;

    function setUp() public {
        market = new PrivateMarket(cancelBlockTime);
    }

}
