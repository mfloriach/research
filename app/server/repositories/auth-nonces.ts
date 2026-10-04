import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/db/migration";
import { SIWE_NONCE_TTL_MS } from "@/lib/siwe";

export const AUTH_NONCES_COLLECTION = COLLECTIONS.authNonces;

export type AuthNonceDoc = {
  _id: string;
  address: string;
  chainId: number;
  expiresAt: Date;
  createdAt: Date;
};

let indexEnsured = false;

async function ensureNonceIndex(): Promise<void> {
  if (indexEnsured) {
    return;
  }
  const db = await getDb();
  await db
    .collection(AUTH_NONCES_COLLECTION)
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  indexEnsured = true;
}

/**
 * Persist a one-time login nonce bound to an address.
 * All database queries for auth live here (never in `app/api`).
 */
export async function createAuthNonce(input: {
  nonce: string;
  address: string;
  chainId: number;
}): Promise<Date> {
  await ensureNonceIndex();
  const db = await getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SIWE_NONCE_TTL_MS);
  await db.collection<AuthNonceDoc>(AUTH_NONCES_COLLECTION).insertOne({
    _id: input.nonce,
    address: input.address.toLowerCase(),
    chainId: input.chainId,
    expiresAt,
    createdAt: now,
  });
  return expiresAt;
}

/**
 * Atomically consume a nonce: returns the stored record once, then it is
 * gone. Replays and unknown nonces both resolve to `null`.
 */
export async function consumeAuthNonce(
  nonce: string,
): Promise<AuthNonceDoc | null> {
  await ensureNonceIndex();
  const db = await getDb();
  const doc = await db
    .collection<AuthNonceDoc>(AUTH_NONCES_COLLECTION)
    .findOneAndDelete({ _id: nonce });
  if (!doc) {
    return null;
  }
  if (doc.expiresAt.getTime() < Date.now()) {
    return null;
  }
  return doc;
}
