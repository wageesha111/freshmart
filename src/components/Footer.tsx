'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function Footer() {
  const { showToast, setIsAccountOpen } = useStore();
  const [email, setEmail] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showToast(`Subscribed with ${email}! Welcome to FreshMart`, '✅');
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Features Bar */}
      {/* Features Bar */}
      <section className="features-bar" style={{ background: '#fff', borderTop: '1px solid rgba(15, 35, 25, 0.06)', borderBottom: '1px solid rgba(15, 35, 25, 0.06)', padding: '36px 0' }}>
        <div className="container">
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(22, 163, 74, 0.08)', color: 'var(--primary-dark)', border: '1px solid rgba(22, 163, 74, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.94rem', color: 'var(--text-primary)' }}>Free delivery</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>On orders over Rs. 499</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(22, 163, 74, 0.08)', color: 'var(--primary-dark)', border: '1px solid rgba(22, 163, 74, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.94rem', color: 'var(--text-primary)' }}>100% organic</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Certified farm quality</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(22, 163, 74, 0.08)', color: 'var(--primary-dark)', border: '1px solid rgba(22, 163, 74, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.94rem', color: 'var(--text-primary)' }}>2-hour express</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fast and fresh to door</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(22, 163, 74, 0.08)', color: 'var(--primary-dark)', border: '1px solid rgba(22, 163, 74, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.94rem', color: 'var(--text-primary)' }}>Secure checkout</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>100% protected payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="footer" style={{ background: 'linear-gradient(145deg, #052e16 0%, #0f172a 100%)', color: '#fff', padding: '64px 0 24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container">
          <div className="footer-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '50px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--green-400)', letterSpacing: '-0.02em' }}>
                  FreshMart
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '20px', maxWidth: '320px', textWrap: 'pretty' }}>
                Your destination for organic vegetables, farm-fresh dairy, bakery delights, and pantry essentials delivered straight to your kitchen across Sri Lanka.
              </p>

              {/* Direct Sri Lanka Contact Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                <a
                  href="tel:0714182326"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#bbf7d0', textDecoration: 'none', fontWeight: 700 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Hotline: 071 418 2326</span>
                </a>
                <a
                  href="mailto:Vihanganawageesha@gmail.com"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#bae6fd', textDecoration: 'none', fontSize: '0.84rem', wordBreak: 'break-all' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>Vihanganawageesha@gmail.com</span>
                </a>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Western Province, Sri Lanka</span>
                </span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '18px', color: '#fff', letterSpacing: '-0.01em' }}>Categories</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'rgba(255,255,255,0.7)' }}>
                <li><a href="#categories">Fruits & Veggies</a></li>
                <li><a href="#categories">Dairy & Eggs</a></li>
                <li><a href="#categories">Bakery Goods</a></li>
                <li><a href="#categories">Meat & Seafood</a></li>
                <li><a href="#categories">Cold Beverages</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '18px', color: '#fff', letterSpacing: '-0.01em' }}>Quick links</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'rgba(255,255,255,0.7)' }}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAccountOpen(true); }}>My account</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAccountOpen(true); }}>Track order</a></li>
                <li><a href="#deals">Super deals</a></li>
                <li><a href="#about">About us</a></li>
                <li><Link href="/contact" style={{ color: '#4ade80', fontWeight: 600 }}>Contact us</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '18px', color: '#fff', letterSpacing: '-0.01em' }}>Newsletter</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.86rem', marginBottom: '14px', textWrap: 'pretty' }}>
                Get early updates on weekend sales, discount coupons, and fresh arrivals.
              </p>
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.86rem',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 18px',
                    background: 'var(--green-600)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                  }}
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <div>© {new Date().getFullYear()} FreshMart Online Supermarket. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Refund Policy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        ↑
      </button>
    </>
  );
}
