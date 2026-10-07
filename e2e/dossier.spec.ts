import { expect, test } from "@playwright/test";
import { gotoDossier } from "./helpers";

const CLIMATE_TITLE = "Climate sensitivity is a range, not a number";

test("paragraph click narrows the audit tabs", async ({ page, request }) => {
  await gotoDossier(page, request);
  const card = page
    .locator("details", { hasText: CLIMATE_TITLE })
    .first();
  await expect(card).toBeVisible();

  // Expand the article, then select its first paragraph.
  await card.locator("summary span").first().click();
  const paragraph = page
    .getByRole("button", { name: /Equilibrium climate sensitivity/ })
    .first();
  await paragraph.click();

  await expect(paragraph).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("radio", { name: "Evidences (1)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: /Contraargument/ }),
  ).toHaveCount(0);
});

test("label filter narrows the articles", async ({ page, request }) => {
  await gotoDossier(page, request);
  await expect(
    page.getByText(CLIMATE_TITLE).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Policy", exact: true }).click();

  await expect(page).toHaveURL(/labels=Policy/);
  await expect(
    page.getByText("Border adjustments live or die on calibration").first(),
  ).toBeVisible();
  await expect(page.getByText(CLIMATE_TITLE)).toHaveCount(0);
});

test("date sort reorders the articles", async ({ page, request }) => {
  await gotoDossier(page, request);
  await expect(
    page.getByText(CLIMATE_TITLE).first(),
  ).toBeVisible();
  await expect(page.locator("details").first()).toContainText(
    "Climate sensitivity",
  );

  await page.getByLabel("Date").selectOption("oldest");

  await expect(page).toHaveURL(/sort=oldest/);
  await expect(page.locator("details").first()).toContainText(
    "What the IPCC Sixth Assessment Report found",
  );
});

test("opening an article increases its view count", async ({
  page,
  request,
}) => {
  await gotoDossier(page, request);
  // A different article than the paragraph-click test uses, so the two
  // tests never race on the same view counter under parallel workers.
  const card = page
    .locator("details", {
      hasText: "What the IPCC Sixth Assessment Report found",
    })
    .first();
  await expect(card).toBeVisible();

  const badge = card.getByLabel(/^\d+ opens$/);
  const before = parseInt((await badge.textContent()) ?? "0", 10);

  await card.locator("summary span").first().click();

  await expect(card.getByLabel(`${before + 1} opens`)).toBeVisible();
});

test("opening an audit item increases its view count", async ({
  page,
  request,
}) => {
  await gotoDossier(page, request);
  const card = page
    .locator("details", { hasText: "Relocation: production moves" })
    .first();
  await expect(card).toBeVisible();

  const badge = card.getByLabel(/^\d+ opens$/);
  const before = parseInt((await badge.textContent()) ?? "0", 10);

  await card.locator("summary span").first().click();

  await expect(card.getByLabel(`${before + 1} opens`)).toBeVisible();
});

test("author byline opens their provenance", async ({ page, request }) => {
  await gotoDossier(page, request);
  const byline = page.getByRole("link", { name: "By L. Brandt" }).first();
  await expect(byline).toBeVisible();

  await byline.click();

  await expect(page).toHaveURL(
    "/debate/provenance?address=0x1111111111111111111111111111111111111111",
  );
});
