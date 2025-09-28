import fs from "fs";
import path from "path";

export type StoredWallet = {
  address: string;
  privateKey: string;
  mnemonic?: string;
  createdAt: string;
};

const FILE = path.join(process.cwd(), "wallets.json");

function readAll(): StoredWallet[] {
  if (!fs.existsSync(FILE)) return [];
  try {
    const raw = fs.readFileSync(FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as StoredWallet[];
    return [];
  } catch {
    return [];
  }
}

function writeAll(items: StoredWallet[]) {
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2));
}

export const walletStore = {
  list(): StoredWallet[] {
    return readAll();
  },
  add(item: Omit<StoredWallet, "createdAt">) {
    const all = readAll();
    const entry: StoredWallet = { ...item, createdAt: new Date().toISOString() };
    all.push(entry);
    writeAll(all);
    return { index: all.length - 1, entry };
  },
  findByAddress(address: string): StoredWallet | undefined {
    const all = readAll();
    return all.find((w) => w.address.toLowerCase() === address.toLowerCase());
  },
};
