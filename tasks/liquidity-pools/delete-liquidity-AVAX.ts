import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("liquidity.deleteLiquidityAVAX")
    .addParam("contract", "Contract address")
    .addParam("address", "The account's address")
    .addParam("token", "Token address")
    .addParam("wavax", "WAVAX token address")
    .addParam("factory", "Factrory address")
    .addParam("amounttokenmin", "The minimal amount of tokens, that desire to swap")
    .addParam("amountavaxmin", "The minimal amount of tokens, that desire to receive")
    .addParam("deadline", "Deadline to trade")
    .setAction(async ({ contract, address, token, wavax, factory, amounttokenmin, amountavaxmin, deadline }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const LPRouterContract = (await ethers.getContractFactory("LPRouter")).attach(contract)
        const LPFactoryContract = (await ethers.getContractFactory("LPFactory")).attach(factory)

        const pairAddress = await LPFactoryContract.getPair(token, wavax)
        const LPPairContract = (await ethers.getContractFactory("LPPair")).attach(pairAddress)

        const liquidity = await LPPairContract.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

        console.log(`LPRouter.balanceOf: ${liquidity}`)

        await hre.run("LPPair.approve", {
            token: pairAddress,
            amount: liquidity.toString(),
            spender: contract,
        })

        const tx = await (await LPRouterContract.removeLiquidityAVAX(token, liquidity, amounttokenmin, amountavaxmin, address, deadline)).wait()

        console.log(`LPRouter.deleteLiquidityAVAX: ${tx.transactionHash}`)
    })
