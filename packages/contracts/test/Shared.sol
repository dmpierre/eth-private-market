// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Shared {
    
    address public seller = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address public buyer = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    uint256 public signaturePrice = 0.01 ether;
    uint256 public addressPrice = 0.1 ether;
    uint256 public groth16ProofPrice = 0.01 ether;
    uint public cancelBlockTime = 10;

}