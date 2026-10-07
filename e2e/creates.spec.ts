import { expect, test, type Page } from "@playwright/test";
import { gotoDossier, loginViaSiwe, stubWallet } from "./helpers";

/**
 * End-to-end creation for reports and audit items, verified where each
 * item surfaces: reports under the first argument's dossier, audit items
 * under their audit tab. Wallet connect uses a stubbed provider; the JWT
 * session is a real SIWE login with the local Anvil dev key (creators
 * return 401 without it). Titles carry a timestamp so repeat runs never
 * collide. Requires MongoDB + IPFS + seed data (`docker compose up -d`,
 * `npm run db:setup`).
 */
async function connectAndLogin(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Connect wallet" }).click();
  await loginViaSiwe(page);
}

async function fillMarkdown(page: Page, text: string): Promise<void> {
  await page.locator("textarea.w-md-editor-text-input").fill(text);
}

test("creates a debate report shown on the dossier", async ({
  page,
  request,
}) => {
  const title = `E2E Report ${Date.now()}`;
  await stubWallet(page);
  await page.goto("/debate/create");
  await connectAndLogin(page);

  await page.getByPlaceholder("Report title").fill(title);
  await page
    .getByPlaceholder("Section labels (e.g. Clima, Policy)")
    .fill("Clima");
  await fillMarkdown(page, "E2E report body.\n\nSecond paragraph.");
  await page.getByRole("button", { name: "Save report" }).click();

  await expect(page.getByText("Report signed and stored")).toBeVisible();

  // Reports attach to the first argument: the Carbon dossier shows it.
  await gotoDossier(page, request);
  await expect(page.getByText(title).first()).toBeVisible();
});

const audits = [
  {
    kind: "contraargument",
    path: "/debate/contraarguments/create",
    titlePlaceholder: "Contraargument title",
    saveButton: "Save contraargument",
    panelText: "Contraargument signed and stored",
    tabLabel: /^Contraargument/,
  },
  {
    kind: "evidence",
    path: "/debate/evidences/create",
    titlePlaceholder: "Evidence title",
    saveButton: "Save evidence",
    panelText: "Evidence signed and stored",
    tabLabel: /^Evidences/,
  },
  {
    kind: "fallacy",
    path: "/debate/fallacies/create",
    titlePlaceholder: "Fallacy title",
    saveButton: "Save fallacy",
    panelText: "Fallacy signed and stored",
    tabLabel: /^Fallacies/,
  },
  {
    kind: "source",
    path: "/debate/sources/create",
    titlePlaceholder: "Source title",
    saveButton: "Save source",
    panelText: "Source signed and stored",
    tabLabel: /^Sources/,
  },
] as const;

for (const audit of audits) {
  test(`creates ${audit.kind} shown under its audit tab`, async ({
    page,
    request,
  }) => {
    const title = `E2E ${audit.kind} ${Date.now()}`;
    await stubWallet(page);
    await page.goto(audit.path);
    await connectAndLogin(page);

    await page.getByPlaceholder(audit.titlePlaceholder).fill(title);
    await fillMarkdown(page, `E2E body for ${title}.\n\nSecond paragraph.`);
    await page.getByPlaceholder("Author name").fill("E2E Suite");
    await page.locator('input[type="date"]').fill("2026-10-07");
    await page.getByRole("button", { name: audit.saveButton }).click();

    await expect(page.getByText(audit.panelText)).toBeVisible();

    // Audit items are global: every dossier lists them under their tab.
    await gotoDossier(page, request);
    await page.getByRole("radio", { name: audit.tabLabel }).click();
    await expect(page.getByText(title).first()).toBeVisible();
  });
}
