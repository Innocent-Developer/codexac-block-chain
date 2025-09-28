import { Router } from "express";
import { ethers } from "ethers";
import { walletStore } from "../services/walletStore";

export const walletsRouter = Router();

// GET /wallets - list wallets (hides private data by default)
walletsRouter.get("/", (req, res) => {
  const includePrivate = String(req.query.includePrivate || "false").toLowerCase() === "true";
  const items = walletStore.list();
  const sanitized = includePrivate
    ? items
    : items.map(({ address, createdAt }) => ({ address, createdAt }));
  res.json(sanitized);
});

// POST /wallets - create a new wallet (dev only)
walletsRouter.post("/", (_req, res) => {
  const w = ethers.Wallet.createRandom();
  const { index, entry } = walletStore.add({
    address: w.address,
    privateKey: w.privateKey,
    mnemonic: w.mnemonic?.phrase,
  });
  res.status(201).json({
    index,
    address: entry.address,
    mnemonic: entry.mnemonic,
  });
});
