import { parseEther } from "ethers/lib/utils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, execute, save } = deployments

    const { deployer } = await getNamedAccounts()

    const avatroller = await deploy("Avatroller_Implementation", {
        from: deployer,
        contract: "Avatroller",
        log: true,
    })

    const unitrollerAddress = (await deployments.get("Unitroller")).address

    // update Avatroller ABI
    await save("Avatroller", {
        abi: avatroller.abi,
        address: unitrollerAddress,
    })

    if (avatroller.newlyDeployed) {
        const unitrollerAddress = (await deployments.get("Unitroller")).address
        const avatrollerImplAddress = (await deployments.get("Avatroller_Implementation")).address

        await execute("Unitroller", { from: deployer, log: true }, "_setPendingImplementation", avatrollerImplAddress)
        await execute("Avatroller_Implementation", { from: deployer, log: true }, "_become", unitrollerAddress)

        const priceOracleAddress = (await deployments.get("PriceOracleProxyUSD")).address

        const CLOSE_FACTOR = parseEther("0.5")
        const LIQUIDATION_INCENTIVE = parseEther("1.08")

        await execute("Avatroller", { from: deployer, log: true }, "_setCloseFactor", CLOSE_FACTOR)
        await execute("Avatroller", { from: deployer, log: true }, "_setLiquidationIncentive", LIQUIDATION_INCENTIVE)
        await execute("Avatroller", { from: deployer, log: true }, "_setPriceOracle", priceOracleAddress)
        // await execute('Comptroller', { from: deployer }, '_setPauseGuardian', guardian);
        // await execute('Comptroller', { from: deployer }, '_setBorrowCapGuardian', guardian);
    }
}

module.exports.tags = ["Avatroller"]
module.exports.dependencies = ["Unitroller"]
