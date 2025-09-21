import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    // Token parameters
    const name = "codexac";
    const symbol = "cxac";
    const initialSupply = "1000000"; // 1 million tokens
    const targetAddress = "0xA72B8C83441065A0137fF8ee3473Ed9809e2c515";

    // Deploy token
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.deploy(name, symbol, initialSupply, deployer.address);
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log("Token deployed to:", tokenAddress);

    // Save deployment info
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        tokenAddress,
        name,
        symbol,
        decimals: 18,
        owner: deployer.address
    };

    const deploymentPath = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentPath)) {
        fs.mkdirSync(deploymentPath);
    }
    fs.writeFileSync(
        path.join(deploymentPath, "deployment.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    // Transfer tokens
    console.log("\nTransferring tokens to:", targetAddress);
    const transferAmount = ethers.parseUnits(initialSupply, 18);
    const tx = await token.transfer(targetAddress, transferAmount);
    await tx.wait();

    // Print final balances
    const targetBalance = await token.balanceOf(targetAddress);
    console.log("\nFinal balances:");
    console.log(`Target address (${targetAddress}):`, ethers.formatUnits(targetBalance, 18));

    console.log("\nToken details for MetaMask:");
    console.table({
        "Contract Address": tokenAddress,
        "Token Symbol": symbol,
        "Decimals": "18",
        "Network": deploymentInfo.network
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });