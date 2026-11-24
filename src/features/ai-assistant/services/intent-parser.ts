import type { ProductCategory } from "@/types/product";
import type { AssistantConversationContext, AssistantIntent, IntentParseResult } from "../types";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const CATEGORY_ALIASES: Record<string, string[]> = {
  headphones: ["mobile-accessories"], headphone: ["mobile-accessories"],
  earbuds: ["mobile-accessories"], earphones: ["mobile-accessories"],
  phones: ["smartphones"], phone: ["smartphones"], mobiles: ["smartphones"],
  laptop: ["laptops"], shoes: ["mens-shoes", "womens-shoes"],
  sneakers: ["mens-shoes", "womens-shoes"], sneaker: ["mens-shoes", "womens-shoes"],
  watches: ["mens-watches"], watch: ["mens-watches"],
  glasses: ["sunglasses"], eyewear: ["sunglasses"], "skin care": ["skincare"],
};

const COLORS = ["black", "white", "blue", "red", "green", "pink", "purple", "yellow", "brown", "grey", "gray", "orange"];

function extractCategory(message: string, categories: ProductCategory[]) {
  const normalizedMessage = normalize(message);
  const ordered = [...categories].sort((a, b) => Math.max(b.slug.length, b.name.length) - Math.max(a.slug.length, a.name.length));
  for (const category of ordered) {
    const slug = normalize(category.slug);
    const name = normalize(category.name);
    if ((slug.length > 2 && normalizedMessage.includes(slug)) || (name.length > 2 && normalizedMessage.includes(name))) {
      return { slugs: [category.slug], label: category.name };
    }
  }
  for (const [alias, slugs] of Object.entries(CATEGORY_ALIASES)) {
    if (!normalizedMessage.includes(normalize(alias))) continue;
    const matched = slugs.filter((slug) => categories.some((category) => category.slug === slug));
    if (matched.length) return { slugs: matched, label: alias };
  }
  return undefined;
}

function extractAmount(message: string, direction: "max" | "min"): number | undefined {
  const pattern = direction === "max"
    ? /(?:under|below|less than|up to|maximum(?: of)?|within|budget(?: of)?)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k)?/i
    : /(?:over|above|more than|at least|minimum(?: of)?)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k)?/i;
  const match = message.match(pattern);
  if (!match) return undefined;
  const value = Number(match[1].replace(/,/g, "")) * (match[2] ? 1000 : 1);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function extractRating(message: string): number | undefined {
  const explicit = message.match(/(?:at least|minimum|rating(?: of)?|rated|stars?)\s*(\d(?:\.\d)?)(?:\s*\+)?/i)
    ?? message.match(/(\d(?:\.\d)?)\s*(?:\+|stars?|rating)/i);
  if (explicit) {
    const value = Number(explicit[1]);
    if (value >= 1 && value <= 5) return value;
  }
  if (/\b(good|great|high|better|top|best)\s+(?:product\s+)?ratings?\b|\bwell[- ]rated\b|\bhighly rated\b/i.test(message)) return 4;
  return undefined;
}

function extractColor(message: string): string | undefined {
  if (!/\b(only|just|available|in)\b/i.test(message)) return undefined;
  const normalized = normalize(message);
  return COLORS.find((color) => normalized.includes(color));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function ordinalIndex(message: string): number {
  if (/\b(second|2nd|two)\b/i.test(message)) return 1;
  if (/\b(third|3rd|three)\b/i.test(message)) return 2;
  if (/\b(fourth|4th|four)\b/i.test(message)) return 3;
  if (/\b(first|1st|one)\b/i.test(message)) return 0;
  return 1;
}

export function extractShoppingIntent(
  message: string,
  categories: ProductCategory[],
  context: AssistantConversationContext = {},
): IntentParseResult {
  const text = message.trim();
  const previous = context.previousIntent;
  const previousResults = context.previousResults ?? [];
  if (!text) return { kind: "unclear", explanation: "There is no shopping request to interpret." };

  if (/\b(like|similar to|more like)\b/i.test(text) && /\b(first|second|third|fourth|one|1st|2nd|3rd|4th)\b/i.test(text)) {
    const targetProduct = previousResults[ordinalIndex(text)];
    if (targetProduct) return { kind: "similar", targetProduct, explanation: "Find products similar to " + targetProduct.title + "." };
    return { kind: "unclear", explanation: "There is no earlier product result to use as a similarity reference." };
  }

  const category = extractCategory(text, categories);
  const explicitMax = extractAmount(text, "max");
  const explicitMin = extractAmount(text, "min");
  const explicitRating = extractRating(text);
  const color = extractColor(text);
  const cheaper = /\b(cheaper|less expensive|lower priced|lower price)\b/i.test(text);
  const moreExpensive = /\b(more expensive|costlier|higher priced|higher price)\b/i.test(text);
  const betterRated = /\b(better rated|better ratings|higher rated|higher rating)\b/i.test(text);

  if (category) {
    const changedTopic = Boolean(previous?.categorySlugs.length && !category.slugs.some((slug) => previous.categorySlugs.includes(slug)));
    const intent: AssistantIntent = {
      categorySlugs: category.slugs,
      categoryLabel: category.label,
      ...(explicitMax !== undefined ? { maxPrice: explicitMax } : changedTopic && previous?.maxPrice !== undefined ? { maxPrice: previous.maxPrice } : {}),
      ...(explicitMin !== undefined ? { minPrice: explicitMin } : {}),
      ...(explicitRating !== undefined ? { minRating: explicitRating } : changedTopic && previous?.minRating !== undefined ? { minRating: previous.minRating } : {}),
      ...(color ? { attribute: { type: "color", value: color } } : {}),
      ...(explicitRating !== undefined ? { sort: "rating" as const } : {}),
    };
    return { kind: previous && !changedTopic ? "refinement" : "search", intent, explanation: changedTopic ? "The category changed, so category-specific context was reset while the existing budget preference was retained." : "A new category and its available filters were extracted." };
  }

  if (previous && (cheaper || moreExpensive || betterRated || color || explicitMax !== undefined || explicitMin !== undefined || explicitRating !== undefined)) {
    const intent: AssistantIntent = { ...previous };
    if (explicitMax !== undefined) intent.maxPrice = explicitMax;
    if (explicitMin !== undefined) intent.minPrice = explicitMin;
    if (explicitRating !== undefined) intent.minRating = explicitRating;
    if (color) intent.attribute = { type: "color", value: color };
    if (cheaper) {
      const medianPrice = median(previousResults.map((product) => product.price * 85));
      const nextMax = medianPrice > 0 ? medianPrice : (previous.maxPrice ?? 0) * 0.8;
      if (nextMax > 0) intent.maxPrice = Math.min(previous.maxPrice ?? Number.POSITIVE_INFINITY, nextMax);
      intent.sort = "price-asc";
    }
    if (moreExpensive) {
      const medianPrice = median(previousResults.map((product) => product.price * 85));
      if (medianPrice > 0) intent.minPrice = Math.max(previous.minPrice ?? 0, medianPrice + 1);
      intent.sort = "price-desc";
    }
    if (betterRated) {
      intent.minRating = Math.min(5, Math.max(previous.minRating ?? 4, 4.5));
      intent.sort = "rating";
    }
    return { kind: "refinement", intent, explanation: "The previous category and filters were retained and refined." };
  }

  if (explicitMax !== undefined || explicitMin !== undefined || explicitRating !== undefined) {
    return {
      kind: "search",
      intent: {
        categorySlugs: [],
        ...(explicitMax !== undefined ? { maxPrice: explicitMax } : {}),
        ...(explicitMin !== undefined ? { minPrice: explicitMin } : {}),
        ...(explicitRating !== undefined ? { minRating: explicitRating, sort: "rating" } : {}),
      },
      explanation: "The requested product filters were extracted.",
    };
  }

  return { kind: "unclear", explanation: "I could not confidently identify a product category or supported filter." };
}
