'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/data/products';
import ProductCard from './ProductCard';

interface ProductsSectionProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Products' },
  { id: 'fruits', label: 'Fruits & Veggies' },
  { id: 'dairy', label: 'Dairy & Eggs' },
  { id: 'meat', label: 'Meat & Seafood' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'beverages', label: 'Beverages' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'personalcare', label: 'Personal Care' },
  { id: 'household', label: 'Household' },
];

export default function ProductsSection({
  selectedCategory,
  onSelectCategory,
  searchQuery,
}: ProductsSectionProps) {
  const { products } = useStore();
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [visibleCount, setVisibleCount] = useState(12);

  const filteredProducts = useMemo(() => {
    let list = products && products.length > 0 ? [...products] : [...PRODUCTS];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section className="products-section" id="products" style={{ padding: '70px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ color: 'var(--primary-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.8rem' }}>
            Certified organic produce
          </span>
          <h2 className="section-title" style={{ marginTop: '8px', fontSize: 'clamp(1.75rem, 3.2vw, 2.4rem)', letterSpacing: '-0.025em' }}>
            Fresh farm <span className="highlight">products</span>
          </h2>
          <p className="section-subtitle" style={{ color: 'var(--text-secondary)', textWrap: 'pretty' }}>
            Pure, chemical-free and freshly harvested daily from verified regional partners.
          </p>
        </div>

        {/* Filter Tabs & Sorting Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '36px' }}>
          <div className="filter-tabs">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`filter-tab ${selectedCategory === tab.id ? 'active' : ''}`}
                onClick={() => {
                  onSelectCategory(tab.id);
                  setVisibleCount(12);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>{displayedProducts.length}</strong> of{' '}
              <strong style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> items
              {searchQuery && <span> for &ldquo;<em>{searchQuery}</em>&rdquo;</span>}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="sort-select" style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(15, 35, 25, 0.12)',
                  background: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <option value="default">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {displayedProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              background: '#fff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(15, 35, 25, 0.08)',
              boxShadow: 'var(--shadow-sm)',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--green-50)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              No matching groceries found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.6, textWrap: 'pretty' }}>
              We could not find items matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try another term or explore popular aisles:
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['fruits', 'dairy', 'bakery'].map((catId) => (
                <button
                  key={catId}
                  onClick={() => onSelectCategory(catId)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--green-50)',
                    color: 'var(--primary-dark)',
                    border: '1px solid var(--green-200)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  {catId === 'fruits' ? '🍎 Fruits & Veggies' : catId === 'dairy' ? '🥛 Dairy & Eggs' : '🥖 Bakery'}
                </button>
              ))}
            </div>
            <button
              className="btn-primary"
              onClick={() => onSelectCategory('all')}
              style={{ padding: '10px 24px', fontSize: '0.9rem' }}
            >
              View all products
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredProducts.length && (
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button
              className="btn-secondary"
              onClick={() => setVisibleCount((prev) => prev + 12)}
              style={{
                color: 'var(--primary)',
                borderColor: 'var(--primary)',
                background: '#fff',
                fontWeight: 700,
                padding: '14px 36px',
              }}
            >
              Load More Products ({filteredProducts.length - visibleCount} remaining) ↓
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
