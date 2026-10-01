/** Client-safe IPFS gateway helpers (no Kubo dependency). */
import { config } from "@/lib/config";

export function ipfsGatewayUrl(cid: string): string {
  return `${config.ipfsGatewayUrl}/ipfs/${cid}`;
}
