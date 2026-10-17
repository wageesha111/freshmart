'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Order } from '@/types';

const STEP_TITLES = [
  'Order Summary',
  'Delivery Address',
  'Payment Method',
  'Order Confirmed!',
];

export default function CheckoutModal() {
  const {
    user,
    cart,
    orders,
    subtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    addOrder,
    setSelectedOrderForTracking,
    showToast,
    triggerHaptic,
  } = useStore();

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [step, setStep] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Address state
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    pincode: '',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    notes: '',
  });

  const [selectedSlot, setSelectedSlot] = useState('Today 2–4pm');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbank' | 'cod'>('upi');
  const [lastOrderId, setLastOrderId] = useState('');

  // Autofill name from logged in user (Hook placed BEFORE any early return)
  useEffect(() => {
    if (user && !address.firstName) {
      const parts = user.name.split(' ');
      setAddress((prev) => ({
        ...prev,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
      }));
    }
  }, [user, address.firstName]);

  if (!isCheckoutOpen) return null;

  const deliveryFee = subtotal >= 499 ? 0 : 40;
  const grandTotal = Math.max(0, subtotal + deliveryFee - promoDiscount);

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (promoApplied) {
      showToast('Promo code already applied!', '🎁');
      return;
    }

    if (code === 'FRESH10') {
      const discount = Math.round(subtotal * 0.1);
      setPromoDiscount(discount);
      setPromoApplied(true);
      showToast('FRESH10 applied! 10% off 🎉', '🎁');
      triggerHaptic('success');
    } else if (code === 'FREE499') {
      setPromoDiscount(40);
      setPromoApplied(true);
      showToast('FREE499 applied! Free delivery 🚚', '🎁');
      triggerHaptic('success');
    } else if (!code) {
      showToast('Please enter a promo code', '🎁');
    } else {
      showToast('Invalid promo code. Try FRESH10', '❌');
    }
  };

  const handleNext = () => {
    if (!user) {
      triggerHaptic('warning');
      showToast('Please sign up or sign in to place an order', '⚠️');
      setShowAuthModal(true);
      return;
    }

    if (step === 2) {
      if (!address.firstName || !address.phone || !address.pincode || !address.street) {
        showToast('Please fill in all required address fields', '⚠️');
        return;
      }
    }

    if (step === 3) {
      // Complete order
      const newOrderId = `FM-${Math.floor(100000 + Math.random() * 900000)}`;
      setLastOrderId(newOrderId);

      const newOrder: Order = {
        id: newOrderId,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        total: grandTotal,
        items: [...cart],
        slot: selectedSlot,
        status: 'Processing',
        address: { ...address },
        paymentMethod:
          paymentMethod === 'upi'
            ? 'UPI / Instant Pay'
            : paymentMethod === 'card'
            ? 'Credit / Debit Card'
            : paymentMethod === 'netbank'
            ? 'Net Banking'
            : 'Cash on Delivery',
        promoDiscount,
        deliveryFee,
      };

      addOrder(newOrder);
      triggerHaptic('success');
      setStep(4);
      return;
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    if (step === 4) {
      clearCart();
    }
    setIsCheckoutOpen(false);
    setStep(1);
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoCode('');
  };

  return (
    <div
      className={`checkout-overlay ${isCheckoutOpen ? 'active' : ''}`}
      id="checkout-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="checkout-modal" id="checkout-modal">
        {/* Steps Progress */}
        <div className="checkout-steps">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`checkout-step ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}
            >
              <div className="step-circle">{s}</div>
              <span className="step-label">
                {s === 1 ? 'Summary' : s === 2 ? 'Address' : s === 3 ? 'Payment' : 'Done'}
              </span>
            </div>
          ))}
        </div>

        {/* Modal Header */}
        <div className="checkout-modal-header">
          <h2>{STEP_TITLES[step - 1]}</h2>
          <button className="checkout-close-btn" onClick={handleClose} aria-label="Close checkout">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="checkout-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* Panel 1: Summary */}
          {step === 1 && (
            <div className="checkout-panel active">
              <div className="checkout-summary-list" style={{ marginBottom: '16px' }}>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.image ? (
                        <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                          <Image src={item.image} alt={item.name} fill sizes="36px" style={{ objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <span>{item.emoji}</span>
                      )}
                      <span>{item.name} × {item.qty}</span>
                    </span>
                    <strong>₹{(item.price * item.qty).toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <div className="checkout-totals" style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '12px' }}>
                <div className="checkout-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="checkout-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>
                {promoApplied && (
                  <div className="checkout-total-row" style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', marginBottom: '6px' }}>
                    <span>Promo Discount</span>
                    <span>-₹{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="checkout-total-row grand" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="promo-input-row" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <input
                  type="text"
                  placeholder="Enter promo code (try FRESH10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}
                />
                <button className="btn-apply-promo" onClick={applyPromo} style={{ padding: '10px 20px', background: 'var(--green-700)', color: '#fff', borderRadius: '10px', fontWeight: 700 }}>
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Panel 2: Address */}
          {step === 2 && (
            <div className="checkout-panel active">
              <p className="form-section-title" style={{ fontWeight: 700, marginBottom: '14px' }}>Delivery Address</p>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>First Name *</label>
                  <input
                    type="text"
                    placeholder="Rahul"
                    value={address.firstName}
                    onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Last Name</label>
                  <input
                    type="text"
                    placeholder="Sharma"
                    value={address.lastName}
                    onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone *</label>
                  <input
                    type="tel"
                    placeholder="+91 99999 00000"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Pincode *</label>
                  <input
                    type="text"
                    placeholder="400001"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Street Address *</label>
                  <input
                    type="text"
                    placeholder="Building, Flat, Street name"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <p className="form-section-title" style={{ fontWeight: 700, margin: '20px 0 10px' }}>Delivery Slot</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['Today 10–12pm', 'Today 2–4pm', 'Today 6–8pm', 'Tomorrow 9–11am', 'Tomorrow 12–2pm', 'Tomorrow 4–6pm'].map((slot) => (
                  <button
                    key={slot}
                    className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: selectedSlot === slot ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedSlot === slot ? 'var(--green-50)' : '#fff',
                      fontWeight: selectedSlot === slot ? 700 : 500,
                      fontSize: '0.82rem',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Panel 3: Payment */}
          {step === 3 && (
            <div className="checkout-panel active">
              <p className="form-section-title" style={{ fontWeight: 700, marginBottom: '14px' }}>Select Payment Method</p>
              <div className="payment-methods" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'upi', icon: '📱', title: 'UPI', desc: 'Google Pay, PhonePe, Paytm, BHIM' },
                  { id: 'card', icon: '💳', title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbank', icon: '🏦', title: 'Net Banking', desc: 'All major banks supported' },
                  { id: 'cod', icon: '💵', title: 'Cash on Delivery', desc: 'Pay when your groceries arrive' },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`payment-method ${paymentMethod === m.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(m.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '12px',
                      border: paymentMethod === m.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: paymentMethod === m.id ? 'var(--green-50)' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id as any)}
                    />
                    <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <strong>{m.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Panel 4: Confirmation */}
          {step === 4 && (
            <div className="checkout-panel active" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
                Your fresh items are being packed and will be delivered shortly.
              </p>

              <div
                style={{
                  display: 'inline-block',
                  background: 'var(--green-100)',
                  color: 'var(--green-800)',
                  fontWeight: 800,
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '1rem',
                  letterSpacing: '1px',
                  marginBottom: '24px',
                }}
              >
                {lastOrderId}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'var(--green-50)',
                  border: '1px solid var(--green-200)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  marginBottom: '24px',
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--green-100)', color: 'var(--green-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <strong>Estimated Delivery Slot</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedSlot}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const placedOrder = orders.find((o) => o.id === lastOrderId) || {
                      id: lastOrderId,
                      date: new Date().toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      total: grandTotal,
                      items: [...cart],
                      slot: selectedSlot,
                      status: 'Processing',
                      address: { ...address },
                      paymentMethod:
                        paymentMethod === 'upi'
                          ? 'UPI / Instant Pay'
                          : paymentMethod === 'card'
                          ? 'Credit / Debit Card'
                          : paymentMethod === 'netbank'
                          ? 'Net Banking'
                          : 'Cash on Delivery',
                    };
                    clearCart();
                    setIsCheckoutOpen(false);
                    setStep(1);
                    setSelectedOrderForTracking(placedOrder);
                    triggerHaptic('success');
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--green-600)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>Track Live Delivery & Receipt</span>
                  <span>🛵</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div
            className="checkout-modal-footer"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 28px',
              borderTop: '1px solid var(--border)',
            }}
          >
            {step > 1 ? (
              <button
                className="btn-checkout-back"
                onClick={handleBack}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
              >
                ← Back
              </button>
            ) : (
              <div></div>
            )}

            <button
              className="btn-checkout-next"
              onClick={handleNext}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 700,
              }}
            >
              {step === 3 ? `Pay ₹${grandTotal.toFixed(2)} →` : 'Continue →'}
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
              You need an account to place an order and track your delivery. Please sign up or sign in to complete your checkout!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/auth?redirect=checkout&tab=signup"
                onClick={() => {
                  setShowAuthModal(false);
                  setIsCheckoutOpen(false);
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
                  setIsCheckoutOpen(false);
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
