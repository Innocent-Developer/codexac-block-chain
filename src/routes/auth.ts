import { Router } from "express";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import { nonceStore } from "../services/nonceStore";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const authRouter = Router();

// GET /auth/nonce?address=0x...
authRouter.get("/nonce", (req, res) => {
  const address = String(req.query.address || "");
  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid address" });
  }
  const nonce = nonceStore.issue(address);
  const message = `Sign this message to log in.\nNonce: ${nonce}`;
  res.json({ address: ethers.getAddress(address), nonce, message });
});

// POST /auth/verify { address, signature }
authRouter.post("/verify", (req, res) => {
  const { address, signature } = req.body || {};
  if (!address || !signature || !ethers.isAddress(address)) {
    return res.status(400).json({ error: "address and signature required" });
  }
  const expected = nonceStore.peek(address);
  if (!expected) {
    return res.status(400).json({ error: "No nonce issued for this address" });
  }
  const message = `Sign this message to log in.\nNonce: ${expected}`;
  let recovered: string;
  try {
    recovered = ethers.verifyMessage(message, signature);
  } catch (e) {
    return res.status(400).json({ error: "Invalid signature" });
  }
  if (recovered.toLowerCase() !== String(address).toLowerCase()) {
    return res.status(401).json({ error: "Signature does not match address" });
  }
  // Consume nonce and issue JWT
  nonceStore.consume(address);
  const token = jwt.sign({ sub: ethers.getAddress(address) }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ ok: true, address: ethers.getAddress(address), token });
});
