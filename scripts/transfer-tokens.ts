import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const targetAddress = "0xaD551e14f9935d1420D5cAE7179C9aDE4a9B2798";
    const amountToSend = ethers.parseUnits("1000000", 18); // 1M tokens

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Using deployer address:", deployer.address);

    // Get deployment info
    const deploymentPath = path.join(__dirname, "../deployments/localhost.json");
    if (!fs.existsSync(deploymentPath)) {
        throw new Error("Deployment file not found. Please deploy the contract first.");
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("Token contract address:", deployment.address);

    // Get contract instance
    const Token = await ethers.getContractFactory("MyToken");
    const token = Token.attach(deployment.address);

    // Check balances before transfer
    console.log("\nInitial balances:");
    console.log("Deployer:", ethers.formatUnits(await token.balanceOf(deployer.address), 18));
    console.log("Target:", ethers.formatUnits(await token.balanceOf(targetAddress), 18));

    // Transfer tokens
    console.log("\nTransferring tokens...");
    const tx = await token.transfer(targetAddress, amountToSend);
    await tx.wait();

    // Check balances after transfer
    console.log("\nFinal balances:");
    console.log("Deployer:", ethers.formatUnits(await token.balanceOf(deployer.address), 18));
    console.log("Target:", ethers.formatUnits(await token.balanceOf(targetAddress), 18));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });