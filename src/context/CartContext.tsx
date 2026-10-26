'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // Unique string combining name and size (e.g. "Silken Oud-100 ml")
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: { name: string; category: string; price: string | number; image: string }, size: string, quantity?: number, coords?: { x: number; y: number }) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartCount: number;
  cartTotal: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCouponState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('eternyx_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error('Failed to parse cart items:', err);
      }
    }
    const storedCoupon = localStorage.getItem('eternyx_applied_coupon');
    if (storedCoupon) {
      setAppliedCouponState(storedCoupon);
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('eternyx_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    setAppliedCouponState(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eternyx_applied_coupon', clean);
    }
  };

  const removeCoupon = () => {
    setAppliedCouponState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eternyx_applied_coupon');
    }
  };

  const addToCart = (
    product: { name: string; category: string; price: string | number; image: string },
    size: string,
    quantity: number = 1,
    coords?: { x: number; y: number }
  ) => {
    const cleanPrice = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[^0-9.]/g, ''))
      : Number(product.price);

    const itemId = `${product.name}-${size}`;

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(item => item.id === itemId);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      }

      return [
        ...prevItems,
        {
          id: itemId,
          productId: product.name,
          name: product.name,
          category: product.category,
          price: cleanPrice,
          image: product.image,
          size,
          quantity
        }
      ];
    });

    // Dispatch fly-to-cart particle event if starting coordinates are provided
    if (coords) {
      const event = new CustomEvent('eternyx_cart_item_added', {
        detail: { coords, image: product.image }
      });
      window.dispatchEvent(event);
    }

    // Automatically open the cart drawer when an item is added is disabled to allow continuous browsing
  };

  const removeFromCart = (productId: string, size: string) => {
    const itemId = `${productId}-${size}`;
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    const itemId = `${productId}-${size}`;
    setCartItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Safe client-side SSR hydration defaults
  const cartCount = mounted ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
  const cartTotal = mounted ? cartItems.reduce((total, item) => total + item.price * item.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems: mounted ? cartItems : [],
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        cartTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
