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

  // Append to wallets.json (do not overwrite previous wallets)
  const file = "wallets.json";
  let wallets: any[] = [];
  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) wallets = parsed;
    } catch {
      // If file is corrupted or not an array, start fresh
      wallets = [];
    }
  }

  const entry = { ...walletInfo, createdAt: new Date().toISOString() };
  wallets.push(entry);
  fs.writeFileSync(file, JSON.stringify(wallets, null, 2));

  console.log(`\nWallet info saved to ${file} (index ${wallets.length - 1})`);
}

createWallet();