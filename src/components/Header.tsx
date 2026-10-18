'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ALL_PRODUCTS } from '@/data/products';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
}

export default function Header({ onSearch, onSelectCategory }: HeaderProps) {
  const {
    cartCount,
    subtotal,
    wishlist,
    user,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsAccountOpen,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<typeof ALL_PRODUCTS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim().length > 1) {
      const matches = ALL_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(val.toLowerCase()) ||
        p.category.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
    if (onSearch) onSearch(val);
  };

  const handleSelectSuggestion = (productName: string) => {
    setSearchTerm(productName);
    setShowSuggestions(false);
    if (onSearch) onSearch(productName);
  };

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) onSelectCategory(cat);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} id="main-header">
      <div className="header-inner container">
        {/* Logo */}
        <Link href="/" className="logo" id="logo-link">
          <div className="logo-icon">🌿</div>
          <div className="logo-text">
            <span className="logo-name">FreshMart</span>
            <span className="logo-tagline">Always Fresh</span>
          </div>
        </Link>

        {/* Search */}
        <div className="search-wrapper">
          <div className="search-bar" id="search-bar">
            <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              id="search-input"
              placeholder="Search for fruits, vegetables, dairy..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.trim().length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              autoComplete="off"
            />
            {searchTerm && (
              <button
                style={{ padding: '0 8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}
                onClick={() => {
                  setSearchTerm('');
                  setShowSuggestions(false);
                  if (onSearch) onSearch('');
                }}
              >
                ✕
              </button>
            )}
            <button
              className="search-btn"
              id="search-btn"
              onClick={() => onSearch && onSearch(searchTerm)}
            >
              Search
            </button>
          </div>

          {showSuggestions && (
            <div className="search-suggestions visible" id="search-suggestions">
              {suggestions.map((p) => (
                <div
                  key={p.id}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(p.name)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  {p.image ? (
                    <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      <Image src={p.image} alt={p.name} fill sizes="28px" style={{ objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <span>{p.emoji}</span>
                  )}
                  <strong>{p.name}</strong>
                  <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 600 }}>
                    Rs. {p.price}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          <button
            className="btn-icon"
            id="wishlist-btn"
            aria-label="Wishlist"
            onClick={() => setIsWishlistOpen(true)}
          >
            <span className="btn-icon-symbol" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill={wishlist.length > 0 ? '#ef4444' : 'none'} stroke={wishlist.length > 0 ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </span>
            <span className="btn-icon-label">Wishlist</span>
          </button>

          <button
            className="btn-icon"
            id="account-btn"
            aria-label="Account"
            onClick={() => setIsAccountOpen(true)}
          >
            <span className="btn-icon-symbol" style={{ display: 'flex', alignItems: 'center' }}>
              {user ? (
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              )}
            </span>
            <span className="btn-icon-label">
              {user ? user.name.split(' ')[0] : 'Account'}
            </span>
          </button>

          <button
            className="cart-btn"
            id="cart-btn"
            aria-label="Cart"
            onClick={() => setIsCartOpen(true)}
          >
            <span className="cart-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </span>
            <span className="cart-text">Cart</span>
            <span className="cart-badge" id="cart-badge">
              {cartCount}
            </span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          id="mobile-menu-btn"
          aria-label="Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Nav Bar */}
      <nav className={`navbar ${mobileMenuOpen ? 'open' : ''}`} id="navbar">
        <div className="container nav-inner">
          <ul className="nav-list" id="nav-list">
            <li>
              <Link href="/" className="nav-link active" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li className="nav-has-dropdown">
              <a
                href="#categories"
                className="nav-link"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                    e.preventDefault();
                    setMobileCategoriesOpen(!mobileCategoriesOpen);
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}
              >
                <span>Categories</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  {mobileCategoriesOpen ? '▲' : '▾'}
                </span>
              </a>
              <div
                className="nav-dropdown"
                style={{
                  display: mobileCategoriesOpen ? 'grid' : undefined,
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '4px',
                  padding: '8px',
                }}
              >
                <a
                  href="#categories"
                  className="dropdown-item"
                  onClick={() => handleCategoryClick('fruits')}
                >
                  Fruits & Veggies
                </a>
                <a
                  href="#categories"
                  className="dropdown-item"
                  onClick={() => handleCategoryClick('dairy')}
                >
                  Dairy & Eggs
                </a>
                <a
                  href="#categories"
                  className="dropdown-item"
                  onClick={() => handleCategoryClick('meat')}
                >
                  Meat & Seafood
                </a>
                <a
                  href="#categories"
                  className="dropdown-item"
                  onClick={() => handleCategoryClick('bakery')}
                >
                  Bakery & Breads
                </a>
                <a
                  href="#categories"
                  className="dropdown-item"
                  onClick={() => handleCategoryClick('beverages')}
                >
                  Beverages
                </a>
                <a
                  href="#categories"
                  className="dropdown-item"
                  onClick={() => handleCategoryClick('snacks')}
                >
                  Snacks
                </a>
                <a
                  href="#categories"
                  className="dropdown-item"
                  onClick={() => handleCategoryClick('personalcare')}
                >
                  Personal Care
                </a>
                <a
                  href="#categories"
                  className="dropdown-item"
                  onClick={() => handleCategoryClick('household')}
                >
                  Household
                </a>
              </div>
            </li>
            <li>
              <a href="#deals" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Deals
              </a>
            </li>
            <li>
              <a href="#products" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Products
              </a>
            </li>
            <li>
              <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                About
              </a>
            </li>
            <li>
              <a href="#contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Floating Bottom Cart Pill for Smartphones */}
      {cartCount > 0 && (
        <div className="mobile-cart-float-bar">
          <div className="mobile-cart-float-content" onClick={() => setIsCartOpen(true)}>
            <div className="mobile-cart-float-left">
              <span className="mobile-cart-count-pill">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
              <span className="mobile-cart-total-price tabular-nums">
                Rs. {subtotal.toFixed(2)}
              </span>
            </div>
            <button className="mobile-cart-view-btn" aria-label="View Cart">
              <span>View Cart</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
