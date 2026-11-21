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

### 4. Environment Variables
Copy `.env.example` to `.env.local` and fill it in:

| Variable | Needed for | Notes |
|---|---|---|
| `SESSION_SECRET` | Production | Random string, 32+ characters. Signs the login cookies. |
| `ADMIN_PASSWORD` | Admin dashboard | Passcode for `/admin`. Without it the admin login is disabled. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Optional. Without them the app runs in local demo mode. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | **Required** when Supabase is used. Server-only, never prefix with `NEXT_PUBLIC_`. |
| `ENABLE_DEMO_LOGIN` | Optional | Set to `true` to keep the one-click demo profiles in production. |

Generate a session secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

*(If no Supabase credentials are set, FreshMart runs on in-memory data so you can try it immediately. Data resets when the server restarts.)*

### 5. Database Setup (Supabase, optional)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. This creates the tables, locks down Row Level Security and seeds the products and categories. It is safe to run again on an existing database.
3. In **Project Settings → API**, copy the **Project URL**, the **anon key** and the **service_role key** into `.env.local`.

### 🔒 Security Model
- The browser never talks to Supabase directly. All customer data goes through the Next.js API routes using the service role key on the server.
- Passwords are hashed with scrypt. Older plain-text passwords are upgraded automatically on the user's next sign-in.
- Customer and admin sessions are signed, `httpOnly` cookies. `/admin` and its API routes (orders, customers, products, uploads, inquiries) require the admin session.
- Order totals, delivery fees and promo discounts are recalculated on the server from the product catalogue.
- Product image uploads are admin-only, limited to JPG/PNG/WEBP/GIF up to 5 MB, and stored in Supabase Storage (`product-images` bucket) in production.

### 6. Build for Production
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
