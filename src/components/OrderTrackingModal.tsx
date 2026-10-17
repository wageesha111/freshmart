'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { Order } from '@/types';

const STAGES = [
  { id: 'placed', title: 'Order Placed', desc: 'Received & verified by fulfillment team', icon: '📝' },
  { id: 'packed', title: 'Packed at Hub', desc: 'Fresh farm produce weighed and sealed', icon: '🧺' },
  { id: 'out', title: 'Out for Delivery', desc: 'Assigned to express electric courier', icon: '🛵' },
  { id: 'delivered', title: 'Delivered', desc: 'Handed over safely at your doorstep', icon: '🏡' },
];

function getStageIndex(status: string): number {
  const s = status.toLowerCase();
  if (s.includes('deliver') && !s.includes('out') && !s.includes('way')) return 3;
  if (s.includes('out') || s.includes('way')) return 2;
  if (s.includes('pack')) return 1;
  return 0; // Processing / Placed
}

export default function OrderTrackingModal() {
  const {
    selectedOrderForTracking,
    setSelectedOrderForTracking,
    updateOrderStatus,
    reorderItems,
    triggerHaptic,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'track' | 'invoice'>('track');

  const orderId = selectedOrderForTracking?.id;
  const orderStatus = selectedOrderForTracking?.status;

  // Poll for live status updates from Admin dispatch
  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;
    const pollStatus = async () => {
      try {
        const res = await fetch('/api/orders?admin=true');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && isMounted) {
          const found = data.data.find((o: any) => o.id === orderId);
          if (found && found.status !== orderStatus) {
            updateOrderStatus(orderId, found.status);
            triggerHaptic('success');
          }
        }
      } catch (e) {
        // silent poll
      }
    };

    pollStatus();
    const timer = setInterval(pollStatus, 2500);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [orderId, orderStatus, updateOrderStatus, triggerHaptic]);

  if (!selectedOrderForTracking) return null;

  const order = selectedOrderForTracking;
  const currentStageIndex = getStageIndex(order.status);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const getStatusColor = () => {
    if (currentStageIndex === 3) return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    if (currentStageIndex === 2) return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' };
    return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
  };

  const statusColor = getStatusColor();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedOrderForTracking(null);
      }}
    >
      <div
        className="order-tracking-modal"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Order #{order.id}
              </span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: statusColor.bg,
                  color: statusColor.text,
                  border: `1px solid ${statusColor.border}`,
                }}
              >
                {order.status}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Placed on {order.date} • {order.items.length} item(s)
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedOrderForTracking(null)}
            aria-label="Close modal"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: '#64748b',
              transition: 'background-color 0.15s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Toggle: Track vs Receipt */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'track' ? '#ffffff' : 'transparent',
              color: activeTab === 'track' ? 'var(--primary)' : '#64748b',
              borderBottom: activeTab === 'track' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            🛵 Live Delivery Tracker
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'invoice' ? '#ffffff' : 'transparent',
              color: activeTab === 'invoice' ? 'var(--primary)' : '#64748b',
              borderBottom: activeTab === 'invoice' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            🧾 Itemized Receipt / Invoice
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeTab === 'track' ? (
            /* ================= TRACKING VIEW ================= */
            <div>
              {/* ETA Highlight Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--green-50), #f0fdf4)',
                  border: '1.5px solid var(--green-200)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--green-800)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {currentStageIndex === 3 ? '🎉 Delivery Completed' : '⚡ Expected Delivery'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {currentStageIndex === 3
                      ? 'Delivered to your door'
                      : currentStageIndex === 2
                      ? 'Arriving in ~15-20 mins'
                      : order.slot || 'Standard Express'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    Slot: {order.slot || 'Today 2–4pm'}
                  </div>
                </div>

                {/* Live dispatch status badge managed by admin */}
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: statusColor.bg,
                    border: `1px solid ${statusColor.border}`,
                    color: statusColor.text,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: statusColor.text,
                      display: 'inline-block',
                    }}
                  />
                  <span>Live: {order.status}</span>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div style={{ position: 'relative', paddingLeft: '8px', marginBottom: '24px' }}>
                {STAGES.map((stage, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div
                      key={stage.id}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        position: 'relative',
                        paddingBottom: idx === STAGES.length - 1 ? '0' : '28px',
                      }}
                    >
                      {/* Vertical line connector */}
                      {idx !== STAGES.length - 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '19px',
                            top: '38px',
                            bottom: '0',
                            width: '3px',
                            backgroundColor: idx < currentStageIndex ? 'var(--green-600)' : '#e2e8f0',
                            transition: 'background-color 0.3s ease',
                          }}
                        />
                      )}

                      {/* Stage Circle Icon */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? 'var(--green-600)' : '#f1f5f9',
                          color: isDone ? '#ffffff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isDone ? '1.1rem' : '1rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none',
                          transition: 'all 0.3s ease',
                          zIndex: 2,
                        }}
                      >
                        {isDone ? (isCurrent ? stage.icon : '✓') : idx + 1}
                      </div>

                      {/* Stage Content */}
                      <div style={{ flex: 1, paddingTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: isCurrent ? 800 : 700,
                              color: isDone ? 'var(--text-primary)' : '#94a3b8',
                            }}
                          >
                            {stage.title}
                          </span>
                          {isCurrent && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: 'var(--green-700)',
                                backgroundColor: 'var(--green-100)',
                                padding: '2px 8px',
                                borderRadius: '999px',
                              }}
                            >
                              Current Status
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Courier info card when Out for Delivery */}
              {currentStageIndex >= 2 && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--green-600)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                    }}
                  >
                    🛵
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Assigned Rider: Vikram S.
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Clean Electric Delivery Fleet • Temperature Controlled
                    </div>
                  </div>
                  <a
                    href="tel:+919876543210"
                    style={{
                      padding: '6px 12px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      textDecoration: 'none',
                    }}
                  >
                    Call Rider 📞
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* ================= RECEIPT / INVOICE VIEW ================= */
            <div id="freshmart-printable-receipt">
              {/* Receipt Header */}
              <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1.5px dashed #cbd5e1', marginBottom: '18px' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-700)', fontFamily: 'var(--font-display)' }}>
                  🌿 FreshMart
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Fresh Farm Groceries • Official Tax Invoice
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  Invoice #{order.id} • {order.date}
                </div>
              </div>

              {/* Items List */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                  Ordered Items ({order.items.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={38}
                            height={38}
                            style={{ borderRadius: '8px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              background: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                            }}
                          >
                            🥬
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ₹{item.price.toFixed(2)} × {item.qty} {item.unit || ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Breakdown */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
                  <span>Item Subtotal</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
                  <span>Delivery Charges</span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '8px',
                    marginTop: '4px',
                  }}
                >
                  <span>Total Amount Paid</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery & Payment Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '0.8rem',
                  color: '#475569',
                  background: '#fdfdfd',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                    Payment Method
                  </strong>
                  <span>{order.paymentMethod || 'UPI / Instant Pay'}</span>
                </div>

                <div>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                    Delivery Window
                  </strong>
                  <span>{order.slot || 'Standard Delivery'}</span>
                </div>

                {order.address && (
                  <div style={{ gridColumn: 'span 2', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                      Delivery Address
                    </strong>
                    <span>
                      {[order.address.street, order.address.city, order.address.state, order.address.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          {activeTab === 'invoice' ? (
            <button
              type="button"
              onClick={handlePrint}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>Print Invoice</span>
              <span>🖨️</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('invoice')}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>View Invoice</span>
              <span>🧾</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => reorderItems(order.items)}
            style={{
              flex: 1.2,
              padding: '11px',
              borderRadius: '10px',
              backgroundColor: 'var(--green-600)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Reorder All Items</span>
            <span>🛒</span>
          </button>
        </div>
      </div>
    </div>
  );
}
