"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
interface SearchHistoryState { searches:string[]; add:(query:string)=>void; clear:()=>void; }
export const useSearchHistoryStore = create<SearchHistoryState>()(persist((set)=>({
  searches: [],
  add:(query)=>set((state)=>{const value=query.trim();if(!value)return state;return {searches:[value,...state.searches.filter(item=>item.toLowerCase()!==value.toLowerCase())].slice(0,8)};}),
  clear:()=>set({searches:[]}),
}),{name:"shopsphere-search-history",storage:createJSONStorage(()=>localStorage)}));
