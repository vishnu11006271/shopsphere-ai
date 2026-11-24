"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "@/store/cart-store";

export type OrderStatus = "ORDER_PLACED" | "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED";
export const ORDER_STATUS_STEPS: OrderStatus[] = ["ORDER_PLACED","CONFIRMED","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED"];
export const ORDER_STATUS_LABELS: Record<OrderStatus,string> = {
  ORDER_PLACED:"Order Placed", CONFIRMED:"Confirmed", PACKED:"Packed",
  SHIPPED:"Shipped", OUT_FOR_DELIVERY:"Out for Delivery", DELIVERED:"Delivered",
};

export interface CheckoutCustomer { name:string; email:string; phone:string; }
export interface ShippingAddress { fullName:string; phone:string; line1:string; line2:string; city:string; state:string; postalCode:string; country:string; }
export interface DeliveryChoice { id:"standard"|"express"|"priority"; label:string; description:string; eta:string; price:number; }
export interface CheckoutDraft {
  step:number; customer:CheckoutCustomer; address:ShippingAddress; deliveryId:DeliveryChoice["id"];
  paymentMethod:"mock-card"|"mock-upi"|"cod"; testOutcome:"success"|"failure"; completedOrderId:string|null;
}
export interface OrderLine { productId:number; title:string; thumbnail:string; unitPrice:number; quantity:number; variantLabel?:string; }
export interface OrderTimelineEntry { status:OrderStatus; at:string; }
export interface ShopOrder {
  id:string; createdAt:string; customer:CheckoutCustomer; address:ShippingAddress; delivery:DeliveryChoice;
  paymentMethod:CheckoutDraft["paymentMethod"]; items:OrderLine[]; subtotal:number; discount:number;
  shipping:number; tax:number; total:number; status:OrderStatus; timeline:OrderTimelineEntry[];
}
const emptyDraft:CheckoutDraft = {
  step:0, customer:{name:"",email:"",phone:""},
  address:{fullName:"",phone:"",line1:"",line2:"",city:"",state:"",postalCode:"",country:"India"},
  deliveryId:"standard", paymentMethod:"mock-card", testOutcome:"success", completedOrderId:null,
};
interface CheckoutState {
  draft:CheckoutDraft; orders:ShopOrder[]; hasHydrated:boolean;
  updateDraft:(patch:Partial<CheckoutDraft>)=>void;
  updateCustomer:(patch:Partial<CheckoutCustomer>)=>void;
  updateAddress:(patch:Partial<ShippingAddress>)=>void;
  resetDraft:()=>void; setHasHydrated:(value:boolean)=>void;
  createOrder:(payload:{lines:CartLine[];delivery:DeliveryChoice;subtotal:number;discount:number;shipping:number;tax:number;total:number})=>ShopOrder;
  advanceOrder:(id:string)=>void;
}
export const useCheckoutStore=create<CheckoutState>()(persist((set,get)=>({
  draft:emptyDraft,orders:[],hasHydrated:false,
  setHasHydrated:(value)=>set({hasHydrated:value}),
  updateDraft:(patch)=>set((state)=>({draft:{...state.draft,...patch,completedOrderId:patch.completedOrderId===undefined?state.draft.completedOrderId:patch.completedOrderId}})),
  updateCustomer:(patch)=>set((state)=>({draft:{...state.draft,customer:{...state.draft.customer,...patch}}})),
  updateAddress:(patch)=>set((state)=>({draft:{...state.draft,address:{...state.draft.address,...patch}}})),
  resetDraft:()=>set({draft:emptyDraft}),
  createOrder:(payload)=>{
    const draft=get().draft;
    const now=new Date().toISOString();
    const id=`SS-${Date.now().toString(36).toUpperCase()}`;
    const order:ShopOrder={
      id,createdAt:now,customer:draft.customer,address:draft.address,delivery:payload.delivery,
      paymentMethod:draft.paymentMethod,
      items:payload.lines.map((line)=>({
        productId:line.product.id,title:line.product.title,thumbnail:line.product.thumbnail,
        unitPrice:line.product.price*(1-line.product.discountPercentage/100)*85,
        quantity:line.quantity,
        ...(line.variant?{variantLabel:`${line.variant.name}: ${line.variant.value}`}:{}),
      })),
      subtotal:payload.subtotal,discount:payload.discount,shipping:payload.shipping,tax:payload.tax,total:payload.total,
      status:"CONFIRMED",timeline:[{status:"ORDER_PLACED",at:now},{status:"CONFIRMED",at:now}],
    };
    set((state)=>({orders:[order,...state.orders],draft:{...state.draft,step:5,completedOrderId:id}}));
    return order;
  },
  advanceOrder:(id)=>set((state)=>({orders:state.orders.map((order)=>{
    if(order.id!==id)return order;
    const index=ORDER_STATUS_STEPS.indexOf(order.status);
    if(index<0||index>=ORDER_STATUS_STEPS.length-1)return order;
    const next=ORDER_STATUS_STEPS[index+1];
    return {...order,status:next,timeline:[...order.timeline,{status:next,at:new Date().toISOString()}]};
  })})),
}),{
  name:"shopsphere-checkout-orders",
  storage:createJSONStorage(()=>localStorage),
  partialize:(state)=>({draft:state.draft,orders:state.orders}),
  onRehydrateStorage:()=>state=>state?.setHasHydrated(true),
}));
