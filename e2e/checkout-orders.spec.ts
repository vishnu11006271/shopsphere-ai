import { expect, test } from "@playwright/test";

test("customer can resume checkout after refresh, place a mock order, and track it", async ({ page }) => {
  await page.goto("/products/1");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await page.goto("/cart");
  await page.getByRole("button", { name: /Continue to checkout/ }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fcheckout/);

  await page.getByLabel("Email address").fill("customer@shopsphere.demo");
  await page.getByLabel("Password").fill("Customer@123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await expect(page.getByRole("heading", { name: "Customer information" })).toBeVisible();
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByRole("button", { name: /Continue/ }).click();

  await expect(page.getByRole("heading", { name: "Shipping address" })).toBeVisible();
  await page.getByLabel("Street address").fill("12 MG Road, Indiranagar");
  await page.getByLabel("City").fill("Bengaluru");
  await page.getByLabel("State").fill("Karnataka");
  await page.getByLabel("PIN code").fill("560038");
  await page.evaluate(() => {
    const raw = localStorage.getItem("shopsphere-auth");
    if (!raw) throw new Error("Expected a persisted demo session.");
    const persisted = JSON.parse(raw);
    persisted.state.session.expiresAt = Date.now() - 1;
    localStorage.setItem("shopsphere-auth", JSON.stringify(persisted));
  });
  await page.reload();
  await expect(page).toHaveURL("http://127.0.0.1:3000/login?next=%2Fcheckout");
  await page.getByLabel("Email address").fill("customer@shopsphere.demo");
  await page.getByLabel("Password").fill("Customer@123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/checkout");
  await expect(page.getByLabel("Street address")).toHaveValue("12 MG Road, Indiranagar");
  await page.getByRole("button", { name: /Continue/ }).click();

  await expect(page.getByRole("heading", { name: "Delivery method" })).toBeVisible();
  await page.getByLabel(/Express delivery/).check();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByRole("heading", { name: "Order summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Because of Your Cart" })).toBeVisible();
  await page.getByRole("button", { name: /Continue/ }).click();

  await expect(page.getByRole("heading", { name: "Mock payment" })).toBeVisible();
  await page.getByRole("button", { name: "Simulate decline" }).click();
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.getByText("The mock payment was declined")).toBeVisible();
  await page.getByRole("button", { name: "Simulate success" }).click();
  await page.getByRole("button", { name: /^Pay / }).click();

  await expect(page.getByRole("heading", { name: /Thank you/ })).toBeVisible();
  await expect(page.getByText(/^SS-/)).toBeVisible();
  await page.getByRole("link", { name: /Track your order/ }).click();
  await expect(page.getByRole("heading", { name: "Delivery progress" })).toBeVisible();
  await page.getByRole("button", { name: "Advance to Packed" }).click();
  await expect(page.locator("ol").getByText("Packed", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /All orders/ }).click();
  await expect(page.getByRole("heading", { name: "Your orders" })).toBeVisible();

  await page.goto("/products/1");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await page.goto("/cart");
  await page.getByRole("button", { name: /Continue to checkout/ }).click();
  await expect(page.getByRole("heading", { name: "Customer information" })).toBeVisible();
});
