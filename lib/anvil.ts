export type AnvilEthereumProvider = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export const ANVIL_CHAIN_ID_DEC = 31337;
export const ANVIL_CHAIN_ID_HEX = "0x7a69";
export const ANVIL_CHAIN_NAME = "Anvil Local";
export const ANVIL_CURRENCY = { name: "Ether", symbol: "ETH", decimals: 18 };

export function getAnvilRpcUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ANVIL_RPC_URL?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return "http://127.0.0.1:8545";
}

/**
 * Point the injected wallet at the local Anvil chain.
 * Tries `wallet_switchEthereumChain`, falls back to `wallet_addEthereumChain`
 * when Anvil is not yet registered (error 4902).
 */
export async function ensureAnvilChain(provider: AnvilEthereumProvider): Promise<void> {
  const rpcUrl = getAnvilRpcUrl();
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ANVIL_CHAIN_ID_HEX }],
    });
    return;
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: unknown }).code
        : undefined;
    // 4902 = chain not added to the wallet. Any other error should propagate.
    if (code !== 4902) {
      throw error;
    }
  }
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: ANVIL_CHAIN_ID_HEX,
        chainName: ANVIL_CHAIN_NAME,
        nativeCurrency: ANVIL_CURRENCY,
        rpcUrls: [rpcUrl],
      },
    ],
  });
}

async function rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(getAnvilRpcUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!response.ok) {
    throw new Error(`Anvil RPC responded with status ${response.status}`);
  }
  const data = (await response.json()) as { result?: T; error?: { message?: string } };
  if (data.error) {
    throw new Error(data.error.message ?? `Anvil RPC error on ${method}`);
  }
  return data.result as T;
}

/**
 * Direct JSON-RPC fallback for local dev without an injected wallet.
 * Anvil exposes unlocked accounts via `eth_accounts`, no approval needed.
 */
export async function getAnvilAccountsViaRpc(): Promise<string[]> {
  return rpcCall<string[]>("eth_accounts");
}

export async function isAnvilReachable(): Promise<boolean> {
  try {
    const chainId = await rpcCall<string>("eth_chainId");
    return chainId.toLowerCase() === ANVIL_CHAIN_ID_HEX;
  } catch {
    return false;
  }
}
