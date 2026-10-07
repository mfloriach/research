import type { APIRequestContext, Page } from "@playwright/test";
import { privateKeyToAccount } from "viem/accounts";

/** Dossier id for the Carbon border taxes argument (random per seed). */
export async function carbonArgumentId(
  request: APIRequestContext,
): Promise<string> {
  const response = await request.get("/api/arguments");
  const body = (await response.json()) as {
    arguments: { id: string; title: string }[];
  };
  const found = body.arguments.find((item) =>
    item.title.includes("Carbon border"),
  );
  if (!found) {
    throw new Error("Carbon border taxes argument not seeded");
  }
  return found.id;
}

/**
 * Open a dossier and wait for its content fetch to settle. Without this,
 * clicks can land before the fetched content replaces the fallback render
 * and remounts the tab radios underneath the interaction.
 */
export async function gotoDossier(
  page: Page,
  request: APIRequestContext,
): Promise<string> {
  const id = await carbonArgumentId(request);
  await page.goto(`/debate/argument/${id}`);
  await page
    .waitForResponse(
      (response) => response.url().includes("/api/content") && response.ok(),
      { timeout: 8_000 },
    )
    .catch(() => {});
  return id;
}

/**
 * Stub an injected wallet before page scripts run. `eth_accounts` starts
 * empty so nothing auto-connects; `eth_requestAccounts` resolves an address
 * and emits `accountsChanged`, mirroring a real wallet. Signatures are
 * dummy bytes: wallet connection succeeds, SIWE verification does not
 * (no private key), which is exactly the state these tests need.
 */
export async function stubWallet(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    let connected = false;
    const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
    const emit = (event: string, ...args: unknown[]) => {
      for (const listener of listeners[event] ?? []) {
        listener(...args);
      }
    };
    (window as unknown as { ethereum: unknown }).ethereum = {
      request: async ({ method }: { method: string }) => {
        switch (method) {
          case "eth_accounts":
            return connected ? [address] : [];
          case "eth_chainId":
            return "0x7a69";
          case "eth_requestAccounts":
            connected = true;
            queueMicrotask(() => emit("accountsChanged", [address]));
            return [address];
          case "wallet_switchEthereumChain":
            return null;
          case "personal_sign":
            return `0x${"ab".repeat(65)}`;
          case "eth_sendTransaction":
            // Chain writes stay wallet-side: reject them so recordSignature
            // resolves through its warning path instead of polling Anvil
            // for a receipt that will never exist.
            throw { code: 4001, message: "User rejected the request." };
          default:
            return null;
        }
      },
      on: (event: string, listener: (...args: unknown[]) => void) => {
        listeners[event] ??= [];
        listeners[event].push(listener);
      },
      removeListener: (event: string, listener: (...args: unknown[]) => void) => {
        listeners[event] = (listeners[event] ?? []).filter(
          (entry) => entry !== listener,
        );
      },
    };
  });
}

/**
 * Complete a real SIWE login against the test server using the public
 * local Anvil dev key (local-only, also in `contracts:deploy:anvil`).
 * Runs over `page.request` so the JWT cookie lands in the page's own
 * browser context — no reload needed, subsequent fetches carry it.
 */
export async function loginViaSiwe(page: Page): Promise<string> {
  const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  );
  if (account.address.toLowerCase() !== address.toLowerCase()) {
    throw new Error("Anvil dev key does not match the stubbed address");
  }
  const nonceResponse = await page.request.post("/api/auth/nonce", {
    data: { address, chainId: 31337 },
  });
  if (!nonceResponse.ok()) {
    throw new Error(`nonce failed with status ${nonceResponse.status()}`);
  }
  const { message } = (await nonceResponse.json()) as { message: string };
  const signature = await account.signMessage({ message });
  const verifyResponse = await page.request.post("/api/auth/verify", {
    data: { message, signature },
  });
  if (!verifyResponse.ok()) {
    throw new Error(`verify failed with status ${verifyResponse.status()}`);
  }
  return address;
}
