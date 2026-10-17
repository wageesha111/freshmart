'use client';

import React, { useState, useEffect } from 'react';
import { DEALS } from '@/data/products';
import ProductCard from './ProductCard';

export default function DealsSection() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, mins: 32, secs: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        return { hours: 24, mins: 0, secs: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="deals-section" id="deals" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)', padding: '72px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }}>
          <div>
            <span style={{ color: 'var(--accent-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.8rem' }}>
              Limited time only
            </span>
            <h2 className="section-title" style={{ marginTop: '6px', fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)', letterSpacing: '-0.025em' }}>
              Flash <span className="highlight" style={{ color: 'var(--accent-dark)' }}>super deals</span>
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 18px', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(15, 35, 25, 0.08)' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ends in:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              <span style={{ background: 'var(--text-primary)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.88rem', fontVariantNumeric: 'tabular-nums' }}>
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span style={{ color: 'var(--text-muted)' }}>:</span>
              <span style={{ background: 'var(--text-primary)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.88rem', fontVariantNumeric: 'tabular-nums' }}>
                {String(timeLeft.mins).padStart(2, '0')}m
              </span>
              <span style={{ color: 'var(--text-muted)' }}>:</span>
              <span style={{ background: 'var(--text-primary)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.88rem', fontVariantNumeric: 'tabular-nums' }}>
                {String(timeLeft.secs).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        <div className="products-grid">
          {DEALS.map((deal) => (
            <ProductCard key={deal.id} product={deal} />
          ))}
        </div>
      </div>
    </section>
  );
}
