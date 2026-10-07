import { expect, test } from "@playwright/test";
import { carbonArgumentId, stubWallet } from "./helpers";

/**
 * Wallet gating of the dossier "Create new report" button. A stubbed
 * EIP-1193 provider stands in for a real wallet (unavailable in CI):
 * connection succeeds, so the button enables, while SIWE stays
 * unauthenticated (dummy signature). Requires MongoDB + seed data
 * (`npm run db:setup`).
 */
test("create button is disabled without a wallet", async ({
  page,
  request,
}) => {
  await page.goto(`/debate/argument/${await carbonArgumentId(request)}`);

  const create = page.getByRole("button", { name: "Create new report" });
  await expect(create).toBeVisible();
  await expect(create).toBeDisabled();
  await expect(create).toHaveAttribute(
    "title",
    "Connect your wallet to create a report",
  );
});

test("connecting the wallet enables the create button", async ({
  page,
  request,
}) => {
  await stubWallet(page);
  await page.goto(`/debate/argument/${await carbonArgumentId(request)}`);

  const create = page.getByRole("button", { name: "Create new report" });
  await expect(create).toBeDisabled();

  await page.getByRole("button", { name: "Connect wallet" }).click();

  await expect(create).toBeEnabled();
  await expect(create).toHaveAttribute("title", "Create a new report");
});
