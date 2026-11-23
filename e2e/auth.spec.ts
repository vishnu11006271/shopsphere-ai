import { expect, test } from "@playwright/test";

test("guest is redirected from a protected route to the login screen", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
  await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
});
