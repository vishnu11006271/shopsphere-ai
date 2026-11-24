import { MockRecommendationProvider } from "../providers/mock-recommendation-provider";
import type { RecommendationProvider } from "../providers/recommendation-provider";
import type { Product } from "@/types/product";
import type { RecommendationContext, RecommendationServiceRequest, RecommendedProduct, RecommendationStrategy } from "../types";

type StrategyRequest = Omit<RecommendationServiceRequest,"strategy">;
interface RecommendationQueryKeyInput {
  strategy: RecommendationStrategy;
  context: RecommendationContext;
  currentProductId?: number;
  category?: string;
  limit?: number;
}

const provider: RecommendationProvider = new MockRecommendationProvider();
function execute(strategy:RecommendationStrategy,request:StrategyRequest):RecommendedProduct[] {
  const liveById=new Map(request.products.map((product)=>[product.id,product]));
  const wishlist=request.context.wishlistIds
    .map((id)=>liveById.get(id)??request.context.wishlistSnapshots.find((product)=>product.id===id))
    .filter((product):product is Product=>Boolean(product));
  const purchases=request.context.purchaseIds
    .map((id)=>liveById.get(id))
    .filter((product):product is Product=>Boolean(product));
  return provider.recommend({
    strategy,
    products:request.products,
    signals:{
      recentlyViewed:request.context.recentlyViewed,
      searchQueries:request.context.searchQueries,
      wishlist,
      cart:request.context.cart,
      purchases,
      currentCategory:request.context.currentCategory,
      enabledSignals:request.context.enabledSignals,
    },
    currentProduct:request.currentProduct,
    category:request.category,
    limit:request.limit,
  });
}

export const recommendationService = {
  cache: {
    recommendationStaleTimeMs: 30_000,
    productCatalogueStaleTimeMs: 120_000,
  },
  queryKey(input:RecommendationQueryKeyInput) {
    return [
      "recommendations",
      input.strategy,
      JSON.stringify({
        viewed:input.context.recentlyViewed.map((product)=>product.id),
        searches:input.context.searchQueries,
        wishlist:input.context.wishlistIds,
        wishlistSnapshots:input.context.wishlistSnapshots.map((product)=>product.id),
        cart:input.context.cart.map((product)=>product.id),
        purchases:input.context.purchaseIds,
        enabledSignals:input.context.enabledSignals,
        category:input.category??input.context.currentCategory,
        currentProductId:input.currentProductId,
      }),
      input.limit??8,
    ] as const;
  },
  recommend(request:RecommendationServiceRequest):RecommendedProduct[] {
    return execute(request.strategy,request);
  },
  getPersonalized(request:StrategyRequest):RecommendedProduct[] {
    return execute("personalized",request);
  },
  getSimilar(request:StrategyRequest):RecommendedProduct[] {
    return execute("similar-products",request);
  },
  getTrending(request:StrategyRequest):RecommendedProduct[] {
    return execute("trending",request);
  },
  getFrequentlyBought(request:StrategyRequest):RecommendedProduct[] {
    return execute("frequently-bought-together",request);
  },
};
