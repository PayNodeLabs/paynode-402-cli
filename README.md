# ⚡ paynode-402-cli

[![Base L2](https://img.shields.io/badge/Network-Base%20L2-0052FF?style=for-the-badge&logo=base)](https://base.org)
[![HTTP 402](https://img.shields.io/badge/Protocol-x402-00ff88?style=for-the-badge)](https://paynode.dev)

The official command-line interface for the [PayNode](https://github.com/PayNodeLabs) protocol. Designed specifically for the Agentic Era, allowing AI Agents to execute zero-install, stateless micro-payments via the HTTP 402 standard.

## 🤖 For AI Agents (Zero-Install)

Your agent can use this tool dynamically via `bunx` without any manual installation:

```bash
# 1. Mint test USDC
bunx paynode-402-cli mint <YOUR_WALLET_ADDRESS>

# 2. Access a 402-protected API
PRIVATE_KEY="your_private_key" bunx paynode-402-cli request "https://api.example.com/data"
