import { create, type KuboRPCClient } from "kubo-rpc-client";
import { IpfsUnavailableError } from "@/lib/errors";
export { getIpfsGatewayUrl, ipfsGatewayUrl } from "@/lib/ipfs-gateway";

/**
 * Server-only IPFS access via the local Kubo node (see docker-compose.yml).
 * Never import this module from client components.
 */

export function getIpfsRpcUrl(): string {
  const fromEnv = process.env.IPFS_RPC_URL?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return "http://127.0.0.1:5001";
}

let client: KuboRPCClient | null = null;

export function getIpfsClient(): KuboRPCClient {
  if (!client) {
    client = create({ url: getIpfsRpcUrl() });
  }
  return client;
}

/** Pin a JSON envelope and return its CID string. */
export async function pinJson(payload: unknown): Promise<string> {
  try {
    const result = await getIpfsClient().add(JSON.stringify(payload), {
      pin: true,
    });
    return result.cid.toString();
  } catch (error) {
    throw new IpfsUnavailableError(
      error instanceof Error
        ? `IPFS unavailable: ${error.message}`
        : "IPFS unavailable",
    );
  }
}

/** Fetch and parse a pinned JSON envelope by CID. */
export async function catJson<T>(cid: string): Promise<T> {
  try {
    const chunks: Uint8Array[] = [];
    for await (const chunk of getIpfsClient().cat(cid)) {
      chunks.push(chunk);
    }
    const text = Buffer.concat(chunks).toString("utf-8");
    return JSON.parse(text) as T;
  } catch (error) {
    throw new IpfsUnavailableError(
      error instanceof Error
        ? `IPFS unavailable: ${error.message}`
        : "IPFS unavailable",
    );
  }
}
