import { test, expect } from "@playwright/test";

test("customer can inspect and control recommendation preferences", async ({ page }) => {
  await page.goto("/products/1");
  await expect(page.getByRole("heading", { name: /customer reviews/i })).toBeVisible();
  await page.goto("/login");
  await page.getByLabel("Email address").fill("customer@shopsphere.demo");
  await page.getByLabel("Password").fill("Customer@123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.goto("/account#recommendation-preferences");
  await expect(page.getByRole("heading", { name: "Recommendation Preferences" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recently viewed history" })).toBeVisible();
  await expect(page.locator("#recommendation-preferences a[href="/products/1"]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended For You" })).toBeVisible();
  const ratingSignal=page.getByLabel("Use Product ratings");
  await expect(ratingSignal).toBeChecked();
  await ratingSignal.uncheck();
  await expect(ratingSignal).not.toBeChecked();
  await page.getByRole("button", { name: "Reset personalization" }).click();
  await expect(ratingSignal).toBeChecked();
});
