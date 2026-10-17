import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import CartDrawer from '@/components/CartDrawer';
import WishlistDrawer from '@/components/WishlistDrawer';
import AccountDrawer from '@/components/AccountDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';
import Toast from '@/components/Toast';

export const metadata: Metadata = {
  title: 'FreshMart — Your Freshest Supermarket Online',
  description:
    'Shop fresh fruits, vegetables, dairy, bakery, meat, beverages, snacks, personal care, and household products at FreshMart. Best prices, organic quality, delivered to your door in 2 hours.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <StoreProvider>
          {children}
          <CartDrawer />
          <WishlistDrawer />
          <AccountDrawer />
          <CheckoutModal />
          <OrderTrackingModal />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
