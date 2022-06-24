// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

abstract contract AvatrollerInterface {
    /// @notice Indicator that this is a Avatroller contract (for inspection)
    bool public constant isAvatroller = true;

    /*** Assets You Are In ***/

    function enterMarkets(address[] calldata cTokens) virtual external returns (uint[] memory);
    function exitMarket(address aToken) virtual external returns (uint);

    /*** Policy Hooks ***/

    function mintAllowed(address aToken, address minter, uint mintAmount) virtual external returns (uint);
    function mintVerify(address aToken, address minter, uint mintAmount, uint mintTokens) virtual external;

    function redeemAllowed(address aToken, address redeemer, uint redeemTokens) virtual external returns (uint);
    function redeemVerify(address aToken, address redeemer, uint redeemAmount, uint redeemTokens) virtual external;

    function borrowAllowed(address aToken, address borrower, uint borrowAmount) virtual external returns (uint);
    function borrowVerify(address aToken, address borrower, uint borrowAmount) virtual external;

    function repayBorrowAllowed(
        address aToken,
        address payer,
        address borrower,
        uint repayAmount) virtual external returns (uint);
    function repayBorrowVerify(
        address aToken,
        address payer,
        address borrower,
        uint repayAmount,
        uint borrowerIndex) virtual external;

    function liquidateBorrowAllowed(
        address cTokenBorrowed,
        address cTokenCollateral,
        address liquidator,
        address borrower,
        uint repayAmount) virtual external returns (uint);
    function liquidateBorrowVerify(
        address cTokenBorrowed,
        address cTokenCollateral,
        address liquidator,
        address borrower,
        uint repayAmount,
        uint seizeTokens) virtual external;

    function seizeAllowed(
        address cTokenCollateral,
        address cTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens) virtual external returns (uint);
    function seizeVerify(
        address cTokenCollateral,
        address cTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens) virtual external;

    function transferAllowed(address aToken, address src, address dst, uint transferTokens) virtual external returns (uint);
    function transferVerify(address aToken, address src, address dst, uint transferTokens) virtual external;

    /*** Liquidity/Liquidation Calculations ***/

    function liquidateCalculateSeizeTokens(
        address cTokenBorrowed,
        address cTokenCollateral,
        uint repayAmount) virtual external view returns (uint, uint);
}
