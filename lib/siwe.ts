import { z } from "zod";
import { ANVIL_CHAIN_ID_DEC } from "@/lib/anvil";

/**
 * Sign-In with Ethereum (EIP-4361) helpers.
 *
 * Message construction/parsing lives here so both the client hook
 * (`app/hooks/use-siwe-auth.ts`) and the server verifier
 * (`app/server/services/auth-service.ts`) share one canonical format.
 * Signature verification itself uses `viem` (`verifyMessage`); JWT
 * issuance/verification uses `jose`. No `better-auth` involved.
 */

export const AUTH_COOKIE_NAME = "epistimology_auth";

/** How long an issued JWT stays valid (7 days, in seconds). */
export const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

/** How long a login nonce stays valid (10 minutes, in ms). */
export const SIWE_NONCE_TTL_MS = 10 * 60 * 1000;

export const SIWE_STATEMENT =
  "Sign in to Epistimology with your Ethereum account.";

export const SIWE_VERSION = "1" as const;

export const addressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, {
    error: "Address must be a 0x-prefixed 40-hex-char address",
  })
  .describe("0x-prefixed Ethereum address");

export const siweNonceInputSchema = z
  .object({
    address: addressSchema.describe("Wallet address requesting a nonce"),
    chainId: z
      .number()
      .int()
      .default(ANVIL_CHAIN_ID_DEC)
      .describe("EIP-155 chain id the signature will be bound to"),
  })
  .meta({ id: "SiweNonceInput" });

export type SiweNonceInput = z.infer<typeof siweNonceInputSchema>;

export const siweNonceResponseSchema = z
  .object({
    nonce: z.string().describe("One-time login nonce"),
    message: z.string().describe("EIP-4361 message to sign with the wallet"),
    expiresAt: z.string().describe("ISO timestamp when the nonce expires"),
  })
  .meta({ id: "SiweNonceResponse" });

export type SiweNonceResponse = z.infer<typeof siweNonceResponseSchema>;

export const siweVerifyInputSchema = z
  .object({
    message: z
      .string()
      .min(1, { error: "Message must not be empty" })
      .describe("EIP-4361 message previously issued by /api/auth/nonce"),
    signature: z
      .string()
      .regex(/^0x[0-9a-fA-F]+$/, {
        error: "Signature must be a 0x-prefixed hex string",
      })
      .describe("EIP-191 personal_sign signature of the message"),
  })
  .meta({ id: "SiweVerifyInput" });

export type SiweVerifyInput = z.infer<typeof siweVerifyInputSchema>;

export const siweVerifyResponseSchema = z
  .object({
    address: addressSchema.describe("Authenticated wallet address"),
    chainId: z.number().int().describe("Chain id the session is bound to"),
    expiresAt: z.string().describe("ISO timestamp when the JWT expires"),
  })
  .meta({ id: "SiweVerifyResponse" });

export type SiweVerifyResponse = z.infer<typeof siweVerifyResponseSchema>;

export const siweSessionSchema = z
  .object({
    address: addressSchema.describe("Authenticated wallet address"),
    chainId: z.number().int().describe("Chain id the session is bound to"),
    expiresAt: z.string().describe("ISO timestamp when the JWT expires"),
  })
  .meta({ id: "SiweSession" });

export type SiweSession = z.infer<typeof siweSessionSchema>;

export const siweLogoutResponseSchema = z
  .object({
    ok: z.boolean().describe("True once the session cookie was cleared"),
  })
  .meta({ id: "SiweLogoutResponse" });

export type SiweMessageFields = {
  domain: string;
  address: string;
  uri: string;
  nonce: string;
  chainId: number;
  issuedAt: string;
  expirationTime: string;
};

/**
 * Build the canonical EIP-4361 text the wallet signs.
 * Field order and labels are part of the signed payload: both sides must
 * use this exact builder (server re-parses with `parseSiweMessage`).
 */
export function buildSiweMessage(fields: SiweMessageFields): string {
  return [
    `${fields.domain} wants you to sign in with your Ethereum account:`,
    fields.address,
    "",
    SIWE_STATEMENT,
    "",
    `URI: ${fields.uri}`,
    `Version: ${SIWE_VERSION}`,
    `Chain ID: ${fields.chainId}`,
    `Nonce: ${fields.nonce}`,
    `Issued At: ${fields.issuedAt}`,
    `Expiration Time: ${fields.expirationTime}`,
  ].join("\n");
}

function matchField(message: string, label: string): string | null {
  const match = message.match(new RegExp(`^${label}: (.+)$`, "m"));
  return match?.[1]?.trim() ?? null;
}

/**
 * Parse an EIP-4361 message produced by `buildSiweMessage`.
 * Returns `null` when the shape is unrecognized (caller maps to 400).
 */
export function parseSiweMessage(message: string): SiweMessageFields | null {
  const lines = message.split("\n");
  if (lines.length < 11) {
    return null;
  }
  const domain = lines[0]?.replace(
    " wants you to sign in with your Ethereum account:",
    "",
  );
  const address = lines[1]?.trim();
  if (!domain || !address) {
    return null;
  }
  const uri = matchField(message, "URI");
  const nonce = matchField(message, "Nonce");
  const issuedAt = matchField(message, "Issued At");
  const expirationTime = matchField(message, "Expiration Time");
  const chainIdRaw = matchField(message, "Chain ID");
  const version = matchField(message, "Version");
  if (!uri || !nonce || !issuedAt || !expirationTime || !chainIdRaw) {
    return null;
  }
  const chainId = Number(chainIdRaw);
  if (!Number.isInteger(chainId) || version !== SIWE_VERSION) {
    return null;
  }
  return { domain, address, uri, nonce, chainId, issuedAt, expirationTime };
}

/** Generate a one-time login nonce (128-bit hex, no `0x` prefix). */
export function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
