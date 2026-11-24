import { test, expect } from "@playwright/test";

test("customer can inspect and control recommendation preferences", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("customer@shopsphere.demo");
  await page.getByLabel("Password").fill("Customer@123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/account#recommendation-preferences");
  await expect(page.getByRole("heading", { name: "Recommendation Preferences" })).toBeVisible();
  const ratingSignal=page.getByLabel("Use Product ratings");
  await expect(ratingSignal).toBeChecked();
  await ratingSignal.uncheck();
  await expect(ratingSignal).not.toBeChecked();
  await page.getByRole("button", { name: "Reset personalization" }).click();
  await expect(ratingSignal).toBeChecked();
});
