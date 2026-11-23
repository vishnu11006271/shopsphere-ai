import type { Metadata } from "next";
import { WishlistPage } from "@/features/wishlist/components/wishlist-page";

export const metadata: Metadata = { title: "Your wishlist | ShopSphere AI" };
export default function Page() { return <WishlistPage/>; }
