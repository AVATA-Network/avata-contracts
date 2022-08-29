import { parseEther } from "ethers/lib/utils"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { SimplePriceOracle } from "../../build/typechain"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
        const LIQUIDATION_INCENTIVE = parseEther("1.05")

        const avatTokenAddress = (await deployments.get("AvatToken")).address

        await execute("Avatroller", { from: deployer, log: true }, "_setAvatAddress", avatTokenAddress)
        await sleep(3000) // note: nonce has already been used
        await execute("Avatroller", { from: deployer, log: true }, "_setCloseFactor", CLOSE_FACTOR)
        await sleep(3000)
        await execute("Avatroller", { from: deployer, log: true }, "_setLiquidationIncentive", LIQUIDATION_INCENTIVE)
        await sleep(3000)
        await execute("Avatroller", { from: deployer, log: true }, "_setPriceOracle", priceOracleAddress)
        // await execute('Avatroller', { from: deployer }, '_setPauseGuardian', guardian);
        // await execute('Avatroller', { from: deployer }, '_setBorrowCapGuardian', guardian);
    }
}

module.exports.tags = ["Avatroller"]
module.exports.dependencies = ["Unitroller", "AvatToken"]
