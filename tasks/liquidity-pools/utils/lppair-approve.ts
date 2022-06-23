import { subtask } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

subtask("LPPair.approve")
    .addParam("token", "Token address")
    .addParam("amount", "The amount of tokens, that desire to approve")
    .addParam("spender", "Approved address")
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const LPPairContract = (await ethers.getContractFactory("LPPair")).attach(taskArgs.token)

        const tx = await (await LPPairContract.approve(taskArgs.spender, taskArgs.amount)).wait()

        console.log(`ERC20Mock.approve: ${tx.transactionHash}`)
    })
