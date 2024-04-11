// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDividendPayingToken {
    function dividendOf(address owner) external view returns (uint256);

    function distributeDividends() external payable;

    function withdrawDividend() external;
}