export interface Product {
  id: number; title: string; description: string; category: string;
  price: number; discountPercentage: number; rating: number; stock: number;
  brand?: string; thumbnail: string; images: string[]; tags?: string[];
  warrantyInformation?: string; shippingInformation?: string;
  availabilityStatus?: string; minimumOrderQuantity?: number;
}
export interface ProductListResponse { products: Product[]; total: number; skip: number; limit: number; }
export interface ProductCategory { slug: string; name: string; url: string; }
