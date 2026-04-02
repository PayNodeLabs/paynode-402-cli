import { describe, expect, test, mock, beforeAll, afterAll } from "bun:test";
import { 
    generateTaskId, 
    maskAddress, 
    jsonEnvelope, 
    EXIT_CODES, 
    SKILL_VERSION,
    SDK_VERSION
} from "../utils.ts";
import fs from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("PayNode CLI Utilities", () => {
    
    test("generateTaskId() should return unique alphanumeric strings", () => {
        const id1 = generateTaskId();
        const id2 = generateTaskId();
        expect(id1).not.toBe(id2);
        expect(id1).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    });

    test("maskAddress() should mask long addresses", () => {
        const addr = "0x1234567890abcdef1234567890abcdef12345678";
        const masked = maskAddress(addr);
        expect(masked).toBe("0x1234...5678");
    });

    test("maskAddress() should return short strings as-is", () => {
        expect(maskAddress("abc")).toBe("abc");
    });

    test("jsonEnvelope() should include correct version metadata", () => {
        const data = { foo: "bar" };
        const envelope = JSON.parse(jsonEnvelope(data));
        
        expect(envelope.foo).toBe("bar");
        expect(envelope.version).toBe(SKILL_VERSION);
        expect(envelope.skill_version).toBe(SKILL_VERSION);
        expect(envelope.sdk_version).toBe(SDK_VERSION);
    });

    test("EXIT_CODES should be consistent with protocol spec", () => {
        expect(EXIT_CODES.SUCCESS).toBe(0);
        expect(EXIT_CODES.GENERIC_ERROR).toBe(1);
        expect(EXIT_CODES.AUTH_FAILURE).toBe(3);
        expect(EXIT_CODES.INSUFFICIENT_FUNDS).toBe(7);
        expect(EXIT_CODES.DUST_LIMIT).toBe(8);
    });
});
