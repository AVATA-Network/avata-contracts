import { HardhatRuntimeEnvironment } from 'hardhat/types';

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    // For Majors like WBTC, WETH, AVAX
    await deploy("MajorInterestRateModel", {
        from: deployer,
        args: [
            "0", // Base 0%
            "200000000000000000", // Multiplier 20%
            "2000000000000000000", // Jump multiplier 200%
            "800000000000000000", // Kink1 80%
            "900000000000000000", // Kink2 90%
            "1500000000000000000", // Roof 150%
            deployer,
        ],
        log: true,
        contract: "TripleSlopeRateModel",
    });
}

module.exports.tags = ["MajorInterestRateModel"]

