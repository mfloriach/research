import { config } from "@/lib/config";

/**
 * Client-safe IPFS gateway helpers. This module imports only public config,
 * so client components can use it. Server-side Kubo access lives in
 * `lib/ipfs.ts`, which must never be imported from client components.
 */
export function ipfsGatewayUrl(cid: string): string {
  return `${config.ipfsGatewayUrl}/ipfs/${cid}`;
}
