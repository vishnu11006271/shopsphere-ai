import { expect, test } from "@playwright/test";

test("product can be added to cart and quantity controls update", async ({ page }) => {
  await page.goto("/products/1");
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Your cart", exact: true })).toBeVisible();
  await expect(page.getByText("Subtotal")).toBeVisible();
  await expect(page.getByRole("button", { name: /Increase/ })).toBeVisible();
  await page.getByRole("button", { name: /Increase/ }).click();
  await expect(page.locator('[aria-label="Quantity"]')).toHaveText("2");
});

test("wishlist preserves saved products and can move an in-stock product to cart", async ({ page }) => {
  await page.goto("/products");
  const saveButton = page.getByRole("button", { name: /Add .* to wishlist/ }).first();
  await saveButton.click();
  await page.goto("/wishlist");
  await expect(page.getByRole("heading", { name: "Your wishlist", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Move to cart" }).first()).toBeEnabled();
  await page.getByRole("button", { name: "Move to cart" }).first().click();
  await expect(page.getByText("0 saved products")).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
});
