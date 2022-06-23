import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("liquidity.createLiquidity")
    .addParam("contract", "Contract address")
    .addParam("address", "The account's address")
    .addParam("tokena", "A token address from one pair")
    .addParam("tokenb", "B token address from one pair")
    .addParam("amountadesired", "The amount of tokens, that desire to swap")
    .addParam("amountbdesired", "The amount of tokens, that desire to receive")
    .addParam("amountamin", "The minimal amount of tokens, that desire to swap")
    .addParam("amountbmin", "The minimal amount of tokens, that desire to receive")
    .addParam("deadline", "Deadline to trade")
    .setAction(
        async (
            { contract, address, tokena, tokenb, amountadesired, amountbdesired, amountamin, amountbmin, deadline },
            hre: HardhatRuntimeEnvironment
        ) => {
            const { ethers } = hre

            const LPRouterContract = (await ethers.getContractFactory("LPRouter")).attach(contract)

            await hre.run("erc20.approve", {
                token: tokena,
                amount: amountadesired,
                spender: contract,
            })

            await hre.run("erc20.approve", {
                token: tokenb,
                amount: amountbdesired,
                spender: contract,
            })

            const tx = await (
                await LPRouterContract.addLiquidity(tokena, tokenb, amountadesired, amountbdesired, amountamin, amountbmin, address, deadline)
            ).wait()

            console.log(`LPRouter.addLiquidity: ${tx.transactionHash}`)
        }
    )
