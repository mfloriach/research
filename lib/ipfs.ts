import { create, type KuboRPCClient } from "kubo-rpc-client";
import { IpfsUnavailableError } from "@/lib/errors";
import { getServerConfig } from "@/lib/config";

/**
 * Server-only IPFS access via the local Kubo node (see docker-compose.yml).
 * Never import this module from client components: it pulls in the Kubo RPC
 * client and reads server secrets at import time, which throws in the
 * browser. Client components needing a gateway link use `lib/ipfs-gateway`.
 */

const { ipfsRpcUrl } = getServerConfig();

let client: KuboRPCClient | null = null;

export function getIpfsClient(): KuboRPCClient {
  if (!client) {
    client = create({ url: ipfsRpcUrl });
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
