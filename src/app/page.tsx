'use client';

import React, { useState, useEffect } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import Categories from '@/components/Categories';
import DealsSection from '@/components/DealsSection';
import ProductsSection from '@/components/ProductsSection';
import Footer from '@/components/Footer';
import { useStore } from '@/context/StoreContext';

export default function HomePage() {
  const { showToast, triggerHaptic, setIsCheckoutOpen } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Resume checkout if redirected from auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout') === 'true') {
        setIsCheckoutOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [setIsCheckoutOpen]);

  const copyPromoCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText('FRESH10')
        .then(() => {
          showToast('Promo code FRESH10 copied!', '🎁');
          triggerHaptic('success');
        })
        .catch(() => {
          showToast('Code: FRESH10', '🎁');
        });
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Header
        onSearch={(query) => setSearchQuery(query)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      <main id="main-content">
        <HeroSlider />

        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        <DealsSection />

        {/* Promo Code Voucher Banner */}
        <section
          className="promo-banner container"
          style={{
            margin: '48px auto',
          }}
        >
          <div
            style={{
              background: 'radial-gradient(ellipse at 85% 30%, rgba(74, 222, 128, 0.18), transparent 60%), linear-gradient(135deg, #14532d 0%, #052e16 100%)',
              color: '#fff',
              padding: 'clamp(28px, 4vw, 44px)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl), var(--shadow-green)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '28px',
            }}
          >
            {/* Ambient water-mark leaf */}
            <div
              style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-30px',
                fontSize: '12rem',
                opacity: 0.05,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              🌿
            </div>

            <div style={{ maxWidth: '620px', position: 'relative', zIndex: 1 }}>
              <span
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '14px',
                  color: '#bbf7d0',
                }}
              >
                <span>✨</span> Special seasonal voucher
              </span>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  marginBottom: '10px',
                  lineHeight: 1.2,
                  letterSpacing: '-0.025em',
                  textWrap: 'balance',
                }}
              >
                Get 10% off your first supermarket order
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '0.94rem',
                  lineHeight: 1.6,
                  textWrap: 'pretty',
                }}
              >
                Stock your pantry with freshly harvested organic veggies, cold-pressed dairy, and wholesome staples. Apply code at checkout.
              </p>
            </div>

            {/* Voucher Ticket Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '6px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.9)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div style={{ padding: '10px 20px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Voucher code
                </div>
                <div
                  style={{
                    fontSize: '1.28rem',
                    fontWeight: 800,
                    color: 'var(--green-700)',
                    letterSpacing: '1.5px',
                    fontFamily: 'var(--font-display)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  FRESH10
                </div>
              </div>

              <div
                style={{
                  height: '36px',
                  borderLeft: '2px dashed #cbd5e1',
                  margin: '0 4px',
                }}
              />

              <button
                onClick={copyPromoCode}
                className="btn-primary"
                style={{
                  padding: '12px 20px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: 'calc(var(--radius-lg) - 6px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Copy</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <ProductsSection
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          searchQuery={searchQuery}
        />

        {/* Why Choose Us Section */}
        <section
          className="about-section"
          id="about"
          style={{
            padding: '90px 0',
            background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)',
            borderTop: '1px solid rgba(22, 163, 74, 0.08)',
          }}
        >
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
              <div>
                <span
                  style={{
                    color: 'var(--primary-dark)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    fontSize: '0.8rem',
                  }}
                >
                  Direct farm sourcing
                </span>
                <h2
                  className="section-title"
                  style={{
                    marginTop: '8px',
                    marginBottom: '16px',
                    fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
                    lineHeight: 1.2,
                    textWrap: 'balance',
                  }}
                >
                  Harvested at dawn, <br />
                  <span className="highlight">at your door by dinner</span>
                </h2>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8,
                    marginBottom: '28px',
                    fontSize: '0.98rem',
                    textWrap: 'pretty',
                  }}
                >
                  We partner directly with over 200 certified regional growers to cut out warehouses and wholesale middlemen. Wholesome greens, juicy orchard fruits, and farm-fresh dairy arrive crisp and nutrient-rich.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <div
                    style={{
                      background: '#fff',
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(15, 35, 25, 0.08)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: 'var(--primary-dark)',
                        fontFamily: 'var(--font-display)',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      100%
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                      Naturally ripened, pesticide-free produce
                    </div>
                  </div>
                  <div
                    style={{
                      background: '#fff',
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(15, 35, 25, 0.08)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: 'var(--primary-dark)',
                        fontFamily: 'var(--font-display)',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      2 Hours
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                      Cold-chain express doorstep dispatch
                    </div>
                  </div>
                </div>
              </div>

              {/* Sustainability Card */}
              <div
                style={{
                  background: 'linear-gradient(145deg, var(--green-700), var(--green-900))',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'clamp(28px, 4vw, 44px)',
                  color: '#fff',
                  boxShadow: 'var(--shadow-lg), var(--shadow-green)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '1.8rem',
                    marginBottom: '20px',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  🌱
                </div>
                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Our zero-waste packaging pledge
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.75,
                    marginBottom: '24px',
                    fontSize: '0.94rem',
                    textWrap: 'pretty',
                  }}
                >
                  Every FreshMart basket is delivered in 100% unbleached compostable paper and reusable organic cotton sacks. We are proud to maintain net-zero transit emissions across all regional city hubs.
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    gap: '10px',
                    alignItems: 'center',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>🌍</span>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#bbf7d0' }}>
                    Certified Eco-Friendly Packaging
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
