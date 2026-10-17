'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order } from '@/types';
import { ALL_PRODUCTS } from '@/data/products';

interface StoreContextType {
  products: Product[];
  refreshProducts: () => Promise<void>;
  cart: CartItem[];
  wishlist: number[];
  user: User | null;
  orders: Order[];
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isAccountOpen: boolean;
  isCheckoutOpen: boolean;
  toast: { message: string; emoji: string } | null;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsAccountOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  addToCart: (productId: number, qty?: number) => void;
  changeQty: (productId: number, delta: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: number) => void;
  showToast: (message: string, emoji?: string) => void;
  login: (user: User) => void;
  logout: () => void;
  addOrder: (order: Order) => void;
  selectedOrderForTracking: Order | null;
  setSelectedOrderForTracking: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  reorderItems: (items: CartItem[]) => void;
  triggerHaptic: (type?: 'light' | 'success' | 'remove' | 'warning' | 'error') => void;
  subtotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; emoji: string } | null>(null);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load products in StoreContext:', err);
    }
  };

  useEffect(() => {
    refreshProducts();
    const handleFocus = () => refreshProducts();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('freshmart-products-updated', refreshProducts);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('freshmart-products-updated', refreshProducts);
    };
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('freshmart-cart');
      if (storedCart) setCart(JSON.parse(storedCart));

      const storedWishlist = localStorage.getItem('freshmart-wishlist');
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

      const storedUser = localStorage.getItem('freshmart-user');
      if (storedUser) setUser(JSON.parse(storedUser));

      // Clear legacy global un-scoped orders key
      localStorage.removeItem('freshmart-orders');
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('freshmart-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('freshmart-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Handle user login/logout & scope orders strictly to the current user
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem('freshmart-user', JSON.stringify(user));
      const userOrdersKey = `freshmart-orders-${user.email.toLowerCase().trim()}`;

      // 1. Load user's own cached orders
      try {
        const cached = localStorage.getItem(userOrdersKey);
        if (cached) {
          setOrders(JSON.parse(cached));
        } else {
          setOrders([]);
        }
      } catch (e) {
        setOrders([]);
      }

      // 2. Fetch user's own orders from database
      fetch(`/api/orders?email=${encodeURIComponent(user.email.toLowerCase().trim())}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && Array.isArray(resData.data)) {
            setOrders(resData.data);
            localStorage.setItem(userOrdersKey, JSON.stringify(resData.data));
          }
        })
        .catch((err) => console.error('Failed to fetch user orders:', err));
    } else {
      // Guest or logged-out: reset orders immediately
      localStorage.removeItem('freshmart-user');
      setOrders([]);
    }
  }, [user]);

  // Persist current user's orders
  useEffect(() => {
    if (user && user.email) {
      const userOrdersKey = `freshmart-orders-${user.email.toLowerCase().trim()}`;
      localStorage.setItem(userOrdersKey, JSON.stringify(orders));
    }
  }, [orders, user]);

  const triggerHaptic = (type: 'light' | 'success' | 'remove' | 'warning' | 'error' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'light') navigator.vibrate(10);
        else if (type === 'success') navigator.vibrate([12, 40, 15]);
        else if (type === 'remove') navigator.vibrate([25, 40, 25]);
        else if (type === 'warning') navigator.vibrate([20, 30, 20]);
        else if (type === 'error') navigator.vibrate([40, 50, 40, 50, 40]);
      } catch (err) {}
    }
  };

  const showToast = (message: string, emoji = '✅') => {
    setToast({ message, emoji });
  };

  const addToCart = (productId: number, qty = 1) => {
    const product = products.find((p) => p.id === productId) || ALL_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        showToast(`${product.name} quantity updated`, '🛒');
        return prev.map((item) =>
          item.id === productId ? { ...item, qty: item.qty + qty } : item
        );
      } else {
        showToast(`${product.name} added to cart!`, '🛒');
        return [...prev, { ...product, qty }];
      }
    });
    triggerHaptic('light');
  };

  const changeQty = (productId: number, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (!existing) return prev;
      if (existing.qty + delta <= 0) {
        triggerHaptic('remove');
        return prev.filter((item) => item.id !== productId);
      }
      triggerHaptic('light');
      return prev.map((item) =>
        item.id === productId ? { ...item, qty: item.qty + delta } : item
      );
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    triggerHaptic('remove');
    showToast('Item removed from cart', '🗑');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        triggerHaptic('remove');
        showToast('Removed from wishlist', '🤍');
        return prev.filter((id) => id !== productId);
      } else {
        triggerHaptic('light');
        showToast('Added to wishlist!', '❤️');
        return [...prev, productId];
      }
    });
  };

  const login = (newUser: User) => {
    setOrders([]);
    setUser(newUser);
    showToast(`Welcome back, ${newUser.name}! 👋`, '🌿');
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
    showToast('Signed out successfully', '👋');
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    triggerHaptic('success');

    // Persist to Supabase backend database via API route
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: order.id,
        total: order.total,
        slot: order.slot,
        items: order.items,
        userEmail: user?.email,
        customerName: order.address?.firstName
          ? `${order.address.firstName} ${order.address.lastName || ''}`.trim()
          : user?.name,
        customerPhone: order.address?.phone,
        deliveryAddress: order.address?.street,
        city: order.address?.city,
        state: order.address?.state,
        pincode: order.address?.pincode,
        paymentMethod: order.paymentMethod,
      }),
    }).catch((err) => console.error('Failed to sync order with backend DB:', err));
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    setSelectedOrderForTracking((prev) =>
      prev && prev.id === orderId ? { ...prev, status } : prev
    );
    triggerHaptic('success');
    showToast(`Order #${orderId}: ${status}`, '🛵');
  };

  const reorderItems = (items: CartItem[]) => {
    setCart((prev) => {
      const updated = [...prev];
      items.forEach((item) => {
        const existing = updated.find((x) => x.id === item.id);
        if (existing) {
          existing.qty += item.qty;
        } else {
          updated.push({ ...item });
        }
      });
      return updated;
    });
    setSelectedOrderForTracking(null);
    setIsCartOpen(true);
    triggerHaptic('success');
    showToast(`${items.length} item(s) added back to your cart!`, '🛒');
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        refreshProducts,
        cart,
        wishlist,
        user,
        orders,
        selectedOrderForTracking,
        setSelectedOrderForTracking,
        updateOrderStatus,
        reorderItems,
        isCartOpen,
        isWishlistOpen,
        isAccountOpen,
        isCheckoutOpen,
        toast,
        setIsCartOpen,
        setIsWishlistOpen,
        setIsAccountOpen,
        setIsCheckoutOpen,
        addToCart,
        changeQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        showToast,
        login,
        logout,
        addOrder,
        triggerHaptic,
        subtotal,
        cartCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
