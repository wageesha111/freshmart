-- ========================================================
-- FreshMart Supabase PostgreSQL Schema & Seed Data
-- Paste and run this script in Supabase: SQL Editor -> Run
-- ========================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  image TEXT NOT NULL,
  count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  discount INT DEFAULT 0,
  rating NUMERIC(3, 1) DEFAULT 4.5,
  reviews INT DEFAULT 0,
  emoji TEXT,
  image TEXT,
  badge TEXT,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  slot TEXT NOT NULL,
  status TEXT DEFAULT 'Processing',
  user_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  city TEXT,
  pincode TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For existing databases, add delivery columns if not present
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  qty INT NOT NULL,
  image TEXT
);

-- 5. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permissive Policies for storefront access
DROP POLICY IF EXISTS "Public categories are viewable" ON categories;
CREATE POLICY "Public categories are viewable" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public products are viewable" ON products;
CREATE POLICY "Public products are viewable" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
CREATE POLICY "Anyone can view orders" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;
CREATE POLICY "Anyone can delete orders" ON orders FOR DELETE USING (true);

DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
CREATE POLICY "Anyone can view order items" ON order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can modify products" ON products;
CREATE POLICY "Anyone can modify products" ON products FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can select users" ON users;
CREATE POLICY "Anyone can select users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert users" ON users;
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);

-- ========================================================
-- SEED DATA
-- ========================================================

-- Insert Categories
INSERT INTO categories (id, name, icon, image, count) VALUES
('fruits', 'Fruits & Veggies', '🍎', '/cat_fruits.png', 180),
('dairy', 'Dairy & Eggs', '🥛', '/cat_dairy.png', 95),
('meat', 'Meat & Seafood', '🥩', '/cat_meat.png', 65),
('bakery', 'Bakery & Bread', '🥖', '/cat_bakery.png', 70),
('beverages', 'Beverages', '🥤', '/cat_beverages.png', 120),
('snacks', 'Snacks & Munchies', '🍫', '/cat_snacks.png', 145),
('personalcare', 'Personal Care', '🧴', '/cat_personalcare.png', 110),
('household', 'Household Essentials', '🧹', '/cat_household.png', 85)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  image = EXCLUDED.image,
  count = EXCLUDED.count;

-- Insert Products & Deals
INSERT INTO products (id, name, category, price, original_price, discount, rating, reviews, emoji, image, badge, unit) VALUES
(1, 'Fresh Red Apples', 'fruits', 89, 120, 26, 4.8, 342, '🍎', '/products/prod_1.jpg', 'organic', '1 kg'),
(2, 'Organic Bananas', 'fruits', 45, 60, 25, 4.6, 218, '🍌', '/products/prod_2.jpg', 'organic', '6 pcs'),
(3, 'Farm Tomatoes', 'fruits', 35, 50, 30, 4.5, 156, '🍅', '/products/prod_3.jpg', NULL, '500 g'),
(4, 'Fresh Spinach', 'fruits', 28, 40, 30, 4.7, 98, '🥬', '/products/prod_4.jpg', 'organic', '250 g'),
(5, 'Juicy Oranges', 'fruits', 75, 95, 21, 4.9, 410, '🍊', '/products/prod_5.jpg', NULL, '1 kg'),
(6, 'Green Grapes', 'fruits', 110, 150, 27, 4.6, 201, '🍇', '/products/prod_6.jpg', 'organic', '500 g'),
(7, 'Fresh Full-Fat Milk', 'dairy', 54, 60, 10, 4.9, 512, '🥛', '/products/prod_7.jpg', NULL, '1 litre'),
(8, 'Farm Fresh Eggs', 'dairy', 89, 110, 19, 4.8, 398, '🥚', '/products/prod_8.jpg', 'new', '12 pcs'),
(9, 'Cheddar Cheese Block', 'dairy', 149, 199, 25, 4.7, 173, '🧀', '/products/prod_9.jpg', NULL, '200 g'),
(10, 'Natural Greek Yogurt', 'dairy', 65, 80, 19, 4.5, 245, '🫙', '/products/prod_10.jpg', NULL, '400 g'),
(11, 'Chicken Breast', 'meat', 199, 249, 20, 4.8, 284, '🍗', '/products/prod_11.jpg', NULL, '500 g'),
(12, 'Fresh Salmon Fillet', 'meat', 349, 449, 22, 4.9, 167, '🐟', '/products/prod_12.jpg', 'new', '300 g'),
(13, 'Tiger Prawns', 'meat', 299, 380, 21, 4.7, 132, '🦐', '/products/prod_13.jpg', NULL, '500 g'),
(14, 'Whole Wheat Bread', 'bakery', 45, 55, 18, 4.6, 378, '🍞', '/products/prod_14.jpg', NULL, '400 g'),
(15, 'Butter Croissants', 'bakery', 79, 99, 20, 4.8, 294, '🥐', '/products/prod_15.jpg', 'new', '4 pcs'),
(16, 'Blueberry Muffins', 'bakery', 89, 110, 19, 4.7, 187, '🧁', '/products/prod_16.jpg', NULL, '4 pcs'),
(17, 'Orange Fresh Juice', 'beverages', 65, 85, 24, 4.8, 456, '🍊', '/products/prod_17.jpg', NULL, '1 litre'),
(18, 'Green Tea Bags', 'beverages', 120, 160, 25, 4.7, 312, '🍵', '/products/prod_18.jpg', 'organic', '25 bags'),
(19, 'Sparkling Water', 'beverages', 35, 45, 22, 4.5, 198, '💧', '/products/prod_19.jpg', NULL, '1 litre'),
(20, 'Dark Chocolate Bar', 'snacks', 89, 110, 19, 4.8, 534, '🍫', '/products/prod_20.jpg', NULL, '100 g'),
(21, 'Salted Almonds', 'snacks', 199, 250, 20, 4.9, 302, '🌰', '/products/prod_21.jpg', 'organic', '200 g'),
(22, 'Potato Chips', 'snacks', 35, 45, 22, 4.4, 698, '🥔', '/products/prod_22.jpg', NULL, '70 g'),
(23, 'Neem Face Wash', 'personalcare', 149, 199, 25, 4.7, 312, '🧴', '/products/prod_23.jpg', 'organic', '150 ml'),
(24, 'Aloe Vera Shampoo', 'personalcare', 189, 249, 24, 4.6, 245, '🧖', '/products/prod_24.jpg', NULL, '300 ml'),
(25, 'Moisturizing Lotion', 'personalcare', 129, 179, 28, 4.5, 198, '💊', '/products/prod_25.jpg', NULL, '200 ml'),
(26, 'Charcoal Toothpaste', 'personalcare', 99, 130, 24, 4.8, 421, '🦷', '/products/prod_26.jpg', 'new', '100 g'),
(27, 'Rose Hand Cream', 'personalcare', 75, 99, 24, 4.6, 176, '🌹', '/products/prod_27.jpg', NULL, '50 ml'),
(28, 'Bamboo Toothbrush Set', 'personalcare', 149, 199, 25, 4.9, 287, '🪥', '/products/prod_28.jpg', 'organic', '4 pcs'),
(29, 'Lavender Dish Soap', 'household', 89, 120, 26, 4.7, 334, '🧼', '/products/prod_29.jpg', NULL, '500 ml'),
(30, 'Multi-Surface Cleaner', 'household', 129, 169, 24, 4.6, 212, '🧹', '/products/prod_30.jpg', 'new', '750 ml'),
(31, 'Microfiber Cloth Set', 'household', 199, 259, 23, 4.8, 287, '🧽', '/products/prod_31.jpg', NULL, '6 pcs'),
(32, 'Reusable Garbage Bags', 'household', 79, 99, 20, 4.5, 156, '🗑️', '/products/prod_32.jpg', 'organic', '30 pcs'),
(33, 'Lemon Floor Cleaner', 'household', 99, 129, 23, 4.7, 198, '🫧', '/products/prod_33.jpg', NULL, '1 litre'),
(34, 'Air Freshener Spray', 'household', 149, 199, 25, 4.6, 243, '💨', '/products/prod_34.jpg', 'new', '300 ml'),
(101, 'Organic Apple Basket', 'fruits', 149, 249, 40, 4.9, 287, '🍎', '/products/prod_101.jpg', '40% OFF', '2 kg mix'),
(102, 'Dairy Combo Pack', 'dairy', 189, 280, 33, 4.8, 194, '🥛', '/products/prod_102.jpg', '33% OFF', 'Bundle'),
(103, 'Fresh Bakery Bundle', 'bakery', 129, 210, 39, 4.7, 156, '🥖', '/products/prod_103.jpg', '39% OFF', 'Bundle'),
(104, 'Snack Party Box', 'snacks', 299, 450, 34, 4.8, 221, '🍫', '/products/prod_104.jpg', '34% OFF', 'Assorted')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount = EXCLUDED.discount,
  rating = EXCLUDED.rating,
  reviews = EXCLUDED.reviews,
  emoji = EXCLUDED.emoji,
  image = EXCLUDED.image,
  badge = EXCLUDED.badge,
  unit = EXCLUDED.unit;
