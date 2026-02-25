import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useCurrency } from './CurrencyContext';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  currency?: string;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  currency: string;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState('NGN');
  const { isAuthenticated } = useAuth();
  const { currencyOverride } = useCurrency();

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, currencyOverride]);

  const refreshCart = async () => {
    try {
      const cartData = await cartAPI.getCart();
      setItems(cartData.items || []);
      setCurrency(cartData.currency || 'NGN');
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    await cartAPI.addToCart({ productId, quantity });
    await refreshCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    await cartAPI.updateCartItem(itemId, quantity);
    await refreshCart();
  };

  const removeFromCart = async (itemId: string) => {
    await cartAPI.removeFromCart(itemId);
    await refreshCart();
  };

  const clearCart = async () => {
    await cartAPI.clearCart();
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        currency,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
