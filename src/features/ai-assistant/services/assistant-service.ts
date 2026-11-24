import { recommendationService } from "@/features/recommendations/services/recommendation-service";
import type { RecommendationContext } from "@/features/recommendations/types";
import type { Product, ProductCategory } from "@/types/product";
import type { AssistantConversationContext, AssistantIntent, AssistantResponse } from "../types";
import { extractShoppingIntent } from "./intent-parser";

const CLARIFYING_PROMPTS = [
  "Show me smartphones under ₹30,000",
  "Find headphones with good ratings",
  "Show me laptops under ₹60,000",
];

function matchesColor(product: Product, color: string): boolean {
  const needle = color.toLowerCase();
  const text = [product.title, product.description, product.brand ?? "", ...(product.tags ?? [])].join(" ").toLowerCase();
  const variantMatch = product.variants?.some((variant) =>
    (variant.name.toLowerCase().includes("color") || variant.value.toLowerCase().includes(needle)) &&
    variant.value.toLowerCase().includes(needle),
  );
  return Boolean(variantMatch || text.includes(needle));
}

function describeIntent(intent: AssistantIntent): string {
  const parts: string[] = [];
  if (intent.categoryLabel) parts.push("category: " + intent.categoryLabel);
  if (intent.maxPrice !== undefined) parts.push("up to ₹" + intent.maxPrice.toLocaleString("en-IN"));
  if (intent.minPrice !== undefined) parts.push("from ₹" + intent.minPrice.toLocaleString("en-IN"));
  if (intent.minRating !== undefined) parts.push(intent.minRating.toFixed(1) + "+ stars");
  if (intent.attribute) parts.push(intent.attribute.value + " colour");
  return parts.length ? "Filters applied — " + parts.join(" · ") + "." : "Showing products from the catalogue.";
}

export function filterProducts(products: Product[], intent: AssistantIntent): Product[] {
  return products.filter((product) => {
    if (intent.categorySlugs.length && !intent.categorySlugs.includes(product.category)) return false;
    const displayedPrice = product.price * 85;
    if (intent.maxPrice !== undefined && displayedPrice > intent.maxPrice) return false;
    if (intent.minPrice !== undefined && displayedPrice < intent.minPrice) return false;
    if (intent.minRating !== undefined && product.rating < intent.minRating) return false;
    if (intent.attribute && !matchesColor(product, intent.attribute.value)) return false;
    return product.stock > 0;
  }).sort((a, b) => {
    if (intent.sort === "price-asc") return a.price - b.price || b.rating - a.rating;
    if (intent.sort === "price-desc") return b.price - a.price || b.rating - a.rating;
    return b.rating - a.rating || a.price - b.price;
  }).slice(0, 6);
}

const defaultSignals: RecommendationContext["enabledSignals"] = {
  recentlyViewed: true, searchHistory: true, categoryInterest: true, tagInterest: true,
  priceRange: true, ratingPreference: true, wishlist: true, cart: true, purchases: true, brandPreference: true,
};

export function respondToShoppingRequest(
  message: string,
  products: Product[],
  categories: ProductCategory[],
  context: AssistantConversationContext = {},
): AssistantResponse {
  const parsed = extractShoppingIntent(message, categories, context);
  if (parsed.kind === "unclear") {
    return {
      text: "I can help narrow down the catalogue, but I’m not sure what you’re looking for yet. Try a category, a budget, or a rating preference.",
      products: [],
      suggestions: CLARIFYING_PROMPTS,
    };
  }

  if (parsed.kind === "similar" && parsed.targetProduct) {
    const recommendationContext: RecommendationContext = {
      recentlyViewed: [parsed.targetProduct], searchQueries: [], wishlistIds: [], wishlistSnapshots: [],
      cart: [], purchaseIds: [], enabledSignals: defaultSignals,
    };
    const similar = recommendationService.getSimilar({
      products, context: recommendationContext, currentProduct: parsed.targetProduct, limit: 6,
    }).map((item) => item.product);
    return {
      text: similar.length
        ? "Here are products similar to " + parsed.targetProduct.title + ", ranked by category, shared tags, and price similarity."
        : "I couldn’t find a strong match for " + parsed.targetProduct.title + " in the current catalogue. Try another product from the results.",
      products: similar,
      suggestions: similar.length ? ["Show me something cheaper", "Something with better ratings"] : CLARIFYING_PROMPTS,
    };
  }

  const intent = parsed.intent;
  if (!intent) return { text: "Could you tell me which category or budget you have in mind?", products: [], suggestions: CLARIFYING_PROMPTS };
  const matches = filterProducts(products, intent);
  if (!matches.length) {
    const attributeNote = intent.attribute
      ? " This catalogue does not provide colour variants for every product, so I won’t guess which items come in that colour."
      : "";
    return {
      text: "I couldn’t find in-stock products matching all those filters." + attributeNote + " You can relax the budget or rating filter and I’ll try again.",
      products: [], intent, suggestions: ["Increase my budget", "Show me smartphones instead", "Show me laptops instead"],
    };
  }
  return {
    text: describeIntent(intent) + " I found " + matches.length + (matches.length === 1 ? " matching product." : " matching products."),
    products: matches, intent,
    suggestions: ["Show me something cheaper", "Something with better ratings", "Show me more like the second one"],
  };
}
