#!/bin/bash
URL=$1
source .env && forge script script/PrivateMarket.s.sol:PrivateMarketScript --fork-url ${URL} --broadcast