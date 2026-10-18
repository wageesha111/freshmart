'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

function project(initialVelocity: number, decelerationRate = 0.998): number {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

export default function CartDrawer() {
  const {
    user,
    cart,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    changeQty,
    removeFromCart,
    subtotal,
    showToast,
    triggerHaptic,
  } = useStore();

  const [showAuthModal, setShowAuthModal] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHorizontalRef = useRef<boolean | null>(null);
  const historyRef = useRef<{ x: number; t: number }[]>([]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isCartOpen) return;
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a, .qty-btn, .cart-item-remove')) return;

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
        setIsCartOpen(false);
      }
    }

    setDragOffset(null);
    isHorizontalRef.current = null;
  };

  const deliveryThreshold = 499;
  const isFreeDelivery = subtotal >= deliveryThreshold;
  const amountToFree = deliveryThreshold - subtotal;

  return (
    <>
      <div
        ref={overlayRef}
        className={`cart-overlay ${isCartOpen ? 'active' : ''}`}
        id="cart-overlay"
        onClick={() => setIsCartOpen(false)}
        style={{
          opacity: dragOffset !== null && dragOffset > 0
            ? Math.max(0, 1 - (dragOffset / 440) * 0.95)
            : undefined,
        }}
      />

      <div
        ref={drawerRef}
        className={`cart-drawer ${isCartOpen ? 'open' : ''} ${dragOffset !== null ? 'dragging' : ''}`}
        id="cart-drawer"
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            Your Cart ({cart.reduce((a, b) => a + b.qty, 0)})
          </h3>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="cart-items" id="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty" id="cart-empty">
              <div className="cart-empty-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              <p>Your cart is empty</p>
              <span>Add some fresh items from our catalog!</span>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-img" style={{ position: 'relative', overflow: 'hidden' }}>
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="52px" style={{ objectFit: 'cover' }} />
                  ) : (
                    item.emoji
                  )}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">Rs. {item.price.toFixed(2)}</div>
                  <div className="cart-item-qty-row">
                    <button
                      className="qty-btn"
                      onClick={() => changeQty(item.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-val">{item.qty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => changeQty(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <strong id="cart-subtotal">Rs. {subtotal.toFixed(2)}</strong>
            </div>

            <div className="cart-delivery-note">
              {isFreeDelivery ? (
                <span>You have unlocked <strong>FREE Delivery</strong>!</span>
              ) : (
                <span>Add Rs. {amountToFree.toFixed(2)} more for <strong>FREE Delivery</strong></span>
              )}
            </div>

            <button
              className="btn-checkout"
              onClick={() => {
                if (!user) {
                  triggerHaptic('warning');
                  showToast('Please sign up or sign in to place an order', '⚠️');
                  setShowAuthModal(true);
                  return;
                }
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              Proceed to Checkout →
            </button>
            <button
              className="btn-continue-shopping"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* POPUP: FIRST SIGN UP TO PLACE ORDER */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
              padding: '32px 28px',
              textAlign: 'center',
              border: '1px solid rgba(226, 232, 240, 0.8)',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                margin: '0 auto 16px',
                border: '2px solid #fde68a',
              }}
            >
              🔒
            </div>

            <h3
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '10px',
                fontFamily: 'var(--font-display)',
              }}
            >
              Sign Up First to Place Order!
            </h3>

            <p
              style={{
                fontSize: '0.92rem',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              You need an account to place an order, view order receipts, and track live delivery. Please sign up or sign in to complete your checkout!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/auth?redirect=checkout&tab=signup"
                onClick={() => {
                  setShowAuthModal(false);
                  setIsCartOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--green-600)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                }}
              >
                Create Account (Sign Up) →
              </Link>

              <Link
                href="/auth?redirect=checkout&tab=signin"
                onClick={() => {
                  setShowAuthModal(false);
                  setIsCartOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  textDecoration: 'none',
                  border: '1.5px solid var(--border)',
                }}
              >
                Already have an account? Sign In
              </Link>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '4px',
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
