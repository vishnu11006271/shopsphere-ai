import { expect, test } from "@playwright/test";

const transparentImage = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
const product = {
  id: 1, title: "Test Headphones", description: "A comfortable pair of wireless headphones for everyday listening.",
  category: "mens-shirts", price: 50, discountPercentage: 10, rating: 4.5, stock: 10,
  brand: "ShopSphere", thumbnail: transparentImage, images: [transparentImage], tags: ["audio"],
  reviews: [],
};

async function seedCustomer(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const user = { id: "review-customer", name: "Review Customer", email: "reviewer@example.test", role: "CUSTOMER", passwordSalt: "", passwordHash: "", createdAt: "2026-01-01T00:00:00.000Z" };
    localStorage.setItem("shopsphere-auth", JSON.stringify({
      state: { users: [user], session: { token: "test-session", userId: user.id, expiresAt: Date.now() + 86400000 } }, version: 0,
    }));
    localStorage.setItem("shopsphere-product-reviews", JSON.stringify({ state: { reviews: [] }, version: 0 }));
    localStorage.setItem("shopsphere-checkout-orders", JSON.stringify({
      state: { draft: {}, orders: [{ id: "TEST-ORDER", customer: { name: user.name, email: user.email }, items: [{ productId: 1, title: "Test Headphones", quantity: 1 }] }] }, version: 0,
    }));
  });
}

async function mockCatalogue(page: import("@playwright/test").Page) {
  await page.route("https://dummyjson.com/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/products/categories") return route.fulfill({ json: [{ slug: "mens-shirts", name: "Mens Shirts", url: "" }] });
    if (url.pathname === "/products/1") return route.fulfill({ json: product });
    if (url.pathname === "/products" || url.pathname === "/products/search" || url.pathname.startsWith("/products/category/")) return route.fulfill({ json: { products: [product], total: 1, skip: 0, limit: 1 } });
    return route.continue();
  });
}

test("customer submits a review with a verified-purchase indicator from local order history", async ({ page }) => {
  await seedCustomer(page);
  await mockCatalogue(page);
  await page.goto("/products/1");
  await expect(page.getByRole("heading", { name: "Customer reviews" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit review" })).toBeEnabled();
  await page.getByLabel("Review title").fill("Comfortable for daily use");
  await page.getByLabel("Your review").fill("The headphones are comfortable and the sound quality is clear for everyday listening.");
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByRole("heading", { name: "Comfortable for daily use" })).toBeVisible();
  await expect(page.getByText("Verified purchase")).toBeVisible();
});

test("review form enforces the minimum written-review length", async ({ page }) => {
  await seedCustomer(page);
  await mockCatalogue(page);
  await page.goto("/products/1");
  await page.getByLabel("Review title").fill("Short review");
  await page.getByLabel("Your review").fill("Too short");
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText("No reviews yet")).toBeVisible();
});
