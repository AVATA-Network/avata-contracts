//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.12;

interface WAVAX {
    function deposit() external payable;

    function transfer(address to, uint256 value) external returns (bool);

    function withdraw(uint256) external;
}
