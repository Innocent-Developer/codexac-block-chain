import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { walletsRouter } from "./routes/wallets";
import { authRouter } from "./routes/auth";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/wallets", walletsRouter);
app.use("/auth", authRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
