import { expect, test } from "@playwright/test";

test("product detail shows catalogue information and stock-aware actions", async ({ page }) => {
  await page.goto("/products/1");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Delivery estimate")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to Cart", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Description" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Specifications" })).toBeVisible();
});

test("delivery estimator validates pincode and returns a simulated estimate", async ({ page }) => {
  await page.goto("/products/1");
  await page.getByLabel("Delivery pincode").fill("560001");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Simulated estimate" })).toBeVisible();
});
