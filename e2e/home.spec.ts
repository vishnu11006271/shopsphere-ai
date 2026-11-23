import { test, expect } from "@playwright/test";
test("home page renders the ShopSphere storefront", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /good finds/i })).toBeVisible();
  await expect(page.getByText("Popular right now")).toBeVisible();
});
