import { parseEther, parseUnits } from "ethers/lib/utils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre
    const { deploy, execute } = deployments

    const { deployer } = await getNamedAccounts()

    const chainId = await getChainId()

    if (!_config.has(chainId)) {
        console.log(`chain id ${chainId} does not have aTokens for deploy, skip...`)
        return
    }

    const avatrollerAddress = (await deployments.get("Avatroller")).address
    const aTokenConfig = _config.get(chainId) as ATokenConfig

    if (!aTokenConfig) {
        console.log(`no config for AVAX on chain id ${chainId}, skip...`)
        return
    }

    const {
        name,
        interestRateModel,
        decimals,
        priceFeedAddress,
        avatBorrowSpeed,
        avatSupplySpeed,
        collateralFactor,
        reserveFactor,
        initialExchangeRateMantissa,
    } = aTokenConfig

    if (name !== "AVAX") {
        console.log(`wrong script to deploy AVAX, skip...`)
        return
    }

    const interestRateModelAddress = (await deployments.get(interestRateModel)).address
    const aTokenName = `aAVAX`

    const aAVAXContract = await deploy("AAVAX", {
        from: deployer,
        args: [avatrollerAddress, interestRateModelAddress, initialExchangeRateMantissa, `AVATALend ${name}`, aTokenName, decimals, deployer],
        log: true,
    })

    await execute("Avatroller", { from: deployer, gasLimit: 2000000, log: true }, "_supportMarket", aAVAXContract.address)

    await execute("PriceOracleProxyUSD", { from: deployer, log: true }, "_setAggregators", [aAVAXContract.address], [priceFeedAddress])

    await execute("Avatroller", { from: deployer, log: true }, "_setCollateralFactor", aAVAXContract.address, parseEther(collateralFactor))

    await execute("AAVAX", { from: deployer, log: true }, "_setReserveFactor", parseEther(reserveFactor))

    if (+avatBorrowSpeed > 0 || +avatSupplySpeed > 0) {
        await execute(
            "Avatroller",
            { from: deployer, log: true },
            "_setAvatSpeed",
            aAVAXContract.address,
            parseUnits(avatSupplySpeed, "6"),
            parseUnits(avatBorrowSpeed, "6")
        )
    }
}

module.exports.tags = ["AAVAX"]
module.exports.dependencies = [
    "Avatroller",
    "Unitroller",
    "PriceOracleProxyUSD",
    "MajorInterestRateModel",
    "StableInterestRateModel",
    "GovernanceInterestRateModel",
]

const _config = new Map<string, ATokenConfig>()

enum InterestRateModelEnum {
    MAJOR = "MajorInterestRateModel",
    STABLE = "StableInterestRateModel",
    GOVERNANCE = "GovernanceInterestRateModel",
}

_config.set("43113", {
    name: "AVAX",
    interestRateModel: InterestRateModelEnum.MAJOR,
    decimals: 8,
    initialExchangeRateMantissa: parseUnits("2", 26).toString(),
    priceFeedAddress: "0x5498BB86BC934c8D34FDA08E81D444153d0D06aD",
    collateralFactor: "0.75",
    reserveFactor: "0.20",
    avatBorrowSpeed: "0.1",
    avatSupplySpeed: "0.1",
})

_config.set("43114", {
    name: "AVAX",
    interestRateModel: InterestRateModelEnum.MAJOR,
    decimals: 8,
    initialExchangeRateMantissa: parseUnits("2", 26).toString(),
    priceFeedAddress: "0x0A77230d17318075983913bC2145DB16C7366156",
    collateralFactor: "0.75",
    reserveFactor: "0.20",
    avatBorrowSpeed: "0.1",
    avatSupplySpeed: "0.1",
})

interface ATokenConfig {
    name: string
    interestRateModel: InterestRateModelEnum
    initialExchangeRateMantissa: string
    decimals: number
    priceFeedAddress: string
    collateralFactor: string
    reserveFactor: string
    avatBorrowSpeed: string
    avatSupplySpeed: string
}
