import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, execute } = deployments

    const { deployer } = await getNamedAccounts()

    const unitroller = await deploy("Unitroller", {
        from: deployer,
        log: true,
    })

    if (unitroller.newlyDeployed) {
        const tx = await execute("Unitroller", { from: deployer, log: true }, "_setPendingAdmin", deployer)
        console.log(`set pending admin (tx: ${tx.transactionHash})`)
    }
}

module.exports.tags = ["Unitroller"]
module.exports.dependencies = ["PriceOracleProxyUSD"]
