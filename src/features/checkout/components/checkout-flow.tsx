"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CreditCard, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { calculateCartTotals, formatAmount, unitPriceINR } from "@/features/cart/utils/cart";
import { useCheckoutStore, type DeliveryChoice, type ShopOrder } from "@/features/checkout/store/checkout-store";
import { validateAddress, validateCustomer } from "@/features/checkout/utils/checkout";

const stepLabels=["Customer","Address","Delivery","Review","Payment","Confirmation"];
const fieldClass="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10";
const labelClass="mb-2 block text-sm font-medium text-ink";
const deliveryChoices=(standard:number):DeliveryChoice[]=>[
{id:"standard",label:"Standard delivery",description:"Reliable delivery at the standard rate",eta:"5–7 business days",price:standard},
{id:"express",label:"Express delivery",description:"Priority handling",eta:"2–3 business days",price:249},
{id:"priority",label:"Priority delivery",description:"Fastest simulated option",eta:"Tomorrow (simulated)",price:399}
];

function Field({label,name,value,onChange,error,type="text",placeholder}:{label:string;name:string;value:string;onChange:(value:string)=>void;error?:string;type?:string;placeholder?:string}){
return <div><label className={labelClass} htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={fieldClass} aria-invalid={Boolean(error)}/>{error&&<p role="alert" className="mt-1 text-xs text-rose-600">{error}</p>}</div>;
}
function OrderConfirmation({order}:{order:ShopOrder}){
return <section className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 text-center shadow-soft sm:p-10">
<div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e8eee7] text-brand"><CheckCircle2 size={34}/></div>
<p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-brand">Order confirmed</p>
<h1 className="mt-2 text-3xl font-semibold tracking-tight">Thank you, {order.customer.name.split(" ")[0]}.</h1>
<p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">Your simulated order has been placed. No payment has been collected and no real shipment has been created.</p>
<div className="mt-8 rounded-2xl bg-canvas p-5 text-left"><div className="flex justify-between gap-2"><span className="text-xs text-muted">Order ID</span><strong className="font-mono text-sm">{order.id}</strong></div><div className="mt-4 flex justify-between text-sm"><span className="text-muted">Order total</span><strong>{formatAmount(order.total)}</strong></div><div className="mt-2 flex justify-between text-sm"><span className="text-muted">Delivery</span><strong>{order.delivery.eta}</strong></div></div>
<div className="mt-6 flex flex-wrap justify-center gap-3"><Link href={"/orders/"+order.id}><Button>Track your order <ArrowRight size={16}/></Button></Link><Link href="/products"><Button variant="secondary">Continue shopping</Button></Link></div>
</section>;
}

export function CheckoutFlow(){
const router=useRouter();
const lines=useCartStore(s=>s.items);
const cartHydrated=useCartStore(s=>s.hasHydrated);
const clearCart=useCartStore(s=>s.clearCart);
const couponCode=useCartStore(s=>s.couponCode);
const authSession=useAuthStore(s=>s.session);
const authUsers=useAuthStore(s=>s.users);
const authUser=useMemo(()=>authSession&&authSession.expiresAt>Date.now()?authUsers.find(user=>user.id===authSession.userId)??null:null,[authSession,authUsers]);
const authHydrated=useAuthStore(s=>s.hasHydrated);
const draft=useCheckoutStore(s=>s.draft);
const orders=useCheckoutStore(s=>s.orders);
const checkoutHydrated=useCheckoutStore(s=>s.hasHydrated);
const updateDraft=useCheckoutStore(s=>s.updateDraft);
const updateCustomer=useCheckoutStore(s=>s.updateCustomer);
const updateAddress=useCheckoutStore(s=>s.updateAddress);
const createOrder=useCheckoutStore(s=>s.createOrder);
const resetDraft=useCheckoutStore(s=>s.resetDraft);
const [customerErrors,setCustomerErrors]=useState<Record<string,string>>({});
const [addressErrors,setAddressErrors]=useState<Record<string,string>>({});
const [paymentError,setPaymentError]=useState("");
const [placing,setPlacing]=useState(false);
const [initialised,setInitialised]=useState(false);
const totals=useMemo(()=>calculateCartTotals(lines,couponCode),[lines]);
const choices=useMemo(()=>deliveryChoices(totals.shipping),[totals.shipping]);
const selectedDelivery=choices.find(choice=>choice.id===draft.deliveryId)??choices[0];
const order=orders.find(item=>item.id===draft.completedOrderId);

useEffect(()=>{
if(!cartHydrated||!checkoutHydrated||!authHydrated||initialised)return;
if(draft.completedOrderId&&order&&lines.length===0){setInitialised(true);return;}
if(draft.completedOrderId&&lines.length>0){resetDraft();if(authUser){updateCustomer({name:authUser.name,email:authUser.email});updateAddress({fullName:authUser.name});}setInitialised(true);return;}
if(lines.length===0){router.replace("/cart");return;}
if(authUser){
if(!draft.customer.name)updateCustomer({name:authUser.name,email:authUser.email});
if(!draft.address.fullName)updateAddress({fullName:authUser.name,phone:draft.customer.phone});
}
setInitialised(true);
},[authHydrated,authUser,cartHydrated,checkoutHydrated,draft.address.fullName,draft.completedOrderId,draft.customer.email,draft.customer.name,initialised,lines.length,order,router,resetDraft,updateAddress,updateCustomer]);

if(!cartHydrated||!checkoutHydrated||!authHydrated||!initialised)return <main className="mx-auto max-w-5xl px-5 py-16"><p role="status" className="text-sm text-muted">Restoring your saved checkout…</p></main>;
if(draft.completedOrderId&&order)return <main className="mx-auto max-w-5xl px-5 py-12"><OrderConfirmation order={order}/></main>;

const goNext=()=>{
if(draft.step===0){const errors=validateCustomer(draft.customer);setCustomerErrors(errors);if(Object.keys(errors).length)return;updateAddress({fullName:draft.customer.name,phone:draft.customer.phone});}
if(draft.step===1){const errors=validateAddress(draft.address);setAddressErrors(errors);if(Object.keys(errors).length)return;}
updateDraft({step:Math.min(4,draft.step+1)});window.scrollTo({top:0,behavior:"smooth"});
};
const goBack=()=>{updateDraft({step:Math.max(0,draft.step-1)});setPaymentError("");};
const placeOrder=()=>{
if(draft.paymentMethod!=="cod"&&draft.testOutcome==="failure"){setPaymentError("The mock payment was declined. No money was charged. Select the successful test outcome or choose Cash on Delivery.");return;}
setPaymentError("");setPlacing(true);
try{
const total=totals.subtotal-totals.discount+selectedDelivery.price+totals.tax;
const created=createOrder({lines,delivery:selectedDelivery,subtotal:totals.subtotal,discount:totals.discount,shipping:selectedDelivery.price,tax:totals.tax,total});
clearCart();updateDraft({step:5,completedOrderId:created.id});
}finally{setPlacing(false);}
};
const total=totals.subtotal-totals.discount+selectedDelivery.price+totals.tax;

return <main className="mx-auto max-w-6xl px-5 pb-16 pt-8">
<header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="text-sm font-black tracking-tight">shop<span className="text-brand">sphere</span><span className="ml-1 text-[10px] text-brand">AI</span></Link><h1 className="mt-4 text-3xl font-semibold tracking-tight">Checkout</h1><p className="mt-1 text-sm text-muted">A six-step demo checkout. No real payment details required.</p></div><Link href="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand"><ArrowLeft size={15}/> Back to cart</Link></header>
<nav aria-label="Checkout progress" className="mb-8 overflow-x-auto rounded-2xl bg-white p-3 shadow-soft"><ol className="grid min-w-[620px] grid-cols-6 gap-2">{stepLabels.map((label,index)=><li key={label} className="flex items-center gap-2"><span className={"grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold "+(index<draft.step?"bg-brand text-white":index===draft.step?"bg-[#e8eee7] text-brand ring-1 ring-brand":"bg-canvas text-muted")}>{index<draft.step?<Check size={14}/>:index+1}</span><span className={"text-xs font-semibold "+(index===draft.step?"text-ink":"text-muted")}>{label}</span></li>)}</ol></nav>
<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
<section className="rounded-3xl bg-white p-5 shadow-soft sm:p-8">
{draft.step===0&&<><div className="mb-6"><p className="text-xs font-bold uppercase tracking-widest text-brand">Step 1 of 6</p><h2 className="mt-2 text-2xl font-semibold">Customer information</h2><p className="mt-1 text-sm text-muted">We’ll use these details for your order confirmation.</p></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" name="customer-name" value={draft.customer.name} onChange={value=>updateCustomer({name:value})} error={customerErrors.name}/><Field label="Email address" name="customer-email" type="email" value={draft.customer.email} onChange={value=>updateCustomer({email:value})} error={customerErrors.email}/><Field label="Mobile number" name="customer-phone" type="tel" value={draft.customer.phone} onChange={value=>updateCustomer({phone:value.replace(/\D/g,"").slice(0,10)})} error={customerErrors.phone}/></div></>}
{draft.step===1&&<><div className="mb-6"><p className="text-xs font-bold uppercase tracking-widest text-brand">Step 2 of 6</p><h2 className="mt-2 text-2xl font-semibold">Shipping address</h2><p className="mt-1 text-sm text-muted">Your checkout is saved locally, so a refresh won’t clear these fields.</p></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Recipient name" name="address-name" value={draft.address.fullName} onChange={value=>updateAddress({fullName:value})} error={addressErrors.fullName}/><Field label="Mobile number" name="address-phone" value={draft.address.phone} onChange={value=>updateAddress({phone:value.replace(/\D/g,"").slice(0,10)})} error={addressErrors.phone}/><div className="sm:col-span-2"><Field label="Street address" name="address-line1" value={draft.address.line1} onChange={value=>updateAddress({line1:value})} error={addressErrors.line1} placeholder="House / flat, street, area"/></div><div className="sm:col-span-2"><Field label="Landmark (optional)" name="address-line2" value={draft.address.line2} onChange={value=>updateAddress({line2:value})} placeholder="Nearby landmark"/></div><Field label="City" name="address-city" value={draft.address.city} onChange={value=>updateAddress({city:value})} error={addressErrors.city}/><Field label="State" name="address-state" value={draft.address.state} onChange={value=>updateAddress({state:value})} error={addressErrors.state}/><Field label="PIN code" name="address-pin" value={draft.address.postalCode} onChange={value=>updateAddress({postalCode:value.replace(/\D/g,"").slice(0,6)})} error={addressErrors.postalCode}/><Field label="Country" name="address-country" value={draft.address.country} onChange={value=>updateAddress({country:value})}/></div></>}
{draft.step===2&&<><div className="mb-6"><p className="text-xs font-bold uppercase tracking-widest text-brand">Step 3 of 6</p><h2 className="mt-2 text-2xl font-semibold">Delivery method</h2><p className="mt-1 text-sm text-muted">Delivery speeds and dates are simulated.</p></div><div className="space-y-3">{choices.map(choice=><label key={choice.id} className={"flex cursor-pointer items-start gap-4 rounded-2xl border p-4 "+(draft.deliveryId===choice.id?"border-brand bg-[#f2f6f1]":"border-black/10 hover:border-brand/40")}><input type="radio" name="delivery" checked={draft.deliveryId===choice.id} onChange={()=>updateDraft({deliveryId:choice.id})} className="mt-1 accent-brand"/><Truck className="mt-0.5 text-brand" size={20}/><span className="min-w-0 flex-1"><span className="block font-semibold">{choice.label}</span><span className="mt-1 block text-xs text-muted">{choice.description} · {choice.eta}</span></span><strong className="text-sm">{choice.price===0?"Free":formatAmount(choice.price)}</strong></label>)}</div></>}
{draft.step===3&&<><div className="mb-6"><p className="text-xs font-bold uppercase tracking-widest text-brand">Step 4 of 6</p><h2 className="mt-2 text-2xl font-semibold">Order summary</h2><p className="mt-1 text-sm text-muted">Review your items, delivery address, and total.</p></div><div className="rounded-2xl bg-canvas p-4"><div className="flex items-center gap-2 text-sm font-semibold"><MapPin size={16} className="text-brand"/> Delivering to</div><p className="mt-2 text-sm font-semibold">{draft.address.fullName} · {draft.address.phone}</p><p className="mt-1 text-sm leading-6 text-muted">{draft.address.line1}{draft.address.line2?", "+draft.address.line2:""}, {draft.address.city}, {draft.address.state} {draft.address.postalCode}, {draft.address.country}</p><button type="button" onClick={()=>updateDraft({step:1})} className="mt-2 text-xs font-semibold text-brand underline">Edit address</button></div><div className="mt-4 rounded-2xl bg-canvas p-4"><div className="flex justify-between text-sm font-semibold"><span>{selectedDelivery.label}</span><span>{selectedDelivery.price===0?"Free":formatAmount(selectedDelivery.price)}</span></div><p className="mt-1 text-xs text-muted">{selectedDelivery.eta} · simulated</p><button type="button" onClick={()=>updateDraft({step:2})} className="mt-2 text-xs font-semibold text-brand underline">Change delivery</button></div><div className="mt-5 space-y-3">{lines.map(line=><div key={line.product.id+"-"+(line.variant?.id??"base")} className="flex items-center gap-3"><div className="relative size-14 shrink-0 rounded-xl bg-canvas"><Image src={line.product.thumbnail} alt="" fill sizes="56px" className="object-contain p-2"/></div><div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-semibold">{line.product.title}</p><p className="text-xs text-muted">Qty {line.quantity}</p></div><span className="text-sm font-semibold">{formatAmount(unitPriceINR(line)*line.quantity)}</span></div>)}</div></>}
{draft.step===4&&<><div className="mb-6"><p className="text-xs font-bold uppercase tracking-widest text-brand">Step 5 of 6</p><h2 className="mt-2 text-2xl font-semibold">Mock payment</h2><p className="mt-1 text-sm text-muted">Never enter a real card number, CVV, bank login, or UPI PIN.</p></div><div className="space-y-3">{([{id:"mock-card",title:"Mock Card",description:"Test-mode card simulation. No card details collected.",icon:CreditCard},{id:"mock-upi",title:"Mock UPI",description:"Test-mode UPI simulation. No UPI ID or PIN requested.",icon:ShieldCheck},{id:"cod",title:"Cash on Delivery",description:"Simulated cash-on-delivery order.",icon:PackageCheck}] as const).map(option=><label key={option.id} className={"flex cursor-pointer items-start gap-4 rounded-2xl border p-4 "+(draft.paymentMethod===option.id?"border-brand bg-[#f2f6f1]":"border-black/10")}><input type="radio" name="payment" checked={draft.paymentMethod===option.id} onChange={()=>{updateDraft({paymentMethod:option.id});setPaymentError("");}} className="mt-1 accent-brand"/><option.icon size={20} className="mt-0.5 text-brand"/><span><span className="block font-semibold">{option.title}</span><span className="mt-1 block text-xs text-muted">{option.description}</span></span></label>)}</div>{draft.paymentMethod!=="cod"&&<div className="mt-5 rounded-2xl border border-dashed border-brand/40 bg-[#f7faf6] p-4"><p className="text-sm font-semibold">Mock gateway result</p><p className="mt-1 text-xs text-muted">Select a deterministic test result to exercise success and decline handling.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>updateDraft({testOutcome:"success"})} className={"rounded-full px-4 py-2 text-xs font-semibold "+(draft.testOutcome==="success"?"bg-brand text-white":"bg-white text-ink ring-1 ring-black/10")}>Simulate success</button><button type="button" onClick={()=>updateDraft({testOutcome:"failure"})} className={"rounded-full px-4 py-2 text-xs font-semibold "+(draft.testOutcome==="failure"?"bg-rose-600 text-white":"bg-white text-ink ring-1 ring-black/10")}>Simulate decline</button></div></div>}{paymentError&&<p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{paymentError}</p>}<p className="mt-5 flex items-start gap-2 rounded-xl bg-canvas p-3 text-xs leading-5 text-muted"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-brand"/> Test mode only. The selection and simulated result are stored locally; nothing is transmitted to a payment provider.</p></>}
<div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-black/5 pt-6">{draft.step>0?<Button variant="secondary" onClick={goBack}><ArrowLeft size={15}/> Back</Button>:<span/>}{draft.step<4?<Button onClick={goNext}>Continue <ArrowRight size={15}/></Button>:<Button disabled={placing} onClick={placeOrder}>{placing?"Placing demo order…":draft.paymentMethod==="cod"?"Place simulated order":"Pay "+formatAmount(total)} <ArrowRight size={15}/></Button>}</div>
</section>
<aside className="h-fit rounded-3xl bg-white p-5 shadow-soft lg:sticky lg:top-6"><h2 className="text-lg font-semibold">Order total</h2><div className="mt-4 space-y-3">{lines.map(line=><div key={line.product.id+"-"+(line.variant?.id??"base")} className="flex justify-between gap-3 text-sm"><span className="line-clamp-2 text-muted">{line.product.title} × {line.quantity}</span><span className="shrink-0 font-medium">{formatAmount(unitPriceINR(line)*line.quantity)}</span></div>)}</div><div className="mt-5 space-y-3 border-t border-black/5 pt-4 text-sm"><div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatAmount(totals.subtotal)}</span></div><div className="flex justify-between"><span className="text-muted">Discount</span><span className="text-emerald-700">−{formatAmount(totals.discount)}</span></div><div className="flex justify-between"><span className="text-muted">Delivery</span><span>{selectedDelivery.price===0?"Free":formatAmount(selectedDelivery.price)}</span></div><div className="flex justify-between"><span className="text-muted">Estimated tax (5%)</span><span>{formatAmount(totals.tax)}</span></div><div className="flex justify-between border-t border-black/5 pt-4 text-base font-bold"><span>Total</span><span>{formatAmount(total)}</span></div></div><p className="mt-4 text-[11px] leading-5 text-muted">Illustrative INR values. Catalogue conversion is not a live exchange rate.</p><p className="mt-3 flex items-center gap-2 text-[11px] text-muted"><ShieldCheck size={14}/> No real payment is collected.</p></aside>
</div>
</main>;
}
