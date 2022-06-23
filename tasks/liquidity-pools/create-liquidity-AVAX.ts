import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("liquidity.createLiquidityAVAX")
    .addParam("contract", "Contract address")
    .addParam("address", "The account's address")
    .addParam("token", "Token address")
    .addParam("wavax", "AVAX token address")
    .addParam("amounttokendesired", "The amount of tokens, that desire to recieve")
    .addParam("amounttokenmin", "The minimal amount of tokens, that desire to recieve")
    .addParam("amountavaxmin", "The minimal amount of AVAX, that desire to swap")
    .addParam("deadline", "Deadline to trade")
    .setAction(
        async (
            { contract, address, token, wavax, amounttokendesired, amounttokenmin, amountavaxmin, deadline },
            hre: HardhatRuntimeEnvironment
        ) => {
            const { ethers } = hre

            const LPRouterContract = (await ethers.getContractFactory("LPRouter")).attach(contract)

            await hre.run("erc20.approve", {
                token: token,
                amount: amounttokendesired,
                spender: contract,
            })

            const tx = await (
                await LPRouterContract.addLiquidityAVAX(token, amounttokendesired, amounttokenmin, amountavaxmin, address, deadline, {
                    value: 100000,
                })
            ).wait()

            console.log(`LPRouter.addLiquidityAVAX: ${tx.transactionHash}`)
        }
    )
