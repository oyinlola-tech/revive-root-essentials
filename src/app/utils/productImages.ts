import type { Product } from "../types/product";

export const PRODUCT_FALLBACK_IMAGES: Record<Product["category"], string> = {
  hair:
    "https://images.unsplash.com/photo-1667242003572-96caaf8ac5c4?auto=format&fit=crop&w=1200&q=80",
  skincare:
    "https://images.unsplash.com/photo-1591375462077-800a22f5fba4?auto=format&fit=crop&w=1200&q=80",
};

export const getProductImageByCategory = (product: Product) => {
  if (product.image && product.image.trim().length > 0) return product.image;
  return PRODUCT_FALLBACK_IMAGES[product.category];
};
