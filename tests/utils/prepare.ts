import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"

export async function prepareSigners(thisObject: Mocha.Context) {
    thisObject.signers = await ethers.getSigners()
    thisObject.owner = thisObject.signers[0]
    thisObject.alice = thisObject.signers[1]
    thisObject.bob = thisObject.signers[2]
    thisObject.carol = thisObject.signers[3]
    thisObject.tema = thisObject.signers[4]
    thisObject.misha = thisObject.signers[5]
}

export async function prepareERC20Tokens(thisObject: Mocha.Context, signer: SignerWithAddress) {
    const tokenFactory = await ethers.getContractFactory("ERC20Mock")

    const token1 = await tokenFactory.connect(signer).deploy("Token1", "TKN1", ethers.utils.parseUnits("100000", 6))
    await token1.deployed()
    thisObject.token1 = token1

    const token2 = await tokenFactory.connect(signer).deploy("Token2", "TKN2", ethers.utils.parseUnits("100000", 6))
    await token2.deployed()
    thisObject.token2 = token2

    const token3 = await tokenFactory.connect(signer).deploy("Token3", "TKN3", ethers.utils.parseUnits("100000", 6))
    await token3.deployed()
    thisObject.token3 = token3

    const token4 = await tokenFactory.connect(signer).deploy("Token4", "TKN4", ethers.utils.parseUnits("100000", 6))
    await token4.deployed()
    thisObject.token4 = token4

    const token5 = await tokenFactory.connect(signer).deploy("Token5", "TKN5", ethers.utils.parseUnits("100000", 6))
    await token5.deployed()
    thisObject.token5 = token5
}
