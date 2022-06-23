import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("liquidity.swapExactTokensForTokens")
    .addParam("contract", "Contract address")
    .addParam("address", "The account's address")
    .addParam("amountin", "The amount of tokens, that desire to swap")
    .addParam("amountoutmin", "The minimal amount of tokens, that desire to recieve")
    .addParam("path", "Array addresses to path")
    .addParam("deadline", "Deadline to trade")
    .setAction(async ({ contract, address, path, amountin, amountoutmin, deadline }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const LPRouterContract = (await ethers.getContractFactory("LPRouter")).attach(contract)

        const pathArray = path.split(",")

        await hre.run("erc20.approve", {
            token: pathArray[0],
            amount: amountin,
            spender: contract,
        })

        const tx = await (await LPRouterContract.swapExactTokensForTokens(amountin, amountoutmin, pathArray, address, deadline)).wait()

        console.log(`LPRouter.swapExactTokenForToken: ${tx.transactionHash}`)
    })
