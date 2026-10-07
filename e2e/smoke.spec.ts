import { expect, test } from "@playwright/test";

/**
 * Landing smoke test: the hot-topics home renders and the arguments API
 * backing it answers. Requires MongoDB + seed data (`npm run db:setup`).
 */
test("landing shows hot topics", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Hot topics" }),
  ).toBeVisible();
});

test("arguments API lists seeded arguments", async ({ request }) => {
  const response = await request.get("/api/arguments");
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as {
    arguments: { id: string; title: string }[];
    total: number;
  };
  expect(body.total).toBeGreaterThan(0);
  expect(body.arguments[0]?.id).toBeTruthy();
});

test("topics list shows name, description, tags and date", async ({
  page,
}) => {
  await page.goto("/");

  const card = page.locator("a.card").first();
  await expect(card).toBeVisible();
  await expect(card.locator("h2")).not.toBeEmpty();
  await expect(card.locator("p").first()).not.toBeEmpty();
  await expect(card.locator("span.badge").first()).toBeVisible();
  const time = card.locator("time");
  await expect(time).toHaveAttribute("datetime", /.+/);
  await expect(time).not.toBeEmpty();
});

test("label filter narrows the shown topics", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("a.card").first()).toBeVisible();
  const before = await page.locator("a.card").count();

  // "Bitcoin" only labels the Bitcoin argument in the seed data.
  await page.getByRole("button", { name: "Bitcoin", exact: true }).click();

  await expect(page).toHaveURL(/labels=Bitcoin/);
  await expect(page.locator("a.card")).toHaveCount(1);
  await expect(page.locator("a.card").first()).toContainText(
    "Bitcoin, audited",
  );
  expect(await page.locator("a.card").count()).toBeLessThan(before);
});

test("date sort syncs to the URL and keeps the topics", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("a.card").first()).toBeVisible();

  await page.getByLabel("Date").selectOption("oldest");

  await expect(page).toHaveURL(/sort=oldest/);
  await expect(page.locator("a.card").first()).toBeVisible();
});

test("clicking a topic opens its dossier", async ({ page }) => {
  await page.goto("/");
  const card = page.locator("a.card").first();
  await expect(card).toBeVisible();
  const title = await card.getAttribute("title");

  await card.click();

  await expect(page).toHaveURL(/\/debate\/argument\/.+/);
  await expect(
    page.getByRole("heading", { name: title ?? "" }),
  ).toBeVisible();
});
