import { mock, describe, expect, test } from "bun:test";

/**
 * ⚠️ [CRITICAL] 
 * This mock must reside at the very top of the file to intercept
 * dynamic imports within resolveNetwork() before they evaluate.
 */
mock.module("@paynodelabs/sdk-js", () => {
    const mockProvider = {
        getNetwork: async () => ({ chainId: 84532n }), // Force testnet for all
        getBalance: async () => 1000000000001n
    };
    return {
        ethers: {
            JsonRpcProvider: class {
                constructor(public url: string) {}
                getNetwork = async () => mockProvider.getNetwork();
            }
        },
        BASE_RPC_URLS: ["http://mock-rpc"],
        BASE_RPC_URLS_SANDBOX: ["http://mock-rpc-sandbox"],
        BASE_USDC_ADDRESS: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        BASE_USDC_ADDRESS_SANDBOX: "0x65c088EfBDB0E03185Dbe8e258Ad0cf4Ab7946b0",
        PAYNODE_ROUTER_ADDRESS: "0x4A73696ccF76E7381b044cB95127B3784369Ed63",
        PAYNODE_ROUTER_ADDRESS_SANDBOX: "0x24cD8b68aaC209217ff5a6ef1Bf55a59f2c8Ca6F"
    };
});

import { resolveNetwork } from "../utils.ts";

describe("resolveNetwork() unit tests with direct mock", () => {
    
    test("✅ Should resolve testnet (Sepolia) by alias", async () => {
        const config = await resolveNetwork(undefined, "testnet");
        expect(config.chainId).toBe(84532);
        expect(config.isSandbox).toBe(true);
        expect(config.usdcAddress).toBe("0x65c088EfBDB0E03185Dbe8e258Ad0cf4Ab7946b0");
        expect(config.routerAddress).toBe("0x24cD8b68aaC209217ff5a6ef1Bf55a59f2c8Ca6F");
    });

    test("✅ Should resolve mainnet (aliased to Sandbox in this mock)", async () => {
        const config = await resolveNetwork(undefined, "mainnet");
        // Due to our mock forcing 84532n, it will be treated as Sandbox.
        expect(config.chainId).toBe(84532);
        expect(config.networkName).toContain("84532");
    });

    test("✅ Should use provided custom RPC URL without timing out", async () => {
        const customRpc = "http://my-mock-rpc-node.com";
        const config = await resolveNetwork(customRpc);
        expect(config.rpcUrl).toBe(customRpc);
    });
});
