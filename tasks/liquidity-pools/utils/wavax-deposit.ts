import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("wavax.deposit")
    .addParam("contract", "Token contract address")
    .addParam("amount", "Amount of depositing tokens")
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const WAVAXContract = (await ethers.getContractFactory("WAVAXMock")).attach(taskArgs.contract)

        const tx = await (await WAVAXContract.deposit({ value: taskArgs.amount })).wait()

        console.log(`WAVAX.deposit: ${tx.transactionHash}`)
    })
