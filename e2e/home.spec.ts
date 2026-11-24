import { test, expect } from "@playwright/test";

test("first-time homepage shows featured and trending, not empty personalized rails", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /good finds/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Featured Products" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trending Products" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recently Viewed" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Recommended For You" })).toHaveCount(0);
});

test("recommendation cards navigate to product detail", async ({ page }) => {
  await page.goto("/");
  const firstRecommendation=page.locator('section[aria-label="Trending Products"] a[href^="/products/"]').first();
  await expect(firstRecommendation).toBeVisible();
  await firstRecommendation.click();
  await expect(page).toHaveURL(/\/products\/\d+$/);
});

test("returning visitor sees recently viewed and personalized recommendations", async ({ page }) => {
  await page.goto("/products/1");
  await expect(page.getByRole("heading", { name: /customer reviews/i })).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>Boolean(localStorage.getItem("shopsphere-recently-viewed")))).toBe(true);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Recently Viewed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended For You" })).toBeVisible();
});
