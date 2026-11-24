"use client";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys, productService } from "@/features/products/services/product-service";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { useCheckoutStore } from "@/features/checkout/store/checkout-store";
import { useSearchHistoryStore } from "@/features/search/store/search-history-store";
import { useRecentlyViewedStore } from "../store/recently-viewed-store";
import { useRecommendationPreferencesStore } from "../store/recommendation-preferences-store";
import { recommendationService } from "../services/recommendation-service";
import type { Product } from "@/types/product";
import type { RecommendationStrategy } from "../types";

export function useRecommendations(options: {
  strategy: RecommendationStrategy;
  currentProduct?: Product;
  category?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const queryClient=useQueryClient();
  const viewedEntries=useRecentlyViewedStore((state)=>state.entries);
  const recentlyViewed=useMemo(()=>viewedEntries.map((entry)=>entry.product),[viewedEntries]);
  const searchQueries=useSearchHistoryStore((state)=>state.searches);
  const wishlistIds=useWishlistStore((state)=>state.productIds);
  const wishlistSnapshots=useWishlistStore((state)=>state.productSnapshots);
  const cartLines=useCartStore((state)=>state.items);
  const orders=useCheckoutStore((state)=>state.orders);
  const enabledSignals=useRecommendationPreferencesStore((state)=>state.enabledSignals);
  const cartProducts=useMemo(()=>cartLines.map((line)=>line.product),[cartLines]);
  const purchaseIds=useMemo(()=>orders.flatMap((order)=>order.items.map((item)=>item.productId)),[orders]);
  const querySignature=useMemo(()=>JSON.stringify({
    viewed:recentlyViewed.map((item)=>item.id),searchQueries,wishlistIds,cart:cartProducts.map((item)=>item.id),
    purchases:purchaseIds,enabledSignals,category:options.category,current:options.currentProduct?.id,
  }),[recentlyViewed,searchQueries,wishlistIds,cartProducts,purchaseIds,enabledSignals,options.category,options.currentProduct?.id]);
  return useQuery({
    queryKey:["recommendations",options.strategy,querySignature,options.limit??8],
    enabled:options.enabled!==false,
    staleTime:30_000,
    queryFn:async()=>{
      const needsCatalogue=options.strategy!=="recently-viewed";
      const catalogue=needsCatalogue
        ? await queryClient.fetchQuery({queryKey:productKeys.catalogue,queryFn:({signal:catalogueSignal})=>productService.getAll(catalogueSignal),staleTime:120_000})
        : {products:recentlyViewed};
      return recommendationService.recommend({
        strategy:options.strategy,
        products:catalogue.products,
        context:{
          recentlyViewed,searchQueries,wishlistIds,wishlistSnapshots,cart:cartProducts,
          purchaseIds,currentCategory:options.category,enabledSignals,
        },
        currentProduct:options.currentProduct,category:options.category,limit:options.limit,
      });
    },
  });
}
