'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

function project(initialVelocity: number, decelerationRate = 0.998): number {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

export default function AccountDrawer() {
  const { user, orders, isAccountOpen, setIsAccountOpen, logout, setSelectedOrderForTracking, triggerHaptic } = useStore();

  const drawerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHorizontalRef = useRef<boolean | null>(null);
  const historyRef = useRef<{ x: number; t: number }[]>([]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isAccountOpen) return;
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
        setIsAccountOpen(false);
      }
    }

    setDragOffset(null);
    isHorizontalRef.current = null;
  };

  return (
    <>
      <div
        className={`cart-overlay ${isAccountOpen ? 'active' : ''}`}
        id="account-overlay"
        onClick={() => setIsAccountOpen(false)}
        style={{
          opacity: dragOffset !== null && dragOffset > 0
            ? Math.max(0, 1 - (dragOffset / 440) * 0.95)
            : undefined,
        }}
      />

      <div
        ref={drawerRef}
        className={`cart-drawer ${isAccountOpen ? 'open' : ''} ${dragOffset !== null ? 'dragging' : ''}`}
        id="account-drawer"
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
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
            My Account
          </h3>
          <button
            className="cart-close-btn"
            onClick={() => setIsAccountOpen(false)}
            aria-label="Close account"
          >
            ✕
          </button>
        </div>

        <div className="cart-items" style={{ padding: '20px' }}>
          {/* User info block */}
          <div
            id="account-user-info"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px',
              background: 'var(--green-50)',
              borderRadius: '14px',
              marginBottom: '16px',
            }}
          >
            <div
              className="account-avatar"
              style={{
                width: '48px',
                height: '48px',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              )}
            </div>
            <div>
              <div
                className="account-name"
                style={{
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {user ? user.name : 'Guest User'}
              </div>
              <div
                className="account-email"
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
              >
                {user ? user.email : 'Not signed in'}
              </div>
            </div>
          </div>

          {/* Login or Logout */}
          {!user ? (
            <div id="account-login-prompt" style={{ textAlign: 'center', padding: '16px 0' }}>
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '14px',
                }}
              >
                Sign in to view orders, manage wishlist, and get exclusive supermarket deals!
              </p>
              <Link
                href="/auth"
                onClick={() => setIsAccountOpen(false)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '13px',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)',
                  textAlign: 'center',
                }}
              >
                Sign In / Create Account
              </Link>
            </div>
          ) : (
            <button
              id="account-logout-btn"
              onClick={logout}
              style={{
                width: '100%',
                padding: '11px',
                border: '1.5px solid #fecaca',
                borderRadius: '10px',
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '0.88rem',
                background: '#fff',
                marginBottom: '16px',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          )}

          {/* Order History */}
          {user && (
            <div id="account-orders-section" style={{ marginTop: '16px' }}>
              <div
                style={{
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                }}
              >
                Recent Orders ({orders.length})
              </div>

              {orders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                  No orders yet. Start shopping!
                </p>
              ) : (
                <div id="account-orders-list">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        background: 'var(--bg-body)',
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        marginBottom: '12px',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.92rem' }}>
                          #{o.id}
                        </span>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          Rs. {o.total.toFixed(2)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <span>Slot: {o.slot}</span>
                        <span>•</span>
                        <span>{o.items.length} item(s)</span>
                        <span>•</span>
                        <span>{o.date}</span>
                      </div>

                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            backgroundColor:
                              o.status === 'Delivered'
                                ? '#dcfce7'
                                : o.status === 'Out for Delivery'
                                ? '#dbeafe'
                                : '#fef3c7',
                            color:
                              o.status === 'Delivered'
                                ? '#15803d'
                                : o.status === 'Out for Delivery'
                                ? '#1d4ed8'
                                : '#b45309',
                          }}
                        >
                          {o.status === 'Delivered' ? '✅ Delivered' : o.status === 'Out for Delivery' ? '🛵 Out for Delivery' : '📦 Processing'}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForTracking(o);
                            setIsAccountOpen(false);
                            triggerHaptic('light');
                          }}
                          style={{
                            background: 'var(--green-50)',
                            border: '1px solid var(--green-300)',
                            color: 'var(--green-700)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '5px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>Track & Receipt</span>
                          <span>➔</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
