import type { Product, ProductCategory } from "@/types/product";

export type AssistantSort = "price-asc" | "price-desc" | "rating";

export interface AssistantIntent {
  categorySlugs: string[];
  categoryLabel?: string;
  maxPrice?: number;
  minPrice?: number;
  minRating?: number;
  attribute?: { type: "color"; value: string };
  sort?: AssistantSort;
}

export interface AssistantConversationContext {
  previousIntent?: AssistantIntent;
  previousResults?: Product[];
}

export interface IntentParseResult {
  kind: "search" | "refinement" | "similar" | "unclear";
  intent?: AssistantIntent;
  targetProduct?: Product;
  explanation: string;
}

export interface AssistantResponse {
  text: string;
  products: Product[];
  intent?: AssistantIntent;
  suggestions: string[];
}

export type { ProductCategory };
