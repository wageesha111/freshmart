'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, wishlist, addToCart, changeQty, toggleWishlist } = useStore();

  const isWishlisted = wishlist.includes(product.id);
  const cartItem = cart.find((i) => i.id === product.id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      {product.badge && (
        <span className={`product-badge ${product.badge.toLowerCase()}`}>
          {product.badge === 'organic' ? 'Organic' : product.badge === 'new' ? 'New' : product.badge}
        </span>
      )}

      <button
        className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
        onClick={() => toggleWishlist(product.id)}
        aria-label="Toggle wishlist"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? '#ef4444' : 'none'} stroke={isWishlisted ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      <div className="product-img-wrap" style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-img"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '4.5rem', userSelect: 'none' }}>
            <span>{product.emoji}</span>
          </div>
        )}
      </div>

      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name" style={{ minHeight: '2.7em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>

        <div className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{product.rating}</span>
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>({product.reviews})</span>
          <span style={{ marginLeft: 'auto', fontWeight: 500, fontSize: '0.78rem' }}>{product.unit}</span>
        </div>

        <div className="product-price-row">
          <span className="product-price tabular-nums">Rs. {product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="product-original-price tabular-nums">Rs. {product.originalPrice.toFixed(2)}</span>
              <span className="product-discount tabular-nums">{product.discount}% OFF</span>
            </>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          {qtyInCart > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--green-50)',
                border: '1.5px solid var(--green-200)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 8px',
              }}
            >
              <button
                className="qty-btn"
                onClick={() => changeQty(product.id, -1)}
                aria-label="Decrease quantity"
                style={{ width: '32px', height: '32px', minWidth: '32px' }}
              >
                −
              </button>
              <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
                <span style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: '0.98rem', fontVariantNumeric: 'tabular-nums' }}>
                  {qtyInCart}
                </span>
                <span style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
                  in cart
                </span>
              </div>
              <button
                className="qty-btn"
                onClick={() => changeQty(product.id, 1)}
                aria-label="Increase quantity"
                style={{ width: '32px', height: '32px', minWidth: '32px' }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="add-to-cart-btn"
              onClick={() => addToCart(product.id)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
