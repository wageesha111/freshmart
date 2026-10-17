# FreshMart — Next.js Online Supermarket

FreshMart has been converted from a static HTML/CSS/JS site into a modern, production-grade **Next.js 14 App Router** application with full **Apple Design System** integration.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v18.17+ or LTS) installed on your machine.
If you have `winget` on Windows, you can install Node.js quickly via:
```powershell
winget install OpenJS.NodeJS.LTS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Database Setup (Supabase)
FreshMart uses **Supabase** (PostgreSQL) with the official `@supabase/supabase-js` SDK.
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and paste the contents of [`supabase/schema.sql`](file:///c:/Users/Admin/.gemini/antigravity-ide/scratch/freshmart/supabase/schema.sql), then click **Run**. This creates the tables (`categories`, `products`, `orders`, `order_items`), configures Row Level Security (RLS), and seeds initial products & categories.
3. In your Supabase dashboard, go to **Project Settings** -> **API**, and copy your **Project URL** and **anon/public key**.
4. Create a `.env` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
*(Note: If no Supabase credentials are provided, FreshMart runs with seamless local fallback so you can develop and test immediately offline).*

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🏗️ Architecture & Project Structure

```text
freshmart/
├── public/                     # Static assets (banners, category illustrations)
│   ├── hero_banner.png
│   ├── deals_banner.png
│   └── cat_*.png
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root Layout (Fonts, StoreProvider, Global Drawers)
│   │   ├── page.tsx            # Main Storefront Page
│   │   ├── globals.css         # Global Styles & Apple Design System Tokens
│   │   └── auth/
│   │       └── page.tsx        # Authentication & Registration Page
│   ├── components/
│   │   ├── AnnouncementBar.tsx # Top notification banner
│   │   ├── Header.tsx          # Sticky glass header with search & badge controls
│   │   ├── HeroSlider.tsx      # Carousel hero banner with auto-play
│   │   ├── Categories.tsx      # Category cards with interactive catalog filtering
│   │   ├── DealsSection.tsx    # Flash Super Deals with live countdown clock
│   │   ├── ProductsSection.tsx # Product catalog with category tabs & sorting
│   │   ├── ProductCard.tsx     # Tactile product card with quantity stepper
│   │   ├── CartDrawer.tsx      # Apple gesture drag-to-dismiss cart sheet
│   │   ├── WishlistDrawer.tsx  # Gesture-driven wishlist sheet
│   │   ├── AccountDrawer.tsx   # User profile & order history drawer
│   │   ├── CheckoutModal.tsx   # 4-step wizard sheet checkout modal
│   │   ├── Toast.tsx           # Apple Dynamic Island HUD toast notifications
│   │   └── Footer.tsx          # Features bar, links, and newsletter signup
│   ├── context/
│   │   └── StoreContext.tsx    # React Context with persistent localStorage state
│   ├── data/
│   │   └── products.ts         # Products, Deals, and Categories data
│   └── types/
│       └── index.ts            # TypeScript interfaces & domain models
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies & scripts
└── tsconfig.json               # TypeScript compiler config & path aliases (@/*)
```

---

## 🍎 Apple Design System Features Integrated

1. **Direct Manipulation (§2, §5, §6, §9)**:
   - 1:1 pointer tracking on all drawers with `setPointerCapture`.
   - Apple progressive rubber-banding when dragged in reverse.
   - Exponential decay momentum projection (`project(velocity, 0.998)`).
   - Apple pill grab handles (`.drawer-handle`).

2. **Instant Physical Feedback (§1 & §10)**:
   - Instant compression response on `:active` (`scale(0.97)` with 100ms spring release).
   - Haptic vibration feedback (`navigator.vibrate`) on key interactions.

3. **Translucent Materials & Depth (§12)**:
   - Frosted glass headers, sheets, and drawers (`backdrop-filter: blur(24px) saturate(180%)`).
   - Specular top rim lighting.
   - Dynamic Island HUD toast notifications.

4. **Typography & Optical Tracking (§15)**:
   - Negative letter-spacing tracking on large display headers.
   - Comfortable body leading.
   - Subpixel font smoothing (`-webkit-font-smoothing: antialiased`).

5. **Accessibility (§14)**:
   - Support for `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast`.
