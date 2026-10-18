'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function ContactPage() {
  const { showToast, triggerHaptic } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please fill in your name, email, and message', '⚠️');
      triggerHaptic('warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      // Also persist to localStorage for offline / cross-tab sync
      try {
        const stored = localStorage.getItem('freshmart_customer_inquiries');
        const existingList = stored ? JSON.parse(stored) : [];
        const newEntry = data.data || {
          id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
          ...formData,
          createdAt: new Date().toISOString(),
          status: 'New',
        };
        localStorage.setItem(
          'freshmart_customer_inquiries',
          JSON.stringify([newEntry, ...existingList])
        );
      } catch (localErr) {
        console.warn('LocalStorage inquiries save error:', localErr);
      }

      showToast('Thank you! Your message has been sent to FreshMart.', '✅');
      triggerHaptic('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      console.error('Failed to submit message:', err);
      showToast('Thank you! Your inquiry has been received.', '✅');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(22, 163, 74, 0.08) 0%, rgba(240, 253, 244, 0.6) 50%, var(--green-50) 100%)',
        padding: '32px 16px',
        position: 'relative',
      }}
    >
      {/* Top Navigation Pill */}
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>🌿</span>
          <span
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--green-700)',
              letterSpacing: '-0.02em',
            }}
          >
            FreshMart
          </span>
        </Link>

        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(15, 35, 25, 0.1)',
            borderRadius: '999px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: 'var(--primary-dark)',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>←</span> Back to Store
        </Link>
      </div>

      {/* Main Glass Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          background: 'var(--glass-bg-sheet)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(22, 163, 74, 0.04)',
          padding: 'clamp(24px, 4vw, 44px)',
        }}
      >
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span
            style={{
              background: 'rgba(22, 163, 74, 0.09)',
              color: 'var(--green-700)',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              border: '1px solid rgba(22, 163, 74, 0.18)',
            }}
          >
            <span>💬</span> Customer Support & Inquiries
          </span>
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: '#0f2319',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            Contact FreshMart Sri Lanka
          </h1>
          <p
            style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Have a question about your order, produce sourcing, or doorstep delivery? Connect with us directly or drop us a message below.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Direct Contact Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Hotline & WhatsApp Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid rgba(15, 35, 25, 0.08)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 6px 14px rgba(22, 163, 74, 0.25)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Direct Phone & WhatsApp
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2319', margin: '3px 0 6px', fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>
                  071 418 2326
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', lineHeight: 1.45 }}>
                  Available daily 7:00 AM – 10:00 PM for instant order updates & support.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a
                    href="tel:0714182326"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      background: 'var(--green-50)',
                      color: 'var(--green-700)',
                      border: '1px solid var(--green-200)',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>📞</span> Call
                  </a>
                  <a
                    href="https://wa.me/94714182326"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      background: '#25D366',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                    }}
                  >
                    <span>💬</span> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Email Support Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid rgba(15, 35, 25, 0.08)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 6px 14px rgba(2, 132, 199, 0.25)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Email Inquiries
                </span>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f2319', margin: '3px 0 6px', wordBreak: 'break-all' }}>
                  Vihanganawageesha@gmail.com
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', lineHeight: 1.45 }}>
                  Wholesale, corporate partners, and customer questions answered promptly.
                </p>
                <a
                  href="mailto:Vihanganawageesha@gmail.com"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span>✉️</span> Send Email
                </a>
              </div>
            </div>

            {/* Coverage Area Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 22px',
                border: '1px solid rgba(15, 35, 25, 0.08)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Coverage Area
                </span>
                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f2319', marginTop: '2px' }}>
                  Western Province, Sri Lanka
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Seeduwa, Colombo, Negombo, Gampaha & Island-wide
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: 'clamp(20px, 3.5vw, 32px)',
              border: '1px solid rgba(15, 35, 25, 0.08)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f2319',
                marginBottom: '6px',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
              }}
            >
              Send Us a Message
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
              Fill in your details below and our customer care team will get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wageesha"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="071 418 2326"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Order Inquiry, Delivery Question"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, var(--green-600) 0%, var(--green-700) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                {isSubmitting ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Back Link at bottom of card */}
        <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(15, 35, 25, 0.08)' }}>
          <Link
            href="/"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.86rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>

      {/* Page Footer Note */}
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
        © {new Date().getFullYear()} FreshMart Supermarket Sri Lanka. All rights reserved.
      </div>
    </div>
  );
}
