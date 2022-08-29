// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import "../AErc20.sol";
import "../AToken.sol";
import "./PriceOracle.sol";
import "../library/ExponentialNoError.sol";
import "../interfaces/EIP20Interface.sol";

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);

    function description() external view returns (string memory);

    function version() external view returns (uint256);

    // getRoundData and latestRoundData should both raise "No data present"
    // if they do not have data to report, instead of returning unset values
    // which could be misinterpreted as actual reported values.
    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract PriceOracleProxyLiquidationTest is PriceOracle, ExponentialNoError {
    /// @notice Fallback price feed - not used
    mapping(address => uint256) internal prices;

    /// @notice Admin address
    address public admin;

    /// @notice Guardian address
    address public guardian;

    /// @notice Chainlink Aggregators
    mapping(address => AggregatorV3Interface) public aggregators;

    /**
     * @param admin_ The address of admin to set aggregators
     */
    constructor(address admin_) {
        admin = admin_;
    }

    /**
     * @notice Get the underlying price of a listed jToken asset
     * @param aToken The jToken to get the underlying price of
     * @return The underlying asset price mantissa (scaled by 1e18)
     */
    function getUnderlyingPrice(AToken aToken) public view override returns (uint256) {
        address aTokenAddress = address(aToken);
        AggregatorV3Interface aggregator = aggregators[aTokenAddress];
        require(address(aggregator) != address(0), "No aggregator found");

        uint256 chainLinkPrice = getPriceFromChainlink(aggregator);
        EIP20Interface underlyingAddress = EIP20Interface(AErc20(aTokenAddress).underlying());
        uint256 underlyingDecimals;

        // if AVAX
        if (address(underlyingAddress) == address(0x0)) {
            underlyingDecimals = 18;
        } else {
            underlyingDecimals = underlyingAddress.decimals();
        }

        if (underlyingDecimals <= 18) {
            return mul_(chainLinkPrice, 10**(18 - underlyingDecimals));
        }

        return div_(chainLinkPrice, 10**(underlyingDecimals - 18));
    }

    /*** Internal fucntions ***/

    /**
     * @notice Get price from ChainLink
     * @param aggregator The ChainLink aggregator to get the price of
     * @return The price
     */
    function getPriceFromChainlink(AggregatorV3Interface aggregator) internal view returns (uint256) {
        if (prices[address(aggregator)] != 0) {
            return mul_(uint256(prices[address(aggregator)]), 10**(18 - uint256(aggregator.decimals()))); 
        }

        (, int256 price, , , ) = aggregator.latestRoundData();
        require(price > 0, "invalid price");

        // Extend the decimals to 1e18.
        return mul_(uint256(price), 10**(18 - uint256(aggregator.decimals())));
    }

    /*** Admin or guardian functions ***/

    event AggregatorUpdated(address jTokenAddress, address source);
    event SetGuardian(address guardian);
    event SetAdmin(address admin);

    /**
     * @notice Set guardian for price oracle proxy
     * @param _guardian The new guardian
     */
    function _setGuardian(address _guardian) external {
        require(msg.sender == admin, "only the admin may set new guardian");
        guardian = _guardian;
        emit SetGuardian(guardian);
    }

     function _setDirectPrice(address _aggregator, uint256 _price) external {
        prices[_aggregator] = _price;
    }

    /**
     * @notice Set admin for price oracle proxy
     * @param _admin The new admin
     */
    function _setAdmin(address _admin) external {
        require(msg.sender == admin, "only the admin may set new admin");
        admin = _admin;
        emit SetAdmin(admin);
    }

    /**
     * @notice Set ChainLink aggregators for multiple jTokens
     * @param aTokenAddresses The list of jTokens
     * @param sources The list of ChainLink aggregator sources
     */
    function _setAggregators(address[] calldata aTokenAddresses, address[] calldata sources) external {
        require(msg.sender == admin || msg.sender == guardian, "only the admin or guardian may set the aggregators");
        require(aTokenAddresses.length == sources.length, "mismatched data");
        for (uint256 i = 0; i < aTokenAddresses.length; i++) {
            if (sources[i] != address(0)) {
                require(msg.sender == admin, "guardian may only clear the aggregator");
            }
            aggregators[aTokenAddresses[i]] = AggregatorV3Interface(sources[i]);
            emit AggregatorUpdated(aTokenAddresses[i], sources[i]);
        }
    }
}