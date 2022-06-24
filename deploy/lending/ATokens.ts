import { parseEther, parseUnits } from "ethers/lib/utils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre
    const { deploy, execute } = deployments

    const { deployer } = await getNamedAccounts()

    const chainId = await getChainId()

    if (!_config.has(chainId)) {
        console.log(`chain id ${chainId} does not have aTokens for deploy, skip...`)
        return
    }

    const aErc20Delegate = await deploy("AErc20Delegate", {
        from: deployer,
        log: true,
    })

    const avatrollerAddress = (await deployments.get("Avatroller")).address
    const allATokens = _config.get(chainId) as ATokenConfig[]

    for (const readyToken of _readyTokensForDeploy) {
        const aTokenConfig = allATokens.find(({ name }) => name === readyToken)

        if (!aTokenConfig) {
            console.log(`no config for ${readyToken} on chain id ${chainId}, skip...`)
            continue
        }

        const {
            name,
            tokenAddress,
            interestRateModel,
            decimals,
            priceFeedAddress,
            collateralFactor,
            reserveFactor,
            initialExchangeRateMantissa,
        } = aTokenConfig

        if (name === "AVAX") {
            console.log(`wrong script to deploy AVAX, skip...`)
            continue
        }

        const interestRateModelAddress = (await deployments.get(interestRateModel)).address
        const aTokenName = `a${name}`
        const contractName = `A${capitalizeFirstLetter(name)}Delegator`

        const aErc20Delegator = await deploy(contractName, {
            from: deployer,
            args: [
                tokenAddress,
                avatrollerAddress,
                interestRateModelAddress,
                initialExchangeRateMantissa,
                `AVATALend ${name}`,
                aTokenName,
                decimals,
                deployer,
                aErc20Delegate.address,
                "0x",
            ],
            log: true,
            contract: "AErc20Delegator",
        })

        await execute("Avatroller", { from: deployer, gasLimit: 2000000, log: true }, "_supportMarket", aErc20Delegator.address)

        await execute("PriceOracleProxyUSD", { from: deployer, log: true }, "_setAggregators", [aErc20Delegator.address], [priceFeedAddress])

        await execute("Avatroller", { from: deployer, log: true }, "_setCollateralFactor", aErc20Delegator.address, parseEther(collateralFactor))

        await execute(contractName, { from: deployer, log: true }, "_setReserveFactor", parseEther(reserveFactor))
    }
}

module.exports.tags = ["ATokens"]
module.exports.dependencies = [
    "Avatroller",
    "Unitroller",
    "PriceOracleProxyUSD",
    "MajorInterestRateModel",
    "StableInterestRateModel",
    "GovernanceInterestRateModel",
]

const _readyTokensForDeploy = ["USDT"]
const _config = new Map<string, ATokenConfig[]>()

enum InterestRateModelEnum {
    MAJOR = "MajorInterestRateModel",
    STABLE = "StableInterestRateModel",
    GOVERNANCE = "GovernanceInterestRateModel",
}

_config.set("43113", [
    {
        name: "USDT",
        tokenAddress: "0xf96b121f18e2c41aa4f4d3e87a15ebc054f4284c",
        interestRateModel: InterestRateModelEnum.STABLE,
        decimals: 8,
        initialExchangeRateMantissa: parseUnits("2", 14).toString(),
        priceFeedAddress: "0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad",
        collateralFactor: "0.2",
        reserveFactor: "0.15",
    },
])

interface ATokenConfig {
    name: string
    tokenAddress: string
    interestRateModel: InterestRateModelEnum
    initialExchangeRateMantissa: string
    decimals: number
    priceFeedAddress: string
    collateralFactor: string
    reserveFactor: string
}
