import { describe,expect,it } from "vitest";
import { validateAddress,validateCustomer } from "./checkout";

describe("checkout validation",()=>{
  it("accepts valid customer information",()=>{
    expect(validateCustomer({name:"Asha Rao",email:"asha@example.com",phone:"9876543210"})).toEqual({});
  });
  it("reports invalid customer fields independently",()=>{
    expect(validateCustomer({name:"A",email:"bad",phone:"123"})).toMatchObject({
      name:"Enter your full name.",email:"Enter a valid email address.",phone:"Enter a valid 10-digit Indian mobile number."
    });
  });
  it("requires a valid Indian delivery address",()=>{
    expect(validateAddress({fullName:"Asha Rao",phone:"9876543210",line1:"12 MG Road",line2:"",city:"Bengaluru",state:"Karnataka",postalCode:"560001",country:"India"})).toEqual({});
  });
  it("rejects incomplete address details",()=>{
    expect(validateAddress({fullName:"",phone:"",line1:"",line2:"",city:"",state:"",postalCode:"",country:"India"})).toHaveProperty("postalCode");
  });
});
