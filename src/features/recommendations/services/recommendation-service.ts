import { MockRecommendationProvider } from "../providers/mock-recommendation-provider";
import type { RecommendationProvider } from "../providers/recommendation-provider";
import type { RecommendationServiceRequest, RecommendationSignals, RecommendedProduct } from "../types";

const provider: RecommendationProvider = new MockRecommendationProvider();
export const recommendationService = {
  recommend(request: RecommendationServiceRequest): RecommendedProduct[] {
    const liveById=new Map(request.products.map((product)=>[product.id,product]));
    const wishlist=request.context.wishlistIds
      .map((id)=>liveById.get(id)??request.context.wishlistSnapshots.find((product)=>product.id===id))
      .filter((product)=>Boolean(product));
    const purchases=request.context.purchaseIds
      .map((id)=>liveById.get(id))
      .filter((product)=>Boolean(product));
    const signals:RecommendationSignals={
      recentlyViewed:request.context.recentlyViewed,
      searchQueries:request.context.searchQueries,
      wishlist:wishlist,
      cart:request.context.cart,
      purchases,
      currentCategory:request.context.currentCategory,
      enabledSignals:request.context.enabledSignals,
    };
    return provider.recommend({
      strategy:request.strategy,
      products:request.products,
      signals,
      currentProduct:request.currentProduct,
      category:request.category,
      limit:request.limit,
    });
  },
};
