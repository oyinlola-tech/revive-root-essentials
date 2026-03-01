import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../types/product";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CommerceContextValue {
  cartItems: CartItem[];
  wishlist: Product[];
  cartCount: number;
  wishlistCount: number;
  subtotal: number;
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

const normalizeProductShape = (product: Product): Product => ({
  ...product,
  backendId: product.backendId || product.id,
  currency: product.currency || "NGN",
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

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) return [...current, { product, quantity }];

      return current.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: Math.max(1, item.quantity + quantity) }
          : item,
      );
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((current) => current.filter((item) => item.product.id !== productId));
      return;
    }
    setCartItems((current) =>
      current.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.min(100, quantity) } : item,
      ),
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCartItems([]);

  const toggleWishlist = (product: Product) => {
    setWishlist((current) => {
      const exists = current.some((item) => item.id === product.id);
      if (exists) return current.filter((item) => item.id !== product.id);
      return [product, ...current];
    });
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
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted,
    };
  }, [cartItems, wishlist]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error("useCommerce must be used within CommerceProvider");
  }
  return context;
};
