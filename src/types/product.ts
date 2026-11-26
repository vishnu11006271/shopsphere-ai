export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  stock: number;
  sku?: string;
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  tags?: string[];
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  minimumOrderQuantity?: number;
  returnPolicy?: string;
  dimensions?: { width: number; height: number; depth: number };
  weight?: number;
  sku?: string;
  reviews?: ProductReview[];
  /** Optional variant metadata supplied by a future catalogue provider or local fixture. */
  variants?: ProductVariant[];
}
export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
export interface ProductCategory {
  slug: string;
  name: string;
  url: string;
}
