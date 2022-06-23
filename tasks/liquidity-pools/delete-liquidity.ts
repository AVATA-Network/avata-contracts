import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("liquidity.deleteLiquidity")
    .addParam("contract", "Contract address")
    .addParam("address", "The account's address")
    .addParam("tokena", "A token address from one pair")
    .addParam("tokenb", "B token address from one pair")
    .addParam("factory", "LPFactory address")
    .addParam("amountamin", "The minimal amount of tokens, that desire to swap")
    .addParam("amountbmin", "The minimal amount of tokens, that desire to receive")
    .addParam("deadline", "Deadline to trade")
    .setAction(async ({ contract, address, tokena, tokenb, amountamin, amountbmin, deadline, factory }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const LPRouterContract = (await ethers.getContractFactory("LPRouter")).attach(contract)
        const LPFactoryContract = (await ethers.getContractFactory("LPFactory")).attach(factory)

        const pairAddress = await LPFactoryContract.getPair(tokena, tokenb)
        const LPPairContract = (await ethers.getContractFactory("LPPair")).attach(pairAddress)

        const liquidity = await LPPairContract.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

        console.log(`LPRouter.balanceOf: ${liquidity}`)

        await hre.run("LPPair.approve", {
            token: pairAddress,
            amount: liquidity.toString(),
            spender: contract,
        })

        const tx = await (await LPRouterContract.removeLiquidity(tokena, tokenb, liquidity, amountamin, amountbmin, address, deadline)).wait()

        console.log(`LPRouter.deleteLiquidity: ${tx.transactionHash}`)
    })
