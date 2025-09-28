import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    // CONSTANT Token Contract Address - replace with your actual deployed token address
    const CONSTANT_TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with actual token address
    
    // Token parameters (for reference only)
    const name = "codexac";
    const symbol = "cxac";
    const targetAddress = "0xaD551e14f9935d1420D5cAE7179C9aDE4a9B2798";
    const transferAmount = "1000"; // Amount to transfer (in tokens, not wei)

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("Using account:", signer.address);

    // Connect to existing token contract (no deployment)
    console.log("Connecting to existing token contract at:", CONSTANT_TOKEN_ADDRESS);
    const Token = await ethers.getContractFactory("MyToken");
    const token = Token.attach(CONSTANT_TOKEN_ADDRESS);

    // Verify contract exists and get basic info
    try {
        const tokenName = await token.name();
        const tokenSymbol = await token.symbol();
        const tokenDecimals = await token.decimals();
        
        console.log("Connected to token:");
        console.log("- Name:", tokenName);
        console.log("- Symbol:", tokenSymbol);
        console.log("- Decimals:", tokenDecimals);
        
        // Check signer balance
        const signerBalance = await token.balanceOf(signer.address);
        console.log("- Signer balance:", ethers.formatUnits(signerBalance, tokenDecimals));
        
        // Ensure sufficient balance; on local networks, mint the missing amount using owner
        const transferAmountWei = ethers.parseUnits(transferAmount, tokenDecimals);
        if (signerBalance < transferAmountWei) {
            const net = await ethers.provider.getNetwork();
            const isLocal = net.name === "hardhat" || net.name === "localhost" || net.chainId === 31337n;
            if (isLocal) {
                const missing = transferAmountWei - signerBalance;
                const owner = await token.owner();
                console.log(`Insufficient balance. Minting ${ethers.formatUnits(missing, tokenDecimals)} tokens to signer from owner ${owner} (local network).`);
                // Impersonate owner and mint
                await ethers.provider.send("hardhat_impersonateAccount", [owner]);
                // Give the impersonated owner some ETH for gas
                await ethers.provider.send("hardhat_setBalance", [owner, "0x56BC75E2D63100000"]); // ~100 ETH
                const ownerSigner = await ethers.getSigner(owner);
                const tokenAsOwner = token.connect(ownerSigner) as any;
                const mintTx = await tokenAsOwner.mint(signer.address, missing);
                await mintTx.wait();
                await ethers.provider.send("hardhat_stopImpersonatingAccount", [owner]);
                // Re-check balance
                const updated = await token.balanceOf(signer.address);
                console.log("- Updated signer balance:", ethers.formatUnits(updated, tokenDecimals));
                if (updated < transferAmountWei) {
                    throw new Error("Minting failed to provide sufficient balance for transfer on local network.");
                }
            } else {
                console.error("Insufficient balance for transfer!");
                console.log(`Required: ${transferAmount} tokens`);
                console.log(`Available: ${ethers.formatUnits(signerBalance, tokenDecimals)} tokens`);
                console.log("Top up the signer balance or ask the token owner to mint to you.");
                return;
            }
        }

        // Transfer tokens
        console.log(`\nTransferring ${transferAmount} tokens to:`, targetAddress);
        const tx = await token.transfer(targetAddress, transferAmountWei);
        console.log("Transaction hash:", tx.hash);
        await tx.wait();
        console.log("Transfer completed!");

        // Print final balances
        const targetBalance = await token.balanceOf(targetAddress);
        const newSignerBalance = await token.balanceOf(signer.address);
        
        console.log("\nFinal balances:");
        console.log(`Signer (${signer.address}):`, ethers.formatUnits(newSignerBalance, tokenDecimals));
        console.log(`Target address (${targetAddress}):`, ethers.formatUnits(targetBalance, tokenDecimals));

        // Save/update deployment info
        const deploymentInfo = {
            network: (await ethers.provider.getNetwork()).name,
            tokenAddress: CONSTANT_TOKEN_ADDRESS,
            name: tokenName,
            symbol: tokenSymbol,
            decimals: Number(tokenDecimals),
            lastTransferTo: targetAddress,
            lastTransferAmount: transferAmount,
            lastTransferHash: tx.hash
        };

        const deploymentPath = path.join(__dirname, "../deployments");
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath);
        }
        fs.writeFileSync(
            path.join(deploymentPath, "deployment.json"),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\nToken details for MetaMask:");
        console.table({
            "Contract Address": CONSTANT_TOKEN_ADDRESS,
            "Token Symbol": tokenSymbol,
            "Decimals": tokenDecimals.toString(),
            "Network": deploymentInfo.network
        });
        
    } catch (error) {
        console.error("Error connecting to token contract:", error);
        console.log("Please make sure:");
        console.log("1. The contract address is correct");
        console.log("2. The contract is deployed on the current network");
        console.log("3. The contract ABI matches the MyToken contract");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });