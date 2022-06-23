import { subtask } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

subtask("wavax.approve")
    .addParam("token", "Token address")
    .addParam("amount", "The amount of tokens, that desire to approve")
    .addParam("spender", "Approved address")
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const WAVAXContract = (await ethers.getContractFactory("WAVAXMock")).attach(taskArgs.token)

        const tx = await (await WAVAXContract.approve(taskArgs.spender, taskArgs.amount)).wait()

        console.log(`WAVAXMock.approve: ${tx.transactionHash}`)
    })
