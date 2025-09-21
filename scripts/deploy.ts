import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // Get deployment parameters
  const name = process.env.TOKEN_NAME || "codexac";
  const symbol = process.env.TOKEN_SYMBOL || "cxac";
  const initialSupply = process.env.INITIAL_SUPPLY || "1000000";

  console.log("Deploying token with parameters:");
  console.table({
    name,
    symbol,
    initialSupply,
  });

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with address:", deployer.address);

  // Deploy token
  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy(name, symbol, initialSupply, deployer.address);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    address: tokenAddress,
    deployer: deployer.address,
    txHash: token.deploymentTransaction()?.hash,
    blockNumber: token.deploymentTransaction()?.blockNumber,
    parameters: {
      name,
      symbol,
      initialSupply,
    },
  };

  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath);
  }

  fs.writeFileSync(
    path.join(deploymentPath, `${network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to:", `deployments/${network.name}.json`);

  // Add this after token deployment
  console.log("\nToken Configuration for MetaMask:");
  console.table({
    "Token Contract Address": tokenAddress,
    "Token Symbol": symbol,
    "Decimals": "18",
    "Network": network.name,
    "Chain ID": network.chainId.toString(),
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });