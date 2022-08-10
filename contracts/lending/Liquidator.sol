// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/AvatrollerInterface.sol";
import "./interfaces/EIP20Interface.sol";
import "./interfaces/UniswapRouterV2Interface.sol";
import "./interfaces/WAVAX.sol";
import "./interfaces/ATokenInterfaces.sol";
import "./interfaces/AAVAXInterfaces.sol";

contract Liquidator is Ownable {
    /// @notice Avatroller address
    AvatrollerInterface public avatroller;

    /// @notice Stable ERC20 asset
    EIP20Interface public stable;

    /// @notice Uniswap protocol V2 router
    UniswapRouterV2Interface public router;

    /// @notice WAVAX address
    WAVAX public wavax;

    constructor(
        AvatrollerInterface avatroller_,
        EIP20Interface stable_,
        UniswapRouterV2Interface router_,
        WAVAX wavax_
    ) {
        require(address(stable_) != address(0x0), "C0");
        require(address(avatroller_) != address(0x0), "C1");
        require(address(router_) != address(0x0), "C2");
        require(address(wavax_) != address(0x0), "C3");

        avatroller = avatroller_;
        stable = stable_;
        router = router_;
        wavax = wavax_;
    }

    function liquidate(
        address borrower_,
        uint256 repayAmount_,
        ATokenInterface cTokenCollateral_,
        AErc20Interface cTokenBorrow_,
        address token_
    ) external {
        if (address(stable) != address(token_)) {
            if (address(token_) == address(0x0)) {
                address[] memory path = new address[](2);
                path[0] = address(stable);
                path[1] = address(wavax);

                uint256[] memory amounts = router.getAmountsIn(repayAmount_, path);
                stable.transferFrom(msg.sender, address(this), amounts[0]);
                router.swapTokensForExactAVAX(repayAmount_, amounts[0], path, address(this), block.timestamp + 600);

                // liquidate
                require(AAVAXInterface(address(cTokenBorrow_)).liquidateBorrow{value: repayAmount_}(borrower_, cTokenCollateral_) == 0, "liquidation AVAX failed");
            } else {
                address[] memory path = new address[](3);
                path[0] = address(stable);
                path[1] = address(wavax);
                path[2] = address(token_);

                uint256[] memory amounts = router.getAmountsIn(repayAmount_, path);
                stable.transferFrom(msg.sender, address(this), amounts[0]);
                router.swapTokensForExactTokens(repayAmount_, amounts[0], path, address(this), block.timestamp + 600);

                EIP20Interface(token_).approve(address(cTokenBorrow_), repayAmount_);

                // liquidate
                require(cTokenBorrow_.liquidateBorrow(borrower_, repayAmount_, cTokenCollateral_) == 0, "liquidation failed");
            }
        }

        AErc20Interface cTokenCollateral__ = AErc20Interface(address(cTokenCollateral_));

        // redeem collateral cToken
        require(cTokenCollateral__.redeem(cTokenCollateral_.balanceOf(address(this))) == 0, "redeem failed");

        EIP20Interface underlying = EIP20Interface(cTokenCollateral__.underlying());

        // swap it to stable if necessary
        if (address(underlying) != address(stable)) {
            if (address(underlying) == address(0x0)) {
                address[] memory path = new address[](2);
                path[1] = address(wavax);
                path[2] = address(stable);

                uint256 underlyingBalance = underlying.balanceOf(address(this));

                router.swapExactAVAXForTokens{value: underlyingBalance}(underlyingBalance - 10000, path, msg.sender, block.timestamp + 600);
            } else {
                address[] memory path = new address[](3);
                path[0] = address(underlying);
                path[1] = address(wavax);
                path[2] = address(stable);

                uint256 underlyingBalance = underlying.balanceOf(address(this));

                router.swapExactTokensForTokens(underlyingBalance, underlyingBalance - 100, path, msg.sender, block.timestamp + 600);
            }
        } else {
            stable.transfer(msg.sender, stable.balanceOf(address(this)));
        }
    }

    // get amount of collateral to be liquidated
    function getAmountToBeLiquidated(
        address _aTokenBorrowed,
        address _aTokenCollateral,
        uint256 _actualRepayAmount
    ) external view returns (uint256) {
        /*
         * Get the exchange rate and calculate the number of collateral tokens to seize:
         *  seizeAmount = actualRepayAmount * liquidationIncentive * priceBorrowed / priceCollateral
         *  seizeTokens = seizeAmount / exchangeRate
         *   = actualRepayAmount * (liquidationIncentive * priceBorrowed) / (priceCollateral * exchangeRate)
         */
        (uint256 error, uint256 cTokenCollateralAmount) = avatroller.liquidateCalculateSeizeTokens(_aTokenBorrowed, _aTokenCollateral, _actualRepayAmount);

        require(error == 0, "GATBL0");

        return cTokenCollateralAmount;
    }

    /**
     * ADMIN FUNCTIONS
     */

    function _setStable(EIP20Interface stable_) external onlyOwner {
        require(address(stable_) != address(0x0), "SS0");
        stable = stable_;
    }

    function _setRouter(UniswapRouterV2Interface router_) external onlyOwner {
        require(address(router_) != address(0x0), "SR0");
        router = router_;
    }

    function _setAvatroller(AvatrollerInterface avatroller_) external onlyOwner {
        require(address(avatroller_) != address(0x0), "SA0");
        avatroller = avatroller_;
    }
}
