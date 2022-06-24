import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    // For all other coins, mainly governance coins
    await deploy("GovernanceInterestRateModel", {
        from: deployer,
        args: [
            "0", // Base 0%
            "250000000000000000", // Mulitplier 25%
            "10000000000000000000", // Jump multiplier 1000%
            "800000000000000000", // Kink1 80%
            "900000000000000000", // Kink2 90%
            "1500000000000000000", // Roof 150%
            deployer,
        ],
        log: true,
        contract: "TripleSlopeRateModel",
    })
}

module.exports.tags = ["GovernanceInterestRateModel"]
