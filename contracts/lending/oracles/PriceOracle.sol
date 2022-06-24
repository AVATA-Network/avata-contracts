// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "../AToken.sol";

abstract contract PriceOracle {
    /// @notice Indicator that this is a PriceOracle contract (for inspection)
    bool public constant isPriceOracle = true;

    /**
      * @notice Get the underlying price of a aToken asset
      * @param aToken The aToken to get the underlying price of
      * @return The underlying asset price mantissa (scaled by 1e18).
      *  Zero means the price is unavailable.
      */
    function getUnderlyingPrice(AToken aToken) virtual external view returns (uint);
}
