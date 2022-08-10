// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./AToken.sol";
import "./oracles/PriceOracle.sol";
import "./UnitrollerAdminStorage.sol";

contract AvatrollerStorage is UnitrollerAdminStorage {
    /**
     * @notice Oracle which gives the price of any given asset
     */
    PriceOracle public oracle;

    /**
     * @notice Multiplier used to calculate the maximum repayAmount when liquidating a borrow
     */
    uint256 public closeFactorMantissa;

    /**
     * @notice Multiplier representing the discount on collateral that a liquidator receives
     */
    uint256 public liquidationIncentiveMantissa;

    /**
     * @notice Max number of assets a single account can participate in (borrow or use as collateral)
     */
    uint256 public maxAssets;

    /**
     * @notice Per-account mapping of "assets you are in", capped by maxAssets
     */
    mapping(address => AToken[]) public accountAssets;

    struct Market {
        // Whether or not this market is listed
        bool isListed;
        //  Multiplier representing the most one can borrow against their collateral in this market.
        //  For instance, 0.9 to allow borrowing 90% of collateral value.
        //  Must be between 0 and 1, and stored as a mantissa.
        uint256 collateralFactorMantissa;
        // Per-market mapping of "accounts in this asset"
        mapping(address => bool) accountMembership;
    }

    /**
     * @notice Official mapping of cTokens -> Market metadata
     * @dev Used e.g. to determine if a market is supported
     */
    mapping(address => Market) public markets;

    /**
     * @notice The Pause Guardian can pause certain actions as a safety mechanism.
     *  Actions which allow users to remove their own assets cannot be paused.
     *  Liquidation / seizing / transfer can only be paused globally, not by market.
     */
    address public pauseGuardian;
    bool public _mintGuardianPaused;
    bool public _borrowGuardianPaused;
    bool public transferGuardianPaused;
    bool public seizeGuardianPaused;
    mapping(address => bool) public mintGuardianPaused;
    mapping(address => bool) public borrowGuardianPaused;

    struct AvatMarketState {
        // The market's last updated avatBorrowIndex or avatSupplyIndex
        uint224 index;
        // The block number the index was last updated at
        uint32 block;
    }

    /// @notice A list of all markets
    AToken[] public allMarkets;

    /// @notice The COMP market supply state for each market
    mapping(address => AvatMarketState) public avatSupplyState;

    /// @notice The COMP market borrow state for each market
    mapping(address => AvatMarketState) public avatBorrowState;

    /// @notice The COMP borrow index for each market for each supplier as of the last time they accrued COMP
    mapping(address => mapping(address => uint256)) public avatSupplierIndex;

    /// @notice The COMP borrow index for each market for each borrower as of the last time they accrued COMP
    mapping(address => mapping(address => uint256)) public avatBorrowerIndex;

    /// @notice The COMP accrued but not yet transferred to each user
    mapping(address => uint256) public avatAccrued;

    // @notice The borrowCapGuardian can set borrowCaps to any number for any market. Lowering the borrow cap could disable borrowing on the given market.
    address public borrowCapGuardian;

    // @notice Borrow caps enforced by borrowAllowed for each aToken address. Defaults to zero which corresponds to unlimited borrowing.
    mapping(address => uint256) public borrowCaps;

    /// @notice The portion of COMP that each contributor receives per block
    mapping(address => uint256) public avatContributorSpeeds;

    /// @notice Last block at which a contributor's COMP rewards have been allocated
    mapping(address => uint256) public lastContributorBlock;

    /// @notice The rate at which avat is distributed to the corresponding borrow market (per block)
    mapping(address => uint256) public avatBorrowSpeeds;

    /// @notice The rate at which avat is distributed to the corresponding supply market (per block)
    mapping(address => uint256) public avatSupplySpeeds;

    /// @notice AVAT Token address
    address public avatAddress;
}
