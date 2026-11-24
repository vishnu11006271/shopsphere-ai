import type { CheckoutCustomer, ShippingAddress } from "@/features/checkout/store/checkout-store";

export function validateCustomer(customer:CheckoutCustomer):Record<string,string>{
  const errors:Record<string,string>={};
  if(customer.name.trim().length<2)errors.name="Enter your full name.";
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()))errors.email="Enter a valid email address.";
  if(!/^[6-9]\d{9}$/.test(customer.phone.replace(/\D/g,"")))errors.phone="Enter a valid 10-digit Indian mobile number.";
  return errors;
}
export function validateAddress(address:ShippingAddress):Record<string,string>{
  const errors:Record<string,string>={};
  if(address.fullName.trim().length<2)errors.fullName="Enter the recipient's name.";
  if(!/^[6-9]\d{9}$/.test(address.phone.replace(/\D/g,"")))errors.phone="Enter a valid 10-digit mobile number.";
  if(address.line1.trim().length<5)errors.line1="Enter a complete street address.";
  if(address.city.trim().length<2)errors.city="Enter your city.";
  if(address.state.trim().length<2)errors.state="Enter your state.";
  if(!/^\d{6}$/.test(address.postalCode.trim()))errors.postalCode="Enter a valid 6-digit PIN code.";
  return errors;
}
