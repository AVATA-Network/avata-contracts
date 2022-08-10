import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const avatrollerAddress = (await deployments.get("Avatroller")).address
    const wavaxAddress = (await deployments.get("WAVAX")).address
    const usdceAddress = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"
    const router = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4"

    await deploy("Liquidator", {
        from: deployer,
        log: true,
        args: [avatrollerAddress, usdceAddress, router, wavaxAddress],
    })
}

module.exports.tags = ["Liquidator"]
module.exports.dependencies = ["Avatroller", "WAVAX"]
