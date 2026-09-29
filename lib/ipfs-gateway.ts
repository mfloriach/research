/** Client-safe IPFS gateway helpers (no Kubo dependency). */

export function getIpfsGatewayUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8080";
}

export function ipfsGatewayUrl(cid: string): string {
  return `${getIpfsGatewayUrl()}/ipfs/${cid}`;
}
