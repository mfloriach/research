import { verifyMessage, type Hex } from "viem";
import { SignJWT, jwtVerify } from "jose";
import { getServerConfig } from "@/lib/config";
import {
  AUTH_COOKIE_NAME,
  JWT_EXPIRES_IN_SECONDS,
  buildSiweMessage,
  generateNonce,
  parseSiweMessage,
  type SiweMessageFields,
} from "@/lib/siwe";
import {
  consumeAuthNonce,
  createAuthNonce,
} from "@/app/server/repositories/auth-nonces";
import { BadRequestError, UnauthorizedError } from "@/lib/errors";

export { AUTH_COOKIE_NAME };

/** Cookie lifetime mirrors the JWT lifetime (7 days, in seconds). */
export const JWT_COOKIE_MAX_AGE = JWT_EXPIRES_IN_SECONDS;

export type SiweNonceResult = {
  nonce: string;
  message: string;
  expiresAt: string;
};

export type VerifiedSession = {
  address: string;
  chainId: number;
  expiresAt: string;
  token: string;
};

function getJwtKey(): Uint8Array {
  return new TextEncoder().encode(getServerConfig().jwtSecret);
}

function resolveDomain(requestUrl: string, domain?: string | null): string {
  if (domain) {
    return domain;
  }
  return new URL(requestUrl).host;
}

/**
 * Issue a one-time SIWE nonce and the exact message to sign.
 * Pure orchestration: persistence goes through the repository.
 */
export async function issueSiweNonce(input: {
  address: string;
  chainId: number;
  requestUrl: string;
  domain?: string | null;
}): Promise<SiweNonceResult> {
  const normalizedAddress = input.address.toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(normalizedAddress)) {
    throw new BadRequestError("Invalid wallet address");
  }
  const domain = resolveDomain(input.requestUrl, input.domain);
  const uri = new URL(input.requestUrl).origin;
  const nonce = generateNonce();
  const now = new Date();
  const fields: SiweMessageFields = {
    domain,
    address: input.address,
    uri,
    nonce,
    chainId: input.chainId,
    issuedAt: now.toISOString(),
    expirationTime: new Date(
      now.getTime() + JWT_EXPIRES_IN_SECONDS * 1000,
    ).toISOString(),
  };
  const expiresAt = await createAuthNonce({
    nonce,
    address: normalizedAddress,
    chainId: input.chainId,
  });
  return {
    nonce,
    message: buildSiweMessage(fields),
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Verify a SIWE signature and mint a JWT on success.
 * Consumes the nonce (single use), checks domain/expiry/address binding,
 * then verifies the EIP-191 signature with `viem`.
 */
export async function verifySiweSignature(input: {
  message: string;
  signature: string;
  requestUrl: string;
  domain?: string | null;
}): Promise<VerifiedSession> {
  const fields = parseSiweMessage(input.message);
  if (!fields) {
    throw new BadRequestError("Malformed sign-in message");
  }
  if (resolveDomain(input.requestUrl, input.domain) !== fields.domain) {
    throw new UnauthorizedError("Sign-in domain mismatch");
  }
  if (Date.parse(fields.expirationTime) <= Date.now()) {
    throw new UnauthorizedError("Sign-in message expired");
  }
  const stored = await consumeAuthNonce(fields.nonce);
  if (!stored) {
    throw new UnauthorizedError("Unknown or expired nonce");
  }
  if (
    stored.address !== fields.address.toLowerCase() ||
    stored.chainId !== fields.chainId
  ) {
    throw new UnauthorizedError("Sign-in message does not match the nonce");
  }
  const valid = await verifyMessage({
    address: fields.address as Hex,
    message: input.message,
    signature: input.signature as Hex,
  }).catch(() => false);
  if (!valid) {
    throw new UnauthorizedError("Invalid wallet signature");
  }
  const expiresAt = new Date(
    Date.now() + JWT_EXPIRES_IN_SECONDS * 1000,
  ).toISOString();
  const token = await new SignJWT({
    address: fields.address.toLowerCase(),
    chainId: fields.chainId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("epistimology")
    .setExpirationTime(`${JWT_EXPIRES_IN_SECONDS}s`)
    .sign(getJwtKey());
  return {
    address: fields.address.toLowerCase(),
    chainId: fields.chainId,
    expiresAt,
    token,
  };
}

/** Verify a session JWT and return its claims. Throws on any failure. */
export async function verifyAuthToken(token: string): Promise<{
  address: string;
  chainId: number;
  expiresAt: string;
}> {
  let payload: { address?: unknown; chainId?: unknown; exp?: number };
  try {
    ({ payload } = await jwtVerify(token, getJwtKey(), {
      issuer: "epistimology",
    }));
  } catch {
    throw new UnauthorizedError("Invalid or expired session");
  }
  if (
    typeof payload.address !== "string" ||
    !/^0x[0-9a-f]{40}$/.test(payload.address) ||
    typeof payload.chainId !== "number"
  ) {
    throw new UnauthorizedError("Invalid session claims");
  }
  return {
    address: payload.address,
    chainId: payload.chainId,
    expiresAt: new Date((payload.exp ?? 0) * 1000).toISOString(),
  };
}
