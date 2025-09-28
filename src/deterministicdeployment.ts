import { ethers } from "hardhat";
import { utils } from "ethers";

async function main() {
    const SALT = "0x123"; // Always use the same salt
    const name = "Codexac";
    const symbol = "cxac";
    const initialSupply = "1000000";

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Get the contract factory
    const Token = await ethers.getContractFactory("MyToken");
    
    // Create initialization bytecode with constructor arguments
    const initCode = Token.bytecode + Token.interface.encodeDeploy([
        name, 
        symbol, 
        initialSupply, 
        deployer.address
    ]).slice(2);

    // Calculate the deterministic address
    const create2Address = ethers.getCreateAddress2(
        deployer.address,
        SALT,
        ethers.keccak256(initCode)
    );

    console.log("Predicted address:", create2Address);

    // Deploy with CREATE2
    const tx = await deployer.sendTransaction({
        data: initCode,
        salt: SALT
    });
    await tx.wait();

    console.log("Token deployed to:", create2Address);
    
    // Verify the deployment
    const code = await ethers.provider.getCode(create2Address);
    if (code === "0x") {
        throw new Error("Deployment failed");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });