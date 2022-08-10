// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./ATokenInterfaces.sol";

abstract contract AAVAXInterface {
    function liquidateBorrow(address borrower, ATokenInterface cTokenCollateral) external payable virtual returns (uint256);
}
