import { expect, test } from "@playwright/test";

test("guest is redirected from a protected route to the login screen", async ({ page }) => {
  await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);
  await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
});

for (const credentials of [
  { role: "customer", email: "customer@shopsphere.demo", password: "Customer@123" },
  { role: "administrator", email: "admin@shopsphere.demo", password: "Admin@123" },
]) {
  test(`${credentials.role} can sign out and return to login`, async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/account$/);
    await page.getByRole("button", { name: /sign out/i }).click();

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();

    const persistedAuth = await page.evaluate(() => {
      const value = localStorage.getItem("shopsphere-auth");
      return value ? JSON.parse(value) as { state?: { session?: unknown } } : null;
    });
    expect(persistedAuth?.state?.session).toBeNull();
  });
}
