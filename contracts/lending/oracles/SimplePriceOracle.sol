// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "../oracles/PriceOracle.sol";
import "../AErc20.sol";

contract SimplePriceOracle is PriceOracle {
    mapping(address => uint256) prices;
    event PricePosted(address asset, uint256 previousPriceMantissa, uint256 requestedPriceMantissa, uint256 newPriceMantissa);

    function _getUnderlyingAddress(AToken aToken) private view returns (address) {
        address asset;
        if (compareStrings(aToken.symbol(), "cETH")) {
            asset = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        } else {
            asset = address(AErc20(address(aToken)).underlying());
        }
        return asset;
    }

    function getUnderlyingPrice(AToken aToken) public view override returns (uint256) {
        return prices[_getUnderlyingAddress(aToken)];
    }

    function setUnderlyingPrice(AToken aToken, uint256 underlyingPriceMantissa) public {
        address asset = _getUnderlyingAddress(aToken);
        emit PricePosted(asset, prices[asset], underlyingPriceMantissa, underlyingPriceMantissa);
        prices[asset] = underlyingPriceMantissa;
    }

    function setDirectPrice(address asset, uint256 price) public {
        emit PricePosted(asset, prices[asset], price, price);
        prices[asset] = price;
    }

    // v1 price oracle interface for use as backing of proxy
    function assetPrices(address asset) external view returns (uint256) {
        return prices[asset];
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
