import { Product } from "../data/products";

type ProductCategory = Product["category"];

interface BackendCategory {
  name?: string | null;
}

interface BackendProduct {
  id: string;
  slug?: string | null;
  name: string;
  description?: string | null;
  price: number | string;
  imageUrl?: string | null;
  ingredients?: unknown;
  benefits?: unknown;
  howToUse?: string | null;
  size?: string | null;
  isFeatured?: boolean;
  Category?: BackendCategory | null;
  category?: BackendCategory | null;
}

interface BackendProductListResponse {
  products?: BackendProduct[];
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
};

const inferCategory = (value?: string | null): ProductCategory => {
  const normalized = String(value || "").toLowerCase();
  return normalized.includes("hair") ? "hair" : "skincare";
};

const normalizeProduct = (product: BackendProduct): Product => {
  const categoryName = product.Category?.name || product.category?.name || "";
  return {
    id: product.slug || product.id,
    name: product.name,
    category: inferCategory(categoryName || product.name),
    price: Number(product.price || 0),
    image: product.imageUrl || "/assets/logo/revive_roots_essential.png",
    description: product.description || "No product description available yet.",
    ingredients: toStringArray(product.ingredients),
    benefits: toStringArray(product.benefits),
    howToUse: product.howToUse || "Use as directed on product packaging.",
    size: product.size || "Standard",
    featured: Boolean(product.isFeatured),
  };
};

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data?.message || data?.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<T>;
};

const sortToApi = (sortBy?: "featured" | "price-low" | "price-high"): string | undefined => {
  if (sortBy === "price-low") return "price-asc";
  if (sortBy === "price-high") return "price-desc";
  if (sortBy === "featured") return "ranked";
  return undefined;
};

export const getProducts = async (params?: {
  category?: ProductCategory;
  sortBy?: "featured" | "price-low" | "price-high";
}): Promise<Product[]> => {
  const query = new URLSearchParams();
  query.set("limit", "50");
  const sort = sortToApi(params?.sortBy);
  if (sort) query.set("sort", sort);
  if (params?.category === "hair") query.set("category", "hair,Hair Care,Hair");
  if (params?.category === "skincare") query.set("category", "skincare,Skin Care,Skincare");

  const data = await fetchJson<BackendProductListResponse>(`/products?${query.toString()}`);
  return (data.products || []).map(normalizeProduct);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const data = await fetchJson<BackendProduct[]>("/products/featured");
  return data.map(normalizeProduct);
};

export const getProductByIdentifier = async (identifier: string): Promise<Product> => {
  const product = await fetchJson<BackendProduct>(`/products/resolve/${encodeURIComponent(identifier)}`);
  return normalizeProduct(product);
};

export const submitContactMessage = async (payload: ContactPayload): Promise<void> => {
  await fetchJson<{ message: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const subscribeToNewsletter = async (email: string): Promise<void> => {
  await fetchJson<{ message: string }>("/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};
