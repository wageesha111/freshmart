'use client';

import React, { useState, useEffect } from 'react';

export default function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero-slider" id="hero-slider">
        {/* Slide 1 */}
        <div
          className={`hero-slide ${activeSlide === 0 ? 'active' : ''}`}
          style={{ backgroundImage: "url('/hero_banner.png')" }}
        >
          <div className="hero-overlay"></div>
          <div className="container hero-content">
            <div className="hero-badge animate-in">100% Fresh & Organic</div>
            <h1 className="hero-title animate-in">
              Fresh From <br />
              <span className="hero-highlight">Farm to Your Table</span>
            </h1>
            <p className="hero-subtitle animate-in">
              Discover thousands of fresh products delivered straight to your doorstep. Quality you can taste, prices you will love.
            </p>
            <div className="hero-actions animate-in">
              <a href="#products" className="btn-primary">
                Shop Now →
              </a>
              <a href="#categories" className="btn-secondary">
                Explore Categories
              </a>
            </div>
            <div className="hero-stats animate-in">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">2hr</span>
                <span className="stat-label">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 */}
        <div
          className={`hero-slide ${activeSlide === 1 ? 'active' : ''}`}
          style={{ backgroundImage: "url('/deals_banner.png')" }}
        >
          <div className="hero-overlay hero-overlay-2"></div>
          <div className="container hero-content">
            <div className="hero-badge animate-in" style={{ background: '#f59e0b', color: '#fff' }}>
              Limited Time Deal
            </div>
            <h1 className="hero-title animate-in">
              Mega <span className="hero-highlight" style={{ color: '#fde68a' }}>Weekend Sale</span>
            </h1>
            <p className="hero-subtitle animate-in">
              Up to 40% off on selected items. Fresh deals updated every weekend — do not miss out!
            </p>
            <div className="hero-actions animate-in">
              <a href="#deals" className="btn-primary" style={{ background: '#f59e0b' }}>
                View Deals →
              </a>
              <a href="#products" className="btn-secondary">
                All Products
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <button
        className="slider-btn slider-prev"
        onClick={() => setActiveSlide((prev) => (prev === 0 ? 1 : 0))}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        className="slider-btn slider-next"
        onClick={() => setActiveSlide((prev) => (prev === 0 ? 1 : 0))}
        aria-label="Next slide"
      >
        ›
      </button>

      <div className="slider-dots" id="slider-dots">
        <button
          className={`dot ${activeSlide === 0 ? 'active' : ''}`}
          onClick={() => setActiveSlide(0)}
          aria-label="Slide 1"
        ></button>
        <button
          className={`dot ${activeSlide === 1 ? 'active' : ''}`}
          onClick={() => setActiveSlide(1)}
          aria-label="Slide 2"
        ></button>
      </div>
    </section>
  );
}
