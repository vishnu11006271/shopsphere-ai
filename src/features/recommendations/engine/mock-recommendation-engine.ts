import mockSignals from "../../../../public/mock-data/recommendation-signals.json";
import type { Product } from "@/types/product";
import type { RecommendationRequest, RecommendationSignals, RecommendationStrategy, RecommendedProduct, RecommendationWeights } from "../types";

export const RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  categoryMatch: 0.20, priceSimilarity: 0.14, tagOverlap: 0.18, normalizedRating: 0.10,
  recentlyViewedRelation: 0.14, wishlistRelation: 0.12, cartRelation: 0.12,
};
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
const unique = <T,>(items: T[]) => Array.from(new Set(items));
const active = (signals: RecommendationSignals, key: keyof RecommendationSignals["enabledSignals"]) => signals.enabledSignals[key];
function sourceProducts(signals: RecommendationSignals): Product[] {
  return [...(active(signals,"recentlyViewed")?signals.recentlyViewed:[]),...(active(signals,"wishlist")?signals.wishlist:[]),...(active(signals,"cart")?signals.cart:[]),...(active(signals,"purchases")?signals.purchases:[])];
}
function sourceCategories(signals: RecommendationSignals): string[] {
  const categories=sourceProducts(signals).map((product)=>product.category);
  if(active(signals,"categoryInterest")&&signals.currentCategory)categories.push(signals.currentCategory);
  if(active(signals,"searchHistory"))signals.searchQueries.forEach((query)=>{
    const q=normalize(query);
    sourceProducts(signals).forEach((product)=>{
      if([product.category,product.brand??"",...(product.tags??[])].some((value)=>normalize(value).includes(q)||q.includes(normalize(value))))categories.push(product.category);
    });
  });
  return categories;
}
function dominantCategory(signals: RecommendationSignals,fallback?:string):string {
  if(fallback)return fallback;
  const counts=new Map<string,number>();sourceCategories(signals).forEach((category)=>counts.set(category,(counts.get(category)??0)+1));
  return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]??"";
}
function typicalPrice(signals:RecommendationSignals):number|null {
  const prices=sourceProducts(signals).map((product)=>product.price).filter((price)=>Number.isFinite(price)&&price>0);
  return prices.length?prices.reduce((sum,value)=>sum+value,0)/prices.length:null;
}
function searchRelevance(product:Product,signals:RecommendationSignals):number {
  if(!active(signals,"searchHistory")||!signals.searchQueries.length)return 0;
  const fields=[product.title,product.brand??"",product.category,...(product.tags??[])].map(normalize);
  return Math.max(0,...signals.searchQueries.map((query)=>{
    const q=normalize(query);if(!q)return 0;
    if(fields.some((field)=>field.includes(q)||q.includes(field)))return 1;
    const tokens=q.split(" ").filter((token)=>token.length>2);
    return tokens.length?tokens.filter((token)=>fields.some((field)=>field.includes(token))).length/tokens.length:0;
  }));
}
function categoryMatch(product:Product,signals:RecommendationSignals,anchor?:Product):number {
  let score=anchor?.category===product.category?1:0;const categories=sourceCategories(signals);
  if(categories.length){const count=categories.filter((category)=>category===product.category).length;score=Math.max(score,count/categories.length);}
  return clamp01(Math.max(score,searchRelevance(product,signals)*0.85));
}
function priceSimilarity(product:Product,signals:RecommendationSignals,anchor?:Product):number {
  const target=anchor?.price??typicalPrice(signals);if(target===null||target===undefined||target<=0)return 0;
  return clamp01(1-Math.abs(product.price-target)/Math.max(target,1));
}
function tagOverlap(product:Product,signals:RecommendationSignals,anchor?:Product):number {
  const sources=[...sourceProducts(signals),...(anchor?[anchor]:[])];
  const tags=unique([...sources.flatMap((item)=>item.tags??[]),...(active(signals,"searchHistory")?signals.searchQueries:[])].map(normalize).filter(Boolean));
  const candidate=unique([product.title,product.brand??"",product.category,...(product.tags??[])].map(normalize).filter(Boolean));
  if(!tags.length||!candidate.length)return 0;
  return candidate.filter((tag)=>tags.includes(tag)).length/unique([...tags,...candidate]).length;
}
function similarity(candidate:Product,source:Product):number {
  const category=candidate.category===source.category?1:0;
  const a=(candidate.tags??[]).map(normalize),b=(source.tags??[]).map(normalize);
  const overlap=a.length&&b.length?a.filter((tag)=>b.includes(tag)).length/unique([...a,...b]).length:0;
  const price=source.price>0?clamp01(1-Math.abs(candidate.price-source.price)/source.price):0;
  return category*0.4+overlap*0.4+price*0.2;
}
function relation(candidate:Product,sources:Product[]):number {
  if(!sources.length)return 0;
  return Math.max(...sources.filter((item)=>item.id!==candidate.id).map((item)=>similarity(candidate,item)),0);
}
function brandAffinity(product:Product,signals:RecommendationSignals):number {
  if(!active(signals,"brandPreference")||!product.brand)return 0;
  const brands=sourceProducts(signals).map((item)=>item.brand).filter((brand):brand is string=>Boolean(brand));
  if(!brands.length)return 0;
  return clamp01(brands.filter((brand)=>normalize(brand)===normalize(product.brand??"")).length/brands.length);
}
function scoreComponents(product:Product,signals:RecommendationSignals,anchor?:Product) {
  const weights=RECOMMENDATION_WEIGHTS;
  const components={
    categoryMatch:active(signals,"categoryInterest")?categoryMatch(product,signals,anchor):0,
    priceSimilarity:active(signals,"priceRange")?priceSimilarity(product,signals,anchor):0,
    tagOverlap:active(signals,"tagInterest")?tagOverlap(product,signals,anchor):0,
    normalizedRating:active(signals,"ratingPreference")?clamp01(product.rating/5):0,
    recentlyViewedRelation:relation(product,active(signals,"recentlyViewed")&&signals.recentlyViewed.length?signals.recentlyViewed:anchor?[anchor]:[]),
    wishlistRelation:relation(product,active(signals,"wishlist")?signals.wishlist:[]),
    cartRelation:relation(product,active(signals,"cart")?signals.cart:[]),
  };
  const weighted=Object.entries(components).reduce((sum,[key,value])=>sum+value*weights[key as keyof RecommendationWeights],0);
  return {components,score:clamp01(weighted+brandAffinity(product,signals)*0.05)};
}
function reasonsFor(components:ReturnType<typeof scoreComponents>["components"],product:Product):RecommendedProduct["reasons"] {
  const labels:Record<keyof typeof components,string>={categoryMatch:"Category interest",priceSimilarity:"Price fit",tagOverlap:"Shared product tags",normalizedRating:"Customer rating",recentlyViewedRelation:"Browsing similarity",wishlistRelation:"Wishlist similarity",cartRelation:"Cart compatibility"};
  return (Object.entries(components) as [keyof typeof components,number][]).filter(([,value])=>value>=0.2).sort((a,b)=>b[1]-a[1]).slice(0,3)
    .map(([key,value])=>({label:labels[key],detail:key==="normalizedRating"?product.rating.toFixed(1)+" out of 5":key==="priceSimilarity"?"Within your observed price range":Math.round(value*100)+"% signal match"}));
}
function result(product:Product,strategy:RecommendationStrategy,score:number,reasons:RecommendedProduct["reasons"]):RecommendedProduct {
  return {product,strategy,score:Number(score.toFixed(4)),reasons};
}
function ranked(candidates:Product[],strategy:RecommendationStrategy,signals:RecommendationSignals,anchor?:Product,limit=8):RecommendedProduct[] {
  return candidates.filter((product)=>product.stock>0&&product.id!==anchor?.id)
    .map((product)=>{const scored=scoreComponents(product,signals,anchor);return result(product,strategy,scored.score,reasonsFor(scored.components,product));})
    .sort((a,b)=>b.score-a.score||b.product.rating-a.product.rating||a.product.id-b.product.id).slice(0,limit);
}
function recentlyViewed(request:RecommendationRequest):RecommendedProduct[] {
  if(!active(request.signals,"recentlyViewed"))return [];
  return request.signals.recentlyViewed.map((product,index)=>result(product,"recently-viewed",1-index/100,[{label:"Recently viewed",detail:"You opened this product on this device"}])).slice(0,request.limit??8);
}
function categoryBased(request:RecommendationRequest):RecommendedProduct[] {
  if(!active(request.signals,"categoryInterest"))return [];
  const category=dominantCategory(request.signals,request.category??request.currentProduct?.category);if(!category)return [];
  return ranked(request.products.filter((product)=>product.category===category),"category-based",request.signals,request.currentProduct,request.limit??8)
    .map((item)=>({...item,reasons:[{label:"Category match",detail:"Based on your interest in "+category.replaceAll("-"," ")},...item.reasons.filter((reason)=>reason.label!=="Category interest")]}));
}
function priceBased(request:RecommendationRequest):RecommendedProduct[] {
  const target=typicalPrice(request.signals);if(target===null)return [];
  return request.products.filter((product)=>product.stock>0&&product.id!==request.currentProduct?.id)
    .map((product)=>({product,strategy:"price-based" as const,score:clamp01(1-Math.abs(product.price-target)/Math.max(target,1)),reasons:[{label:"Typical price range",detail:"Your observed average catalogue price is "+target.toFixed(2)}]}))
    .sort((a,b)=>b.score-a.score||b.product.rating-a.product.rating).slice(0,request.limit??8);
}
function trending(request:RecommendationRequest):RecommendedProduct[] {
  const popularity=mockSignals.productPopularity as Record<string,number>,velocity=mockSignals.ratingVelocity as Record<string,number>,categoryPopularity=mockSignals.categoryPopularity as Record<string,number>;
  return request.products.filter((product)=>product.stock>0&&product.id!==request.currentProduct?.id)
    .map((product)=>{const popular=popularity[String(product.id)]!==undefined?popularity[String(product.id)]/100:(categoryPopularity[product.category]??0.5);const velocityScore=velocity[String(product.id)]??clamp01(product.rating/5);return result(product,"trending",clamp01(popular*0.65+velocityScore*0.35),[{label:"Trending signal",detail:"Ranked using explicit mock popularity and rating-velocity data"}]);})
    .sort((a,b)=>b.score-a.score||a.product.id-b.product.id).slice(0,request.limit??8);
}
function frequentlyBought(request:RecommendationRequest):RecommendedProduct[] {
  const pairs=mockSignals.coPurchaseCategoryPairs;
  const anchors=[...request.signals.cart,...request.signals.purchases,...(request.currentProduct?[request.currentProduct]:[])];
  if(!anchors.length)return [];
  return request.products.filter((product)=>product.stock>0&&!anchors.some((item)=>item.id===product.id)).map((product)=>{
    const strength=Math.max(0,...anchors.map((anchor)=>{
      const fixture=pairs.find((pair)=>pair.from===anchor.category&&pair.to===product.category);
      const orderCoOccurrence=request.signals.purchases.some((purchase)=>purchase.category===anchor.category)&&request.signals.purchases.some((purchase)=>purchase.category===product.category)?0.9:0;
      return Math.max(fixture?.strength??0,orderCoOccurrence);
    }));
    const score=clamp01(strength*0.8+scoreComponents(product,request.signals,request.currentProduct).score*0.2);
    return result(product,"frequently-bought-together",score,[{label:strength>0?"Mock basket association":"Complementary match",detail:strength>0?"Frequently paired with an item in this category":"A complementary category suggestion from local mock data"}]);
  }).filter((item)=>item.score>0.15).sort((a,b)=>b.score-a.score).slice(0,request.limit??8);
}
function personalized(request:RecommendationRequest):RecommendedProduct[] {
  const sources=sourceProducts(request.signals);
  const hasSearch=active(request.signals,"searchHistory")&&request.signals.searchQueries.length>0;
  const items=ranked(request.products.filter((product)=>!sources.some((item)=>item.id===product.id)),"personalized",request.signals,request.currentProduct,request.limit??8);
  if(items.length&&(sources.length||hasSearch))return items;
  return trending(request).map((item)=>({...item,strategy:"personalized",reasons:[{label:"Popular fallback",detail:"Signals are limited, so popular products provide a useful starting point"}]}));
}
export function getRecommendations(request:RecommendationRequest):RecommendedProduct[] {
  const strategy=request.strategy;
  if(strategy==="recently-viewed")return recentlyViewed(request);
  if(strategy==="similar-products")return ranked(request.products,"similar-products",request.signals,request.currentProduct,request.limit??8).map((item)=>({...item,reasons:[{label:"Similar to this product",detail:"Category, tags and price compared with the product you are viewing"},...item.reasons.filter((reason)=>reason.label!=="Category interest")]}));
  if(strategy==="category-based")return categoryBased(request);
  if(strategy==="price-based")return priceBased(request);
  if(strategy==="wishlist-based")return ranked(request.products,"wishlist-based",request.signals,undefined,request.limit??8).filter((item)=>!request.signals.wishlist.some((saved)=>saved.id===item.product.id)).map((item)=>({...item,reasons:[{label:"Because of your wishlist",detail:"Matches products and categories you saved"},...item.reasons]}));
  if(strategy==="cart-based")return ranked(request.products,"cart-based",request.signals,undefined,request.limit??8).filter((item)=>!request.signals.cart.some((saved)=>saved.id===item.product.id)).map((item)=>({...item,reasons:[{label:"Because of your cart",detail:"Matches products and categories already in your bag"},...item.reasons]}));
  if(strategy==="frequently-bought-together")return frequentlyBought(request);
  if(strategy==="trending")return trending(request);
  return personalized(request);
}
export function getRecommendationPriceRange(signals:RecommendationSignals) {
  const prices=sourceProducts(signals).map((product)=>product.price).filter((price)=>price>0);
  if(!prices.length)return null;
  return {min:Math.min(...prices),max:Math.max(...prices),average:prices.reduce((sum,value)=>sum+value,0)/prices.length,sampleSize:prices.length};
}
