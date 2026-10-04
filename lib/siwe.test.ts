/**
 * @jest-environment node
 */
import {
  buildSiweMessage,
  generateNonce,
  parseSiweMessage,
  SIWE_STATEMENT,
  siweNonceInputSchema,
  siweVerifyInputSchema,
} from "./siwe";

const FIELDS = {
  domain: "localhost:3000",
  address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  uri: "http://localhost:3000",
  nonce: "abcdef1234567890",
  chainId: 31337,
  issuedAt: "2026-10-04T00:00:00.000Z",
  expirationTime: "2026-10-11T00:00:00.000Z",
};

describe("siwe message", () => {
  it("builds an EIP-4361 message containing every field", () => {
    const message = buildSiweMessage(FIELDS);
    expect(message).toContain(
      "localhost:3000 wants you to sign in with your Ethereum account:",
    );
    expect(message).toContain(FIELDS.address);
    expect(message).toContain(SIWE_STATEMENT);
    expect(message).toContain(`URI: ${FIELDS.uri}`);
    expect(message).toContain("Version: 1");
    expect(message).toContain("Chain ID: 31337");
    expect(message).toContain(`Nonce: ${FIELDS.nonce}`);
  });

  it("round-trips through the parser", () => {
    expect(parseSiweMessage(buildSiweMessage(FIELDS))).toEqual(FIELDS);
  });

  it("rejects malformed messages", () => {
    expect(parseSiweMessage("hello")).toBeNull();
    expect(parseSiweMessage(buildSiweMessage(FIELDS).replace("Version: 1", "Version: 2"))).toBeNull();
    expect(
      parseSiweMessage(buildSiweMessage(FIELDS).replace("Chain ID: 31337", "Chain ID: abc")),
    ).toBeNull();
  });

  it("generates unique 128-bit hex nonces", () => {
    const first = generateNonce();
    const second = generateNonce();
    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(first).not.toBe(second);
  });
});

describe("siwe schemas", () => {
  it("accepts a valid nonce request with default chain id", () => {
    const parsed = siweNonceInputSchema.safeParse({
      address: FIELDS.address,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.chainId).toBe(31337);
    }
  });

  it("rejects a malformed address", () => {
    expect(
      siweNonceInputSchema.safeParse({ address: "0x123" }).success,
    ).toBe(false);
  });

  it("rejects a verify payload with a non-hex signature", () => {
    expect(
      siweVerifyInputSchema.safeParse({
        message: "msg",
        signature: "not-hex",
      }).success,
    ).toBe(false);
  });
});
