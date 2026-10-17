'use client';

import React from 'react';
import Image from 'next/image';
import { CATEGORIES } from '@/data/products';

interface CategoriesProps {
  selectedCategory?: string;
  onSelectCategory?: (id: string) => void;
}

export default function Categories({ selectedCategory, onSelectCategory }: CategoriesProps) {
  return (
    <section className="categories-section" id="categories" style={{ padding: '64px 0' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-badge" style={{ color: 'var(--primary-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.8rem' }}>
            Fresh aisle directory
          </span>
          <h2 className="section-title" style={{ marginTop: '8px', fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)', letterSpacing: '-0.025em' }}>
            Shop by <span className="highlight">category</span>
          </h2>
          <p className="section-subtitle" style={{ color: 'var(--text-secondary)', textWrap: 'pretty' }}>
            Find daily kitchen staples organized across sustainably sourced produce aisles.
          </p>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(isSelected ? 'all' : cat.id);
                  }
                  const el = document.getElementById('products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--primary)' : 'rgba(15, 35, 25, 0.08)',
                  boxShadow: isSelected ? '0 0 0 3px var(--primary-glow), var(--shadow-md)' : undefined,
                }}
              >
                <div className="category-img-wrap" style={{ position: 'relative', width: '100%', height: '140px' }}>
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="category-info" style={{ padding: '14px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{cat.count}+ items</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
