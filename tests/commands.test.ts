import { mock, describe, expect, test, beforeEach, afterEach, spyOn } from "bun:test";

/**
 * 🛡️ [TEST SAFETY]
 * Prevent process.exit from killing the test runner.
 */
const exitSpy = spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`PROCESS_EXIT_${code}`);
});

/**
 * 🧬 [ENVIRONMENT SETUP]
 * Pre-set environment variables before any module evaluation.
 */
process.env.CLIENT_PRIVATE_KEY = "0x" + "1".repeat(64);

/**
 * 🔒 [MOCK CORE]
 */
const mockEthers = {
    parseEther: (v: string) => 1000000000000000n,
    formatEther: (v: bigint) => "0.001",
    formatUnits: (v: bigint, u: number) => (Number(v) / Math.pow(10, u)).toString(),
    Wallet: class {
        address = "0xMockAddress";
        //@ts-ignore
        connect = () => this;
        constructor(pk: string, provider: any) {}
    },
    Contract: class {
        constructor() {
            //@ts-ignore
            this.balanceOf = async () => 1000000n;
        }
    },
    JsonRpcProvider: class {
        constructor(url: string) {}
        //@ts-ignore
        getNetwork = async () => ({ chainId: 84532n });
        //@ts-ignore
        getBalance = async () => 1000000000000000n;
    }
};

mock.module("ethers", () => mockEthers);
mock.module("@paynodelabs/sdk-js", () => ({
    ethers: mockEthers,
    BASE_RPC_URLS: ["http://mock-rpc"],
    BASE_RPC_URLS_SANDBOX: ["http://mock-rpc-sandbox"],
    BASE_USDC_ADDRESS: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    BASE_USDC_ADDRESS_SANDBOX: "0x65c088EfBDB0E03185Dbe8e258Ad0cf4Ab7946b0",
    PAYNODE_ROUTER_ADDRESS: "0x4A73696ccF76E7381b044cB95127B3784369Ed63",
    PAYNODE_ROUTER_ADDRESS_SANDBOX: "0x24cD8b68aaC209217ff5a6ef1Bf55a59f2c8Ca6F"
}));

/**
 * 🚀 [DEFERRED LOADING]
 */
const { checkAction } = await import("../commands/check.ts");

describe("checkAction() CLI command tests", () => {
    let logSpy: any;

    beforeEach(() => {
        logSpy = spyOn(console, "log").mockImplementation(() => {});
        exitSpy.mockClear();
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    test("✅ Should output JSON status when --json is provided", async () => {
        await checkAction({ json: true });
        
        expect(logSpy).toHaveBeenCalled();
        const lastCall = logSpy.mock.calls[logSpy.mock.calls.length - 1][0];
        const output = JSON.parse(lastCall);
        expect(output.status).toBe("success");
        expect(output.address).toBe("0xMockAddress");
    });

    test("✅ Should output human-readable status by default", async () => {
        await checkAction({ json: false });
        expect(logSpy).toHaveBeenCalled();
        expect(logSpy.mock.calls[0][0]).toContain("PayNode Wallet Status");
    });
});
