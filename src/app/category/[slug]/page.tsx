import { DiscoveryPage } from "@/features/products/components/discovery-page";
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DiscoveryPage categorySlug={slug} />;
}
