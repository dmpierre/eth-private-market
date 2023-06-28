// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/PrivateMarket.sol";

contract PrivateMarketScript is Script {

    function run() external {
        uint256 deployerPrivateKey  = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        uint256 cancelBlockTime = 10;
        PrivateMarket market = new PrivateMarket(cancelBlockTime);
        vm.stopBroadcast();
    }
}
