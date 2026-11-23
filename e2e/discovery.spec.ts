import { expect, test } from "@playwright/test";

test("product discovery route renders catalogue and filter controls", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Explore all products" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Sort products" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Product filters" })).toBeVisible();
});

test("search submits a query to a shareable results URL", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("textbox", { name: "Search products" }).fill("phone");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?q=phone/);
  await expect(page.getByRole("heading", { name: "Results for “phone”" })).toBeVisible();
});
