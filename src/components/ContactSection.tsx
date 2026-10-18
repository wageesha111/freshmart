'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function ContactSection() {
  const { showToast, triggerHaptic } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill in your name, email, and message', '⚠️');
      triggerHaptic('warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Thank you! Your message has been sent to FreshMart.', '✅');
      triggerHaptic('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 600);
  };

  return (
    <section
      id="contact"
      style={{
        padding: '80px 0',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f0fdf4 100%)',
        borderTop: '1px solid rgba(22, 163, 74, 0.1)',
        position: 'relative',
        scrollMarginTop: '80px',
      }}
    >
      <div className="container">
        {/* Section Heading */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <span
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              background: 'rgba(22, 163, 74, 0.08)',
              borderRadius: '999px',
              border: '1px solid rgba(22, 163, 74, 0.18)',
              marginBottom: '12px',
            }}
          >
            <span>💬</span> Get in Touch
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: '#0f2319',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '12px',
            }}
          >
            We&apos;re Here to Help You
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.98rem',
              lineHeight: 1.6,
            }}
          >
            Have a question about your order, delivery in Sri Lanka, or farm-fresh stock? Reach out to us directly or send a message below.
          </p>
        </div>

        {/* Contact Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Direct Contact Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Phone Hotline Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid rgba(15, 35, 25, 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                gap: '18px',
                alignItems: 'flex-start',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 6px 16px rgba(22, 163, 74, 0.25)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Hotline & WhatsApp
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2319', margin: '4px 0 6px' }}>
                  071 418 2326
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '14px', lineHeight: 1.5 }}>
                  Available daily 7:00 AM – 10:00 PM for Sri Lanka orders & quick delivery updates.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href="tel:0714182326"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: 'var(--green-50)',
                      color: 'var(--green-700)',
                      border: '1px solid var(--green-200)',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>📞</span> Call Now
                  </a>
                  <a
                    href="https://wa.me/94714182326"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: '#25D366',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
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

            {/* Email Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid rgba(15, 35, 25, 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                gap: '18px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 6px 16px rgba(2, 132, 199, 0.25)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Email Support
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2319', margin: '4px 0 6px', wordBreak: 'break-all' }}>
                  Vihanganawageesha@gmail.com
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '14px', lineHeight: 1.5 }}>
                  Drop us an email for wholesale inquiries, partner feedback, or billing queries.
                </p>
                <a
                  href="mailto:Vihanganawageesha@gmail.com"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span>✉️</span> Send Email
                </a>
              </div>
            </div>

            {/* Location & Operating Hub Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid rgba(15, 35, 25, 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                gap: '18px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.25)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Coverage Area
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2319', margin: '4px 0 6px' }}>
                  Sri Lanka Island-Wide Service
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                  Express delivery across Colombo, Seeduwa, Negombo, Gampaha, and surrounding Western Province areas.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: 'clamp(24px, 4vw, 36px)',
              border: '1px solid rgba(15, 35, 25, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f2319',
                marginBottom: '8px',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
              }}
            >
              Send Us a Message
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
              Leave your details and query. Our team will get back to you promptly.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 071 418 2326"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delivery status, Fresh produce inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
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
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, var(--green-600) 0%, var(--green-700) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                {isSubmitting ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
