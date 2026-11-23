import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/features/products/components/product-detail-page";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Product details | ShopSphere AI" };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId < 1) notFound();
  return <ProductDetailPage productId={productId} />;
}
