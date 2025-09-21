import { ethers } from "ethers";
import fs from "fs";

function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  
  console.log("New wallet created!");
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("Mnemonic:", wallet.mnemonic?.phrase);

  // Save to file (optional)
  const walletInfo = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase,
  };

  fs.writeFileSync(
    "wallet.json",
    JSON.stringify(walletInfo, null, 2)
  );
  console.log("\nWallet info saved to wallet.json");
}

createWallet();