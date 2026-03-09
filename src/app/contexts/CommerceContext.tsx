import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../types/product";
import {
  addItemToCart,
  addToWishlist as addToWishlistApi,
  clearMyCart,
  getAuthSession,
  getMyCart,
  getMyWishlist,
  removeCartItem,
  removeFromWishlist as removeFromWishlistApi,
  updateCartItem as updateCartItemApi,
} from "../services/api";

interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
}

interface CommerceContextValue {
  cartItems: CartItem[];
  wishlist: Product[];
  cartCount: number;
  wishlistCount: number;
  subtotal: number;
  conversionBaseFee: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
}

const CART_KEY = "revive_roots_cart";
const WISHLIST_KEY = "revive_roots_wishlist";

const CommerceContext = createContext<CommerceContextValue | undefined>(undefined);

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const inferCategory = (name: string): Product["category"] => {
  const value = name.toLowerCase();
  if (value.includes("hair")) return "hair";
  return "skincare";
};

const normalizeProductShape = (product: Product): Product => ({
  ...product,
  backendId: product.backendId || product.id,
  currency: product.currency || "NGN",
  images: Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []),
});

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(CART_KEY, []).map((item) => ({
      ...item,
      product: normalizeProductShape(item.product),
    })),
  );
  const [wishlist, setWishlist] = useState<Product[]>(() =>
    readStorage<Product[]>(WISHLIST_KEY, []).map((item) => normalizeProductShape(item)),
  );
  const [conversionBaseFee, setConversionBaseFee] = useState(0);
  const [authToken, setAuthToken] = useState(() => getAuthSession()?.token || "");

  const isAuthenticated = Boolean(authToken);

  const syncRemoteCommerce = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const [remoteCart, remoteWishlist] = await Promise.all([getMyCart(), getMyWishlist()]);

      const mappedCart: CartItem[] = (remoteCart.items || []).map((item) => ({
        id: item.id,
        quantity: Number(item.quantity || 1),
        product: {
          id: item.productId,
          backendId: item.productId,
          name: item.name,
          currency: item.currency || "NGN",
          category: inferCategory(item.name),
          price: Number(item.price || 0),
          image: item.image || "",
          images: item.image ? [item.image] : [],
          description: "",
          ingredients: [],
          benefits: [],
          howToUse: "Use as directed on product packaging.",
          size: "Standard",
        },
      }));

      setCartItems(mappedCart);
      setConversionBaseFee(Number(remoteCart.conversionBaseFee || 0));
      setWishlist(remoteWishlist.map((item) => normalizeProductShape(item)));
    } catch {
      // Keep current in-memory data if sync fails.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const onAuthChanged = () => setAuthToken(getAuthSession()?.token || "");
    window.addEventListener("revive-roots-auth-changed", onAuthChanged);
    return () => window.removeEventListener("revive-roots-auth-changed", onAuthChanged);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems(readStorage<CartItem[]>(CART_KEY, []).map((item) => ({
        ...item,
        product: normalizeProductShape(item.product),
      })));
      setWishlist(readStorage<Product[]>(WISHLIST_KEY, []).map((item) => normalizeProductShape(item)));
      return;
    }
    void syncRemoteCommerce();
  }, [isAuthenticated, syncRemoteCommerce]);

  useEffect(() => {
    if (!isAuthenticated) {
      setConversionBaseFee(0);
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const addToCart = (product: Product, quantity = 1) => {
    const safeProduct = normalizeProductShape(product);

    setCartItems((current) => {
      const existing = current.find((item) => item.product.id === safeProduct.id);
      if (!existing) return [...current, { product: safeProduct, quantity }];

      return current.map((item) =>
        item.product.id === safeProduct.id
          ? { ...item, quantity: Math.max(1, item.quantity + quantity) }
          : item,
      );
    });

    if (isAuthenticated) {
      const backendProductId = safeProduct.backendId || safeProduct.id;
      void addItemToCart({ productId: backendProductId, quantity })
        .then(() => syncRemoteCommerce())
        .catch(() => syncRemoteCommerce());
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const item = cartItems.find((entry) => entry.product.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      setCartItems((current) => current.filter((entry) => entry.product.id !== productId));
      if (isAuthenticated && item.id) {
        void removeCartItem(item.id)
          .then(() => syncRemoteCommerce())
          .catch(() => syncRemoteCommerce());
      }
      return;
    }

    setCartItems((current) =>
      current.map((entry) =>
        entry.product.id === productId ? { ...entry, quantity: Math.min(100, quantity) } : entry,
      ),
    );

    if (isAuthenticated && item.id) {
      void updateCartItemApi(item.id, Math.min(100, quantity))
        .then(() => syncRemoteCommerce())
        .catch(() => syncRemoteCommerce());
    }
  };

  const removeFromCart = (productId: string) => {
    const item = cartItems.find((entry) => entry.product.id === productId);
    setCartItems((current) => current.filter((entry) => entry.product.id !== productId));

    if (isAuthenticated && item?.id) {
      void removeCartItem(item.id)
        .then(() => syncRemoteCommerce())
        .catch(() => syncRemoteCommerce());
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setConversionBaseFee(0);
    if (isAuthenticated) {
      void clearMyCart()
        .then(() => syncRemoteCommerce())
        .catch(() => syncRemoteCommerce());
    }
  };

  const toggleWishlist = (product: Product) => {
    const safeProduct = normalizeProductShape(product);
    const exists = wishlist.some((item) => item.id === safeProduct.id);

    setWishlist((current) => {
      if (exists) return current.filter((item) => item.id !== safeProduct.id);
      return [safeProduct, ...current];
    });

    if (isAuthenticated) {
      const backendProductId = safeProduct.backendId || safeProduct.id;
      const request = exists
        ? removeFromWishlistApi(backendProductId)
        : addToWishlistApi(backendProductId);
      void request.then(() => syncRemoteCommerce()).catch(() => syncRemoteCommerce());
    }
  };

  const isWishlisted = (productId: string) => wishlist.some((item) => item.id === productId);

  const value = useMemo(() => {
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return {
      cartItems,
      wishlist,
      cartCount,
      wishlistCount: wishlist.length,
      subtotal,
      conversionBaseFee,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted,
    };
  }, [cartItems, wishlist, conversionBaseFee]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error("useCommerce must be used within CommerceProvider");
  }
  return context;
};
