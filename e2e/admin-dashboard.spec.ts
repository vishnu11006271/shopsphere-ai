import { expect, test } from "@playwright/test";

const transparentImage = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
const product = {
  id: 1, title: "Test Headphones", description: "A comfortable pair of wireless headphones.",
  category: "mens-shirts", price: 50, discountPercentage: 10, rating: 4.5, stock: 10,
  brand: "ShopSphere", thumbnail: transparentImage,
  images: [transparentImage], tags: ["audio"], reviews: [],
};

test("administrator can create a product in the local catalogue", async ({ page }) => {
  await page.addInitScript(() => {
    const user = { id: "test-admin", name: "Test Administrator", email: "admin@example.test", role: "ADMIN", passwordSalt: "", passwordHash: "", createdAt: "2026-01-01T00:00:00.000Z" };
    localStorage.setItem("shopsphere-auth", JSON.stringify({
      state: { users: [user], session: { token: "test-admin-session", userId: user.id, expiresAt: Date.now() + 86400000 } }, version: 0,
    }));
    localStorage.setItem("shopsphere-admin-catalog", JSON.stringify({ state: { products: [], deletedProductIds: [], categories: [], deletedCategorySlugs: [] }, version: 0 }));
    localStorage.setItem("shopsphere-checkout-orders", JSON.stringify({ state: { draft: {}, orders: [] }, version: 0 }));
  });
  await page.route("https://dummyjson.com/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/products/categories") return route.fulfill({ json: [{ slug: "mens-shirts", name: "Mens Shirts", url: "" }] });
    if (url.pathname === "/products" || url.pathname === "/products/search" || url.pathname.startsWith("/products/category/")) return route.fulfill({ json: { products: [product], total: 1, skip: 0, limit: 1 } });
    return route.continue();
  });
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Operations dashboard" })).toBeVisible();
  await expect(page.getByText("Local simulation:")).toBeVisible();
  await page.getByRole("tab", { name: "Products" }).click();
  await expect(page.getByRole("heading", { name: "Catalogue management" })).toBeVisible();
  await page.getByRole("button", { name: "Add product", exact: true }).click();
  await page.getByLabel("Product title").fill("Locally Added Smart Watch");
  await page.getByLabel("Brand").fill("ShopSphere");
  await page.locator("form").filter({ hasText: "Add product" }).getByRole("combobox").selectOption("mens-shirts");
  await page.getByLabel("Catalogue price (source units)").fill("75");
  await page.getByLabel("Inventory quantity").fill("8");
  await page.getByRole("button", { name: "Save locally" }).click();
  await expect(page.getByText("Locally Added Smart Watch", { exact: true })).toBeVisible();
  await expect(page.getByText("Product saved to the local catalogue.")).toBeVisible();
});

test("administrator can inspect local recommendation analytics", async ({ page }) => {
  await page.addInitScript(() => {
    const user = { id: "test-admin", name: "Test Administrator", email: "admin@example.test", role: "ADMIN", passwordSalt: "", passwordHash: "", createdAt: "2026-01-01T00:00:00.000Z" };
    localStorage.setItem("shopsphere-auth", JSON.stringify({
      state: { users: [user], session: { token: "test-admin-session", userId: user.id, expiresAt: Date.now() + 86400000 } }, version: 0,
    }));
    localStorage.setItem("shopsphere-admin-catalog", JSON.stringify({ state: { products: [], deletedProductIds: [], categories: [], deletedCategorySlugs: [] }, version: 0 }));
    localStorage.setItem("shopsphere-recommendation-analytics", JSON.stringify({ state: { impressions: { "trending:1": 10 }, clicks: { "trending:1": 4 }, addToCartFromRecommendation: { "trending:1": 2 } }, version: 0 }));
  });
  await page.route("https://dummyjson.com/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/products/categories") return route.fulfill({ json: [{ slug: "mens-shirts", name: "Mens Shirts", url: "" }] });
    if (url.pathname === "/products") return route.fulfill({ json: { products: [product], total: 1, skip: 0, limit: 1 } });
    return route.continue();
  });
  await page.goto("/admin");
  await page.getByRole("tab", { name: "Recommendation analytics" }).click();
  await expect(page.getByRole("heading", { name: "Recommendation analytics" })).toBeVisible();
  await expect(page.getByText("Local Analytics")).toBeVisible();
  await expect(page.getByText("50.0%")).toBeVisible();
});
