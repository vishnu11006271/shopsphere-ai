import { expect, test } from "@playwright/test";

test("the first keyboard stop is the skip-to-content link", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("unknown routes expose a clear not-found recovery action", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(
    page.getByRole("heading", { name: "We couldn't find that page" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to ShopSphere" })).toHaveAttribute(
    "href",
    "/",
  );
});
