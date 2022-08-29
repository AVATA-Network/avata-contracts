import { parseEther, parseUnits } from "ethers/lib/utils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
            avatBorrowSpeed,
            avatSupplySpeed,
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
        await sleep(3000)
        await execute("PriceOracleProxyUSD", { from: deployer, log: true }, "_setAggregators", [aErc20Delegator.address], [priceFeedAddress])
        await sleep(3000)
        await execute("Avatroller", { from: deployer, log: true }, "_setCollateralFactor", aErc20Delegator.address, parseEther(collateralFactor))
        await sleep(3000)
        await execute(contractName, { from: deployer, log: true }, "_setReserveFactor", parseEther(reserveFactor))

        if (+avatBorrowSpeed > 0 || +avatSupplySpeed > 0) {
            await execute(
                "Avatroller",
                { from: deployer, log: true },
                "_setAvatSpeed",
                aErc20Delegator.address,
                parseUnits(avatSupplySpeed, "6"),
                parseUnits(avatBorrowSpeed, "6")
            )
        }
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

const _readyTokensForDeploy = ["USDC.e", "USDT.e", "WETH.e", "WBTC.e"]
const _config = new Map<string, ATokenConfig[]>()

enum InterestRateModelEnum {
    MAJOR = "MajorInterestRateModel",
    STABLE = "StableInterestRateModel",
    GOVERNANCE = "GovernanceInterestRateModel",
}

// fuji
_config.set("43113", [
    {
        name: "USDT.e",
        tokenAddress: "0x480Ec1a46612EC8ECCA2d8B88d6078f971216B6B",
        interestRateModel: InterestRateModelEnum.STABLE,
        decimals: 8,
        initialExchangeRateMantissa: parseUnits("2", 14).toString(),
        priceFeedAddress: "0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad",
        collateralFactor: "0.80",
        reserveFactor: "0.15",
        avatBorrowSpeed: "0.1",
        avatSupplySpeed: "0.1",
    },
    {
        name: "USDC.e",
        tokenAddress: "0x26789a2A4fD03145E1C511CBeC502A7D13cd0C6C",
        interestRateModel: InterestRateModelEnum.STABLE,
        decimals: 8,
        initialExchangeRateMantissa: parseUnits("2", 14).toString(),
        priceFeedAddress: "0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad",
        collateralFactor: "0.80",
        reserveFactor: "0.20",
        avatBorrowSpeed: "0.1",
        avatSupplySpeed: "0.1",
    },
    {
        name: "WETH.e",
        tokenAddress: "0x4F6D55eeF0B466F9146F6f295728b064760078Ab",
        interestRateModel: InterestRateModelEnum.MAJOR,
        decimals: 8,
        initialExchangeRateMantissa: parseUnits("2", 26).toString(),
        priceFeedAddress: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
        collateralFactor: "0.75",
        reserveFactor: "0.2",
        avatBorrowSpeed: "0.1",
        avatSupplySpeed: "0.1",
    },
    {
        name: "WBTC.e",
        tokenAddress: "0x4CdaB0fF4E4185bE0f6E8c3a429841bFBAfea92B",
        interestRateModel: InterestRateModelEnum.MAJOR,
        decimals: 8,
        initialExchangeRateMantissa: parseUnits("2", 16).toString(),
        priceFeedAddress: "0x31CF013A08c6Ac228C94551d535d5BAfE19c602a",
        collateralFactor: "0.75",
        reserveFactor: "0.2",
        avatBorrowSpeed: "0.1",
        avatSupplySpeed: "0.1",
    },
])

// avalanche mainnet
_config.set("43114", [
    {
        name: "USDC.e",
        tokenAddress: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
        interestRateModel: InterestRateModelEnum.STABLE,
        decimals: 8,
        initialExchangeRateMantissa: parseUnits("2", 14).toString(),
        priceFeedAddress: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
        collateralFactor: "0.825",
        reserveFactor: "0.05",
        avatBorrowSpeed: "0.015",
        avatSupplySpeed: "0.015",
    },
    {
        name: "USDT.e",
        tokenAddress: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
        interestRateModel: InterestRateModelEnum.STABLE,
        decimals: 8,
        initialExchangeRateMantissa: parseUnits("2", 14).toString(),
        priceFeedAddress: "0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a",
        collateralFactor: "0.75",
        reserveFactor: "0.05",
        avatBorrowSpeed: "0.0125",
        avatSupplySpeed: "0.0125",
    },
    {
        name: "WETH.e",
        tokenAddress: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
        interestRateModel: InterestRateModelEnum.MAJOR,
        decimals: 8,
        initialExchangeRateMantissa: parseUnits("2", 26).toString(),
        priceFeedAddress: "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
        collateralFactor: "0.80",
        reserveFactor: "0.1",
        avatBorrowSpeed: "0.01",
        avatSupplySpeed: "0.01",
    },
    {
        name: "WBTC.e",
        tokenAddress: "0x50b7545627a5162F82A992c33b87aDc75187B218",
        interestRateModel: InterestRateModelEnum.MAJOR,
        decimals: 8,
        initialExchangeRateMantissa: parseUnits("2", 16).toString(),
        priceFeedAddress: "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743",
        collateralFactor: "0.80",
        reserveFactor: "0.1",
        avatBorrowSpeed: "0.01",
        avatSupplySpeed: "0.01",
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
    avatBorrowSpeed: string
    avatSupplySpeed: string
}
