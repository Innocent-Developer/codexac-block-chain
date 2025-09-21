# Ethereum Token Project

A complete TypeScript-based Ethereum token project with Hardhat integration.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Development

### Local Network

Start a local Hardhat node:

```bash
npm run start:node
```

Deploy to local network:

```bash
npm run deploy:local
```

### Testing

Run the test suite:

```bash
npm run test
```

### Deployment

Deploy to Goerli testnet:

```bash
npm run deploy:goerli
```

Verify on Etherscan:

```bash
npm run verify <CONTRACT_ADDRESS> "<CONSTRUCTOR_ARGS>"
```

## Private Chain Setup

1. Initialize Geth with genesis.json:

```bash
geth init genesis.json --datadir private-chain
```

2. Start the private chain:

```bash
geth --datadir private-chain --networkid 1337 --http --http.addr "0.0.0.0" --http.port 8545 --http.corsdomain "*" --http.api "eth,net,web3,personal" --allow-insecure-unlock
```

## MetaMask Configuration

### Add Private Network
- Network Name: Private Chain
- RPC URL: http://127.0.0.1:8545
- Chain ID: 1337
- Currency Symbol: ETH

### Add Token
1. Click "Import Token"
2. Enter token contract address
3. Symbol and decimals should auto-populate
4. Click "Add Token"

## Security Notes

- Never commit your `.env` file
- Keep your private keys secure
- Use separate accounts for development and production
- Audit contracts before mainnet deployment

## Scripts

- `npm run start:node` - Start local Hardhat node
- `npm run compile` - Compile contracts
- `npm run test` - Run tests
- `npm run deploy:local` - Deploy to local network
- `npm run deploy:goerli` - Deploy to Goerli testnet
- `npm run verify` - Verify contract on Etherscan
- `npm run create-wallet` - Create a new wallet