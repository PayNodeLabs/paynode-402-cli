# ⚡ paynode-402-cli

[![Base L2](https://img.shields.io/badge/Network-Base%20L2-0052FF?style=for-the-badge&logo=base)](https://base.org)
[![HTTP 402](https://img.shields.io/badge/Protocol-x402-00ff88?style=for-the-badge)](https://paynode.dev)

The official command-line interface for the [PayNode](https://github.com/PayNodeLabs) protocol. Designed specifically for the **Agentic Era**, allowing AI Agents to execute zero-install, stateless micro-payments via the HTTP 402 standard.

---

## 🛠️ Configuration & Credentials

To enable automated blockchain signing, this tool requires a private key provided via environment variables.

> [!IMPORTANT]
> **Mandatory Variable**: `CLIENT_PRIVATE_KEY` (0x...)
> All signature and payment operations rely on this key. Ensure it is set in your environment before execution.

> [!CAUTION]
> **BURNER WALLET ONLY**: NEVER use a primary or "cold storage" wallet. This tool is designed for autonomous agents; always use a dedicated burner wallet with minimal funds (< 10 USDC).

### Setup Example (Unix)
```bash
export CLIENT_PRIVATE_KEY="0x..."
bunx @paynodelabs/paynode-402-cli check
```

---

## 🤖 For AI Agents (Zero-Install)

Your agent can use this tool dynamically via `bunx` without any manual installation:

### 1. Check Readiness (Gas & USDC)
```bash
bunx @paynodelabs/paynode-402-cli check --network testnet --json
```

### 2. Access a 402-Protected API
The CLI automatically detects the 402 challenge, performs the handshake, signs the payment (on-chain or EIP-3009), and returns the final resource.
```bash
bunx @paynodelabs/paynode-402-cli request "https://api.example.com/data" --network testnet --json
```

### 3. Mint Test USDC (Base Sepolia)
```bash
bunx @paynodelabs/paynode-402-cli mint --amount 100 --network testnet
```

---

## 📑 Command Summary

| Command | Description |
| :--- | :--- |
| `check` | Check ETH/USDC balances and readiness on Base L2 |
| `mint` | Mint Mock USDC on Base Sepolia for testing |
| `request <URL>` | Access a protected resource by handling the 402 challenge |
| `list-paid-apis` | Discover payable APIs from the PayNode Marketplace |
| `get-api-detail <id>` | Inspect one marketplace API |
| `invoke-paid-api <id>` | Invoke a marketplace API using the 402 flow |

### Global Flags
- `--network <name>`: `mainnet` or `testnet` (default: `testnet`).
- `--json`: Format output as machine-readable JSON (preferred for Agents).
- `--confirm-mainnet`: Explicit flag required for real USDC transactions on mainnet.
- `--background`: Execute in background and return a `task_id` for long-running handshakes.

---

## 📦 Publishing

This package is published under the scoped name `@paynodelabs/paynode-402-cli`, so the npm publish command must include `--access public`.

### Release Steps

```bash
cd packages/paynode-402-cli

# 1. Verify the package version
cat package.json | rg '"version"'

# 2. Optional: quick local verification
bun index.ts invoke-paid-api crypto-price-quick coin_id=bitcoin --network mainnet --confirm-mainnet --json --dry-run

# 3. Publish scoped package to npm
npm publish --access public
```

### Notes

- If you bump the version first, use `npm version patch`, `npm version minor`, or `npm version major`.
- After publishing, verify the live package with:

```bash
bunx @paynodelabs/paynode-402-cli@<new-version> invoke-paid-api crypto-price-quick coin_id=bitcoin --network mainnet --confirm-mainnet --json --dry-run
```

---

## 🔗 References
- **Marketplace**: [https://mk.paynode.dev](https://mk.paynode.dev)
- **Protocol SPEC**: [PayNode Docs](https://docs.paynode.dev)
- **GitHub**: [PayNodeLabs/paynode-402-cli](https://github.com/PayNodeLabs/paynode-402-cli)
