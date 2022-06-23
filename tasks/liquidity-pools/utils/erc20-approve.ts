import { subtask } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

subtask("erc20.approve")
    .addParam("token", "Token address")
    .addParam("amount", "The amount of tokens, that desire to approve")
    .addParam("spender", "Approved address")
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const ERC20Contract = (await ethers.getContractFactory("ERC20Mock")).attach(taskArgs.token)

        const tx = await (await ERC20Contract.approve(taskArgs.spender, taskArgs.amount)).wait()

        console.log(`ERC20Mock.approve: ${tx.transactionHash}`)
    })
