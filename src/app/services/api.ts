import type { Product } from "../types/product";
import { getNetworkErrorMessage, sanitizeApiErrorMessage } from "../utils/uiErrorMessages";

const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
const configuredBackendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN || "").trim().replace(/\/$/, "");
const AUTH_STORAGE_KEY = "revive_roots_auth";
const CURRENCY_STORAGE_KEY = "revive_roots_currency";
const REQUEST_TIMEOUT_MS = 30000;
const MAX_GET_RETRIES = 1;

const getApiBaseUrls = () => {
  const fromBackendOrigin = configuredBackendOrigin ? `${configuredBackendOrigin}/api` : "";
  const fromWindow = !configuredApiUrl && !fromBackendOrigin && typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : "";

  const bases = [configuredApiUrl, fromBackendOrigin, fromWindow].filter(Boolean);

  return Array.from(new Set(bases));
};

type ProductCategory = Product["category"];

interface BackendCategory {
  id: string;
  name: string;
  description?: string | null;
}

interface BackendProduct {
  id: string;
  slug?: string | null;
  name: string;
  currency?: string;
  description?: string | null;
  price: number | string;
  imageUrl?: string | null;
  ingredients?: unknown;
  benefits?: unknown;
  howToUse?: string | null;
  size?: string | null;
  isFeatured?: boolean;
  stock?: number;
  categoryId?: string | null;
  Category?: BackendCategory | null;
  category?: BackendCategory | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendProductListResponse {
  products?: BackendProduct[];
  total?: number;
  page?: number;
  limit?: number;
}

interface BackendCartItem {
  id: string;
  productId: string;
  name: string;
  price: number | string;
  quantity: number;
  image?: string | null;
  currency?: string;
}

interface BackendCartResponse {
  items: BackendCartItem[];
  total: number;
  currency: string;
}

interface BackendWishlistResponse {
  products: BackendProduct[];
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  acceptedMarketing?: boolean;
  acceptedNewsletter?: boolean;
  role: "user" | "admin" | "superadmin";
}

interface BackendOrder {
  id: string;
  orderNumber: string;
  totalAmount: number | string;
  currency: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  User?: {
    id?: string;
    email?: string;
    name?: string;
  };
  OrderItems?: Array<{
    id?: string;
    quantity?: number;
    price?: number | string;
    Product?: {
      id?: string;
      name?: string;
    };
  }>;
  shippingAddress?: string | {
    country?: string;
    state?: string;
    city?: string;
    line1?: string;
    postalCode?: string;
  } | null;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: BackendUser;
}

export interface AuthOtpChallenge {
  requiresOtp: true;
  identifier: string;
  message: string;
  challengeToken: string;
}

export interface AuthVerificationRequired {
  verificationRequired: true;
  identifier: string;
  message: string;
}

export type LoginResponse = AuthResponse | AuthOtpChallenge | AuthVerificationRequired;

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: BackendUser;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AdminProductInput {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId?: string;
  ingredients?: string[];
  benefits?: string[];
  howToUse?: string;
  size?: string;
  stock?: number;
  isFeatured?: boolean;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  size: string;
  stock: number;
  isFeatured: boolean;
}

export interface CategoryInput {
  name: string;
  description?: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  description: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: BackendOrder["status"];
  paymentStatus: BackendOrder["paymentStatus"];
  createdAt: string;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: BackendOrder["status"];
  paymentStatus: BackendOrder["paymentStatus"];
  createdAt: string;
  items?: Array<{
    productId?: string;
    quantity: number;
    name?: string;
    price?: number;
  }>;
  shippingAddress?: string;
}

export interface ContactRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface DashboardStats {
  users: number;
  products: number;
  orders: number;
  revenue: number;
}

export interface CreateOrderPayload {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: {
    country: string;
    state: string;
    city: string;
    line1: string;
    postalCode?: string;
  };
  paymentMethod: "card" | "ussd" | "transfer";
  currency?: string;
}

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
    backendId: product.id,
    name: product.name,
    currency: product.currency || "NGN",
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

const normalizeAdminProduct = (product: BackendProduct): AdminProduct => ({
  id: product.id,
  slug: product.slug || product.id,
  name: product.name,
  description: product.description || "",
  price: Number(product.price || 0),
  imageUrl: product.imageUrl || "",
  categoryId: product.categoryId || product.Category?.id || "",
  categoryName: product.Category?.name || product.category?.name || "Uncategorized",
  ingredients: toStringArray(product.ingredients),
  benefits: toStringArray(product.benefits),
  howToUse: product.howToUse || "",
  size: product.size || "",
  stock: Number(product.stock || 0),
  isFeatured: Boolean(product.isFeatured),
});

const getErrorMessage = async (response: Response, path?: string): Promise<string> => {
  try {
    const data = await response.json();
    return sanitizeApiErrorMessage({
      message: data?.message || data?.error,
      status: response.status,
      path,
    });
  } catch {
    return sanitizeApiErrorMessage({ status: response.status, path });
  }
};

const getSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

let csrfTokenCache: Record<string, string | null> = {};

const refreshCsrfToken = async (baseUrl: string) => {
  try {
    const csrfResp = await fetch(`${baseUrl}/version`, {
      method: "GET",
      credentials: "include",
    });
    const token = csrfResp.headers.get("x-csrf-token");
    csrfTokenCache[baseUrl] = token;
    return token;
  } catch {
    csrfTokenCache[baseUrl] = null;
    return null;
  }
};

const fetchJson = async <T>(path: string, init?: RequestInit, authenticated = false): Promise<T> => {
  const session = authenticated ? getSession() : null;
  const baseUrls = getApiBaseUrls();
  let lastError: Error | null = null;
  const requestMethod = String(init?.method || "GET").toUpperCase();
  const retryAttempts = requestMethod === "GET" ? MAX_GET_RETRIES : 0;
  const isFormDataBody = typeof FormData !== "undefined" && init?.body instanceof FormData;

  for (const baseUrl of baseUrls) {
    for (let attempt = 0; attempt <= retryAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        // The backend invalidates CSRF tokens after each unsafe request,
        // so refresh before every POST/PUT/PATCH/DELETE instead of reusing a cached token.
        if (requestMethod !== 'GET') {
          await refreshCsrfToken(baseUrl);
        }

        const response = await fetch(`${baseUrl}${path}`, {
          headers: {
            ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
            "X-Currency": getPreferredCurrency(),
            ...(csrfTokenCache[baseUrl] ? { 'X-CSRF-Token': csrfTokenCache[baseUrl] as string } : {}),
            ...(!isFormDataBody ? { "Content-Type": "application/json" } : {}),
            ...(init?.headers || {}),
          },
          // include credentials so cookies are sent/received across origins
          credentials: 'include',
          ...init,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response, path));
        }

        if (response.status === 204) {
          return null as T;
        }

        return response.json() as Promise<T>;
      } catch (error) {
        lastError = new Error(getNetworkErrorMessage(error));
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  throw new Error(lastError?.message || "Unable to connect to backend");
};

const sortToApi = (sortBy?: "featured" | "price-low" | "price-high"): string | undefined => {
  if (sortBy === "price-low") return "price-asc";
  if (sortBy === "price-high") return "price-desc";
  if (sortBy === "featured") return "ranked";
  return undefined;
};

export const setAuthSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    token: session.token,
    user: session.user,
  }));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("revive-roots-auth-changed"));
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("revive-roots-auth-changed"));
  }
};

export const getAuthSession = () => getSession();

export const getPreferredCurrency = () => localStorage.getItem(CURRENCY_STORAGE_KEY) || "NGN";

export const setPreferredCurrency = (currency: string) => {
  localStorage.setItem(CURRENCY_STORAGE_KEY, String(currency || "NGN").toUpperCase());
};

export const login = async (payload: { email: string; password: string }) => {
  const data = await fetchJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if ("token" in data && data.token) {
    setAuthSession(data);
  }
  return data;
};

export const oauthGoogleLogin = async (payload: {
  idToken: string;
  acceptedTerms?: boolean;
  acceptedMarketing?: boolean;
  acceptedNewsletter?: boolean;
}) => {
  const data = await fetchJson<AuthResponse>("/auth/oauth/google", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setAuthSession(data);
  return data;
};

export const oauthAppleLogin = async (payload: {
  idToken: string;
  name?: string;
  acceptedTerms?: boolean;
  acceptedMarketing?: boolean;
  acceptedNewsletter?: boolean;
}) => {
  const data = await fetchJson<AuthResponse>("/auth/oauth/apple", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setAuthSession(data);
  return data;
};

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}) => {
  return fetchJson<{ message: string; verificationRequired: boolean }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const verifyOtp = async (payload: { identifier: string; otp: string; challengeToken?: string }) => {
  const data = await fetchJson<AuthResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setAuthSession(data);
  return data;
};

export const verifyEmailLink = async (token: string) => {
  const data = await fetchJson<AuthResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  setAuthSession(data);
  return data;
};

export const resendOtp = async (identifier: string, challengeToken?: string) => {
  return fetchJson<{ message: string; expiresIn: number }>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ identifier, type: "email", challengeToken }),
  });
};

export const logout = async () => {
  try {
    await fetchJson<{ message: string }>("/auth/logout", { method: "POST" }, true);
  } finally {
    clearAuthSession();
  }
};

export const getMe = () => fetchJson<BackendUser>("/auth/me", undefined, true);

export const createOrder = async (payload: CreateOrderPayload) => {
  return fetchJson<{
    orderId: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentUrl: string | null;
  }>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
};

export const getOrderById = async (orderId: string): Promise<UserOrder> => {
  const order = await fetchJson<BackendOrder>(`/orders/${encodeURIComponent(orderId)}`, undefined, true);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount || 0),
    currency: order.currency || "NGN",
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    items: (order.OrderItems || []).map((item) => ({
      productId: item.Product?.id,
      quantity: Number(item.quantity || 0),
      name: item.Product?.name || "Product",
      price: Number(item.price || 0),
    })),
    shippingAddress: typeof order.shippingAddress === "string"
      ? order.shippingAddress
      : order.shippingAddress
        ? [
          order.shippingAddress.line1,
          order.shippingAddress.city,
          order.shippingAddress.state,
          order.shippingAddress.postalCode,
          order.shippingAddress.country,
        ].filter(Boolean).join(", ")
        : undefined,
  };
};

// Backwards-compatible aliases used by some pages.
export const getOrder = getOrderById;

export const getOrders = async (): Promise<UserOrder[]> => {
  const orders = await fetchJson<BackendOrder[]>("/orders", undefined, true);
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount || 0),
    currency: order.currency || "NGN",
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    items: (order.OrderItems || []).map((item) => ({
      productId: item.Product?.id,
      quantity: Number(item.quantity || 0),
      name: item.Product?.name || "Product",
      price: Number(item.price || 0),
    })),
  }));
};

export const verifyOrderPayment = async (
  orderId: string,
  payload: { transactionId?: string; reference?: string },
) => {
  return fetchJson<{ message: string; order: BackendOrder }>(`/orders/${encodeURIComponent(orderId)}/verify-payment`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
};

export const getMyCart = () => fetchJson<BackendCartResponse>("/cart", undefined, true);

export const addItemToCart = (payload: { productId: string; quantity?: number }) => {
  return fetchJson<{ id: string }>("/cart", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
};

export const updateCartItem = (itemId: string, quantity: number) => {
  return fetchJson<{ id: string }>("/cart/" + encodeURIComponent(itemId), {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  }, true);
};

export const removeCartItem = (itemId: string) => {
  return fetchJson<void>("/cart/" + encodeURIComponent(itemId), { method: "DELETE" }, true);
};

export const clearMyCart = () => fetchJson<void>("/cart", { method: "DELETE" }, true);

export const getMyWishlist = async (): Promise<Product[]> => {
  const data = await fetchJson<BackendWishlistResponse>("/wishlist", undefined, true);
  return (data.products || []).map(normalizeProduct);
};

export const addToWishlist = async (productId: string): Promise<void> => {
  await fetchJson<{ message: string }>("/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
  }, true);
};

export const removeFromWishlist = async (productId: string): Promise<void> => {
  await fetchJson<void>(`/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" }, true);
};

export const clearMyWishlist = async (): Promise<void> => {
  await fetchJson<void>("/wishlist", { method: "DELETE" }, true);
};

export const getProducts = async (params?: {
  category?: ProductCategory;
  sortBy?: "featured" | "price-low" | "price-high";
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> => {
  const query = new URLSearchParams();
  query.set("limit", "50");
  const sort = sortToApi(params?.sortBy);
  if (sort) query.set("sort", sort);
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (typeof params?.minPrice === "number" && params.minPrice >= 0) query.set("minPrice", String(params.minPrice));
  if (typeof params?.maxPrice === "number" && params.maxPrice >= 0) query.set("maxPrice", String(params.maxPrice));
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

export const unsubscribeFromNewsletter = async (token: string): Promise<{ message: string }> => {
  const query = new URLSearchParams({ token });
  return fetchJson<{ message: string }>(`/newsletter/unsubscribe?${query.toString()}`);
};

export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  const data = await fetchJson<BackendProductListResponse>("/products?limit=100&sort=ranked", undefined, true);
  return (data.products || []).map(normalizeAdminProduct);
};

export const uploadAdminProductImage = async (file: File): Promise<string> => {
  const body = new FormData();
  body.append("image", file);
  const data = await fetchJson<{ imageUrl: string }>("/products/upload-image", {
    method: "POST",
    body,
  }, true);
  return data.imageUrl;
};

export const createAdminProduct = async (payload: AdminProductInput): Promise<AdminProduct> => {
  const product = await fetchJson<BackendProduct>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
  return normalizeAdminProduct(product);
};

export const updateAdminProduct = async (id: string, payload: Partial<AdminProductInput>): Promise<AdminProduct> => {
  const product = await fetchJson<BackendProduct>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, true);
  return normalizeAdminProduct(product);
};

export const deleteAdminProduct = async (id: string): Promise<void> => {
  await fetchJson<void>(`/products/${id}`, { method: "DELETE" }, true);
};

export const getCategories = async (): Promise<CategoryRecord[]> => {
  const data = await fetchJson<BackendCategory[]>("/categories", undefined, true);
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
  }));
};

export const createCategory = async (payload: CategoryInput): Promise<CategoryRecord> => {
  const data = await fetchJson<BackendCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
  };
};

export const updateCategory = async (id: string, payload: CategoryInput): Promise<CategoryRecord> => {
  const data = await fetchJson<BackendCategory>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, true);
  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  await fetchJson<void>(`/categories/${id}`, { method: "DELETE" }, true);
};

export const getAdminOrders = async (): Promise<AdminOrder[]> => {
  const data = await fetchJson<BackendOrder[]>("/orders/all", undefined, true);
  return data.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount || 0),
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  }));
};

export const updateOrderStatus = async (id: string, status: AdminOrder["status"]): Promise<void> => {
  await fetchJson(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  }, true);
};

export const getContactSubmissions = async (): Promise<ContactRecord[]> => {
  return fetchJson<ContactRecord[]>("/contact", undefined, true);
};

export const getNewsletterSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  return fetchJson<NewsletterSubscriber[]>("/newsletter/subscribers", undefined, true);
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const data = await fetchJson<{ totalUsers?: number; totalProducts?: number; totalOrders?: number; totalRevenue?: number }>(
    "/analytics/dashboard",
    undefined,
    true,
  );
  return {
    users: Number(data.totalUsers || 0),
    products: Number(data.totalProducts || 0),
    orders: Number(data.totalOrders || 0),
    revenue: Number(data.totalRevenue || 0),
  };
};

export const getUsers = async (): Promise<BackendUser[]> => {
  const data = await fetchJson<{ users: BackendUser[] }>("/users?limit=100", undefined, true);
  return data.users || [];
};

export const updateUserRole = async (id: string, role: "user" | "admin" | "superadmin") => {
  return fetchJson(`/users/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  }, true);
};

export const createAdminAccount = async (payload: { name: string; email: string; password: string; phone?: string }) => {
  return fetchJson("/users/admin-account", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
};

export const requestPasswordReset = async (email: string) => {
  return fetchJson<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const confirmPasswordReset = async (payload: { email: string; otp: string; newPassword: string }) => {
  return fetchJson<{ message: string }>("/auth/reset-password/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  return fetchJson<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
};

export const deleteMyAccount = async () => {
  await fetchJson<void>("/users/me/account", { method: "DELETE" }, true);
  clearAuthSession();
};

export const updateMyProfile = async (payload: {
  name?: string;
  phone?: string;
  acceptedMarketing?: boolean;
  acceptedNewsletter?: boolean;
}) => {
  const session = getSession();
  if (!session) throw new Error("Authentication required");

  const updatedUser = await fetchJson<BackendUser>(`/users/${session.user.id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, true);

  setAuthSession({
    ...session,
    user: {
      ...session.user,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });

  return updatedUser;
};

// ============================================
// REFUND ENDPOINTS
// ============================================

interface Refund {
  id: string;
  orderId: string;
  orderNumber?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  reason: string;
  requestedAmount: number;
  approvedAmount?: number;
  rejectionReason?: string;
  updatedAt?: string;
  createdAt: string;
}

interface RefundsResponse {
  data: Refund[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

interface BackendRefund {
  id: string;
  orderId: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAmount: number | string;
  approvedAmount?: number | string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  Order?: {
    id?: string;
    orderNumber?: string;
  };
  order?: {
    id?: string;
    orderNumber?: string;
  };
}

const normalizeRefund = (refund: BackendRefund): Refund => {
  const notes = String(refund.adminNotes || "").trim();
  const status = refund.status;
  const rejectionReason = status === "rejected" && notes ? notes.split("\n")[0] : undefined;

  return {
    id: refund.id,
    orderId: refund.orderId,
    orderNumber: refund.Order?.orderNumber || refund.order?.orderNumber,
    reason: refund.reason,
    status,
    requestedAmount: Number(refund.requestedAmount || 0),
    approvedAmount: refund.approvedAmount == null ? undefined : Number(refund.approvedAmount),
    rejectionReason,
    createdAt: refund.createdAt,
    updatedAt: refund.updatedAt,
  };
};

export const getRefunds = async (limit = 10, offset = 0, status?: string) => {
  const url = `/refunds?limit=${limit}&offset=${offset}${status ? `&status=${status}` : ""}`;
  const response = await fetchJson<{ data: BackendRefund[]; pagination: RefundsResponse["pagination"] }>(url, {}, true);
  return {
    data: (response.data || []).map(normalizeRefund),
    pagination: response.pagination,
  };
};

export const getRefund = async (refundId: string) => {
  const response = await fetchJson<{ data: BackendRefund }>(`/refunds/${refundId}`, {}, true);
  return normalizeRefund(response.data);
};

export const createRefund = async (payload: {
  orderId: string;
  reason: string;
  requestedAmount?: number;
}) => {
  const response = await fetchJson<{ data: BackendRefund }>("/refunds", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
  return normalizeRefund(response.data);
};

// ============================================
// COUPON ENDPOINTS
// ============================================

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  expiresAt: string;
  isActive: boolean;
}

export const getCoupons = async () => {
  return fetchJson<{ data: Coupon[] }>("/coupons", {});
};

export const applyCoupon = async (code: string, orderTotal: number) => {
  return fetchJson<{
    code: string;
    discountAmount: number;
    finalTotal: number;
  }>("/coupons/apply", {
    method: "POST",
    body: JSON.stringify({ code, orderTotal }),
  });
};

export const validateCoupon = async (code: string) => {
  return fetchJson<Coupon>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
};

// ============================================
// ADMIN: USER MANAGEMENT
// ============================================

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
  isEmailVerified?: boolean;
}

interface AdminUsersResponse {
  data: AdminUser[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export const adminGetUsers = async (limit = 20, offset = 0, role?: string) => {
  const url = `/admin/users?limit=${limit}&offset=${offset}${role ? `&role=${role}` : ""}`;
  return fetchJson<AdminUsersResponse>(url, {}, true);
};

export const adminGetUser = async (userId: string) => {
  return fetchJson<AdminUser>(`/admin/users/${userId}`, {}, true);
};

export const adminUpdateUser = async (userId: string, payload: {
  role?: string;
  status?: "active" | "inactive";
}) => {
  return fetchJson<AdminUser>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, true);
};

export const adminDeleteUser = async (userId: string) => {
  return fetchJson<{ message: string }>(`/admin/users/${userId}`, {
    method: "DELETE",
  }, true);
};

// ============================================
// ADMIN: ORDER MANAGEMENT
// ============================================

interface AdminOrdersResponse {
  data: BackendOrder[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export const adminGetOrders = async (limit = 20, offset = 0, status?: string) => {
  const url = `/admin/orders?limit=${limit}&offset=${offset}${status ? `&status=${status}` : ""}`;
  return fetchJson<AdminOrdersResponse>(url, {}, true);
};

export const adminUpdateOrderStatus = async (orderId: string, status: string) => {
  return fetchJson<BackendOrder>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }, true);
};

// ============================================
// ADMIN: INVENTORY MANAGEMENT
// ============================================

interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  sku: string;
  reorderLevel: number;
  product?: {
    id: string;
    name: string;
    sku?: string;
    price?: number;
  };
}

interface InventoryResponse {
  data: Inventory[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export const adminGetInventory = async (limit = 20, offset = 0) => {
  const url = `/inventory?limit=${limit}&offset=${offset}`;
  return fetchJson<InventoryResponse>(url, {}, true);
};

export const adminAdjustInventory = async (productId: string, payload: {
  quantity: number;
  reason: string;
}) => {
  return fetchJson<Inventory>(`/inventory/${productId}/adjust`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
};

export const adminGetReorderItems = async () => {
  return fetchJson<{ data: Inventory[] }>("/inventory/reorder/items", {}, true);
};

// ============================================
// ADMIN: COUPON MANAGEMENT
// ============================================

interface AdminCouponPayload {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  minOrderAmount?: number;
  expiresAt: string;
}

interface AdminCouponsResponse {
  data: Coupon[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export const adminGetCoupons = async (limit = 20, offset = 0) => {
  const url = `/coupons/admin/all?limit=${limit}&offset=${offset}`;
  return fetchJson<AdminCouponsResponse>(url, {}, true);
};

export const adminCreateCoupon = async (payload: AdminCouponPayload) => {
  return fetchJson<Coupon>("/coupons/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
};

export const adminUpdateCoupon = async (couponId: string, payload: Partial<AdminCouponPayload>) => {
  return fetchJson<Coupon>(`/coupons/admin/${couponId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, true);
};

export const adminDeleteCoupon = async (couponId: string) => {
  return fetchJson<{ message: string }>(`/coupons/admin/${couponId}`, {
    method: "DELETE",
  }, true);
};

// ============================================
// ADMIN: DASHBOARD & ANALYTICS
// ============================================

export const adminGetDashboard = async () => {
  return fetchJson<any>("/admin/dashboard", {}, true);
};

export const adminGetAnalytics = async (period = "week") => {
  return fetchJson<any>(`/admin/analytics?period=${period}`, {}, true);
};

// ============================================
// ADMIN: AUDIT LOGS
// ============================================

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  status: string;
  changes?: unknown;
  createdAt: string;
}

interface AuditLogsResponse {
  data: AuditLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export const adminGetAuditLogs = async (limit = 50, offset = 0, action?: string) => {
  const url = `/admin/audit-logs?limit=${limit}&offset=${offset}${action ? `&action=${action}` : ""}`;
  return fetchJson<AuditLogsResponse>(url, {}, true);
};

export const adminExportAuditLogs = async () => {
  const session = getSession();
  if (!session) throw new Error("Authentication required");

  const response = await fetch(
    `${getApiBaseUrls()[0]}/admin/audit-logs/export/csv`,
    {
      headers: { Authorization: `Bearer ${session.token}` },
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
};
