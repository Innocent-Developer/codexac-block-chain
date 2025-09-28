const nonces = new Map<string, string>();

function randomNonce(): string {
  // 16 bytes hex
  const arr = new Uint8Array(16);
  for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const nonceStore = {
  issue(address: string) {
    const nonce = randomNonce();
    nonces.set(address.toLowerCase(), nonce);
    return nonce;
  },
  peek(address: string) {
    return nonces.get(address.toLowerCase());
  },
  consume(address: string) {
    const key = address.toLowerCase();
    const n = nonces.get(key);
    if (n) nonces.delete(key);
    return n;
  },
};
