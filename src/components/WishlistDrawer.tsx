'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ALL_PRODUCTS } from '@/data/products';

function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

function project(initialVelocity: number, decelerationRate = 0.998): number {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

export default function WishlistDrawer() {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist, addToCart, triggerHaptic } = useStore();

  const drawerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHorizontalRef = useRef<boolean | null>(null);
  const historyRef = useRef<{ x: number; t: number }[]>([]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isWishlistOpen) return;
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;

    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    historyRef.current = [{ x: e.clientX, t: performance.now() }];
    isHorizontalRef.current = null;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;

    if (isHorizontalRef.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalRef.current = Math.abs(deltaX) > Math.abs(deltaY);
        if (!isHorizontalRef.current) {
          isDraggingRef.current = false;
          return;
        }
      } else {
        return;
      }
    }

    if (!isHorizontalRef.current) return;

    const width = drawerRef.current?.offsetWidth || 440;
    const now = performance.now();
    historyRef.current.push({ x: e.clientX, t: now });
    if (historyRef.current.length > 5) historyRef.current.shift();

    let translateX = deltaX;
    if (deltaX < 0) {
      translateX = rubberband(deltaX, width, 0.55);
    }

    setDragOffset(translateX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (isHorizontalRef.current && dragOffset !== null) {
      const now = performance.now();
      historyRef.current.push({ x: e.clientX, t: now });
      const recent = historyRef.current.filter((p) => now - p.t < 150);
      let velocity = 0;
      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const dt = (last.t - first.t) / 1000;
        if (dt > 0) velocity = (last.x - first.x) / dt;
      }

      const width = drawerRef.current?.offsetWidth || 440;
      const projectedEndpoint = dragOffset + project(velocity, 0.998);

      if (velocity > 380 || (velocity >= 0 && projectedEndpoint > width * 0.4) || dragOffset > width * 0.5) {
        triggerHaptic('light');
        setIsWishlistOpen(false);
      }
    }

    setDragOffset(null);
    isHorizontalRef.current = null;
  };

  const wishlistedProducts = wishlist
    .map((id) => ALL_PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as typeof ALL_PRODUCTS;

  return (
    <>
      <div
        className={`cart-overlay ${isWishlistOpen ? 'active' : ''}`}
        id="wishlist-overlay"
        onClick={() => setIsWishlistOpen(false)}
        style={{
          opacity: dragOffset !== null && dragOffset > 0
            ? Math.max(0, 1 - (dragOffset / 440) * 0.95)
            : undefined,
        }}
      />

      <div
        ref={drawerRef}
        className={`cart-drawer ${isWishlistOpen ? 'open' : ''} ${dragOffset !== null ? 'dragging' : ''}`}
        id="wishlist-drawer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: dragOffset !== null ? `translateX(${Math.max(dragOffset, -60)}px)` : undefined,
        }}
      >
        <div className="drawer-handle" aria-hidden="true"></div>

        <div className="cart-drawer-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            Wishlist ({wishlist.length})
          </h3>
          <button
            className="cart-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist"
          >
            ✕
          </button>
        </div>

        <div className="cart-items" id="wishlist-drawer-items">
          {wishlistedProducts.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <p>Your wishlist is empty</p>
              <span>Save items you love to shop them anytime!</span>
            </div>
          ) : (
            wishlistedProducts.map((p) => (
              <div className="cart-item" key={p.id}>
                <div className="cart-item-img" style={{ position: 'relative', overflow: 'hidden' }}>
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill sizes="52px" style={{ objectFit: 'cover' }} />
                  ) : (
                    p.emoji
                  )}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{p.name}</div>
                  <div className="cart-item-price">Rs. {p.price.toFixed(2)}</div>
                  <div className="cart-item-qty-row">
                    <button
                      className="add-to-cart-btn"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => {
                        addToCart(p.id);
                        setIsWishlistOpen(false);
                      }}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="cart-item-remove"
                      onClick={() => toggleWishlist(p.id)}
                      aria-label="Remove from wishlist"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
