export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  emoji: string;
  image?: string;
  badge: 'organic' | 'new' | string | null;
  unit: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface User {
  name: string;
  email: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  items: CartItem[];
  slot: string;
  status: 'Processing' | 'Out for Delivery' | 'Delivered' | string;
  address?: {
    firstName?: string;
    lastName?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
  paymentMethod?: string;
  promoDiscount?: number;
  deliveryFee?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  count: number;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  status: 'New' | 'Replied' | 'Resolved';
}
