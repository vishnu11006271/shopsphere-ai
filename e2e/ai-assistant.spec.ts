import { expect, test } from "@playwright/test";

const products = [
  { id: 1, title: "Wireless Headphones", description: "Over-ear audio headphones", category: "mobile-accessories", price: 20, discountPercentage: 0, rating: 4.2, stock: 8, thumbnail: "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg", images: [], tags: ["audio"] },
  { id: 2, title: "Premium Bluetooth Earbuds", description: "Wireless audio earbuds", category: "mobile-accessories", price: 30, discountPercentage: 0, rating: 4.8, stock: 5, thumbnail: "https://cdn.dummyjson.com/product-images/2/thumbnail.jpg", images: [], tags: ["audio"] },
  { id: 3, title: "Smartphone", description: "Android phone", category: "smartphones", price: 200, discountPercentage: 0, rating: 4.9, stock: 4, thumbnail: "https://cdn.dummyjson.com/product-images/3/thumbnail.jpg", images: [], tags: ["mobile"] },
];

test.beforeEach(async ({ page }) => {
  await page.route("**/products?limit=0", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ products, total: products.length, skip: 0, limit: products.length }),
  }));
});

test("opens the assistant and returns inline products for a structured request", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ask ShopSphere" }).click();
  await page.getByRole("button", { name: "Show me headphones under ₹5,000" }).click();
  await expect(page.getByText("Filters applied — category: headphones · up to ₹5,000.", { exact: false })).toBeVisible();
  await expect(page.getByText("Premium Bluetooth Earbuds")).toBeVisible();
  await expect(page.getByText("Wireless Headphones")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to cart" }).first()).toBeVisible();
});

test("keeps category and budget when refining to better ratings", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ask ShopSphere" }).click();
  await page.getByRole("button", { name: "Show me headphones under ₹5,000" }).click();
  await page.getByRole("button", { name: "Something with better ratings" }).click();
  await expect(page.getByText("4.5+ stars")).toBeVisible();
  await expect(page.getByText("Premium Bluetooth Earbuds")).toBeVisible();
  await expect(page.getByText("Wireless Headphones")).toHaveCount(0);
});

test("asks for clarification rather than showing unrelated products", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ask ShopSphere" }).click();
  const input = page.getByRole("textbox", { name: "Describe what you want to shop for" });
  await input.fill("hmm not sure");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("I can help narrow down the catalogue", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Find headphones with good ratings" })).toBeVisible();
});
