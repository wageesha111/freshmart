import { Product, Category } from '@/types';

export const PRODUCTS: Product[] = [
  // Fruits & Vegetables
  { id: 1, name: "Fresh Red Apples", category: "fruits", price: 89, originalPrice: 120, discount: 26, rating: 4.8, reviews: 342, emoji: "🍎", image: "/products/prod_1.jpg", badge: "organic", unit: "1 kg" },
  { id: 2, name: "Organic Bananas", category: "fruits", price: 45, originalPrice: 60, discount: 25, rating: 4.6, reviews: 218, emoji: "🍌", image: "/products/prod_2.jpg", badge: "organic", unit: "6 pcs" },
  { id: 3, name: "Farm Tomatoes", category: "fruits", price: 35, originalPrice: 50, discount: 30, rating: 4.5, reviews: 156, emoji: "🍅", image: "/products/prod_3.jpg", badge: null, unit: "500 g" },
  { id: 4, name: "Fresh Spinach", category: "fruits", price: 28, originalPrice: 40, discount: 30, rating: 4.7, reviews: 98, emoji: "🥬", image: "/products/prod_4.jpg", badge: "organic", unit: "250 g" },
  { id: 5, name: "Juicy Oranges", category: "fruits", price: 75, originalPrice: 95, discount: 21, rating: 4.9, reviews: 410, emoji: "🍊", image: "/products/prod_5.jpg", badge: null, unit: "1 kg" },
  { id: 6, name: "Green Grapes", category: "fruits", price: 110, originalPrice: 150, discount: 27, rating: 4.6, reviews: 201, emoji: "🍇", image: "/products/prod_6.jpg", badge: "organic", unit: "500 g" },

  // Dairy & Eggs
  { id: 7, name: "Fresh Full-Fat Milk", category: "dairy", price: 54, originalPrice: 60, discount: 10, rating: 4.9, reviews: 512, emoji: "🥛", image: "/products/prod_7.jpg", badge: null, unit: "1 litre" },
  { id: 8, name: "Farm Fresh Eggs", category: "dairy", price: 89, originalPrice: 110, discount: 19, rating: 4.8, reviews: 398, emoji: "🥚", image: "/products/prod_8.jpg", badge: "new", unit: "12 pcs" },
  { id: 9, name: "Cheddar Cheese Block", category: "dairy", price: 149, originalPrice: 199, discount: 25, rating: 4.7, reviews: 173, emoji: "🧀", image: "/products/prod_9.jpg", badge: null, unit: "200 g" },
  { id: 10, name: "Natural Greek Yogurt", category: "dairy", price: 65, originalPrice: 80, discount: 19, rating: 4.5, reviews: 245, emoji: "🫙", image: "/products/prod_10.jpg", badge: null, unit: "400 g" },

  // Meat & Seafood
  { id: 11, name: "Chicken Breast", category: "meat", price: 199, originalPrice: 249, discount: 20, rating: 4.8, reviews: 284, emoji: "🍗", image: "/products/prod_11.jpg", badge: null, unit: "500 g" },
  { id: 12, name: "Fresh Salmon Fillet", category: "meat", price: 349, originalPrice: 449, discount: 22, rating: 4.9, reviews: 167, emoji: "🐟", image: "/products/prod_12.jpg", badge: "new", unit: "300 g" },
  { id: 13, name: "Tiger Prawns", category: "meat", price: 299, originalPrice: 380, discount: 21, rating: 4.7, reviews: 132, emoji: "🦐", image: "/products/prod_13.jpg", badge: null, unit: "500 g" },

  // Bakery & Breads
  { id: 14, name: "Whole Wheat Bread", category: "bakery", price: 45, originalPrice: 55, discount: 18, rating: 4.6, reviews: 378, emoji: "🍞", image: "/products/prod_14.jpg", badge: null, unit: "400 g" },
  { id: 15, name: "Butter Croissants", category: "bakery", price: 79, originalPrice: 99, discount: 20, rating: 4.8, reviews: 294, emoji: "🥐", image: "/products/prod_15.jpg", badge: "new", unit: "4 pcs" },
  { id: 16, name: "Blueberry Muffins", category: "bakery", price: 89, originalPrice: 110, discount: 19, rating: 4.7, reviews: 187, emoji: "🧁", image: "/products/prod_16.jpg", badge: null, unit: "4 pcs" },

  // Beverages
  { id: 17, name: "Orange Fresh Juice", category: "beverages", price: 65, originalPrice: 85, discount: 24, rating: 4.8, reviews: 456, emoji: "🍊", image: "/products/prod_17.jpg", badge: null, unit: "1 litre" },
  { id: 18, name: "Green Tea Bags", category: "beverages", price: 120, originalPrice: 160, discount: 25, rating: 4.7, reviews: 312, emoji: "🍵", image: "/products/prod_18.jpg", badge: "organic", unit: "25 bags" },
  { id: 19, name: "Sparkling Water", category: "beverages", price: 35, originalPrice: 45, discount: 22, rating: 4.5, reviews: 198, emoji: "💧", image: "/products/prod_19.jpg", badge: null, unit: "1 litre" },

  // Snacks
  { id: 20, name: "Dark Chocolate Bar", category: "snacks", price: 89, originalPrice: 110, discount: 19, rating: 4.8, reviews: 534, emoji: "🍫", image: "/products/prod_20.jpg", badge: null, unit: "100 g" },
  { id: 21, name: "Salted Almonds", category: "snacks", price: 199, originalPrice: 250, discount: 20, rating: 4.9, reviews: 302, emoji: "🌰", image: "/products/prod_21.jpg", badge: "organic", unit: "200 g" },
  { id: 22, name: "Potato Chips", category: "snacks", price: 35, originalPrice: 45, discount: 22, rating: 4.4, reviews: 698, emoji: "🥔", image: "/products/prod_22.jpg", badge: null, unit: "70 g" },

  // Personal Care
  { id: 23, name: "Neem Face Wash", category: "personalcare", price: 149, originalPrice: 199, discount: 25, rating: 4.7, reviews: 312, emoji: "🧴", image: "/products/prod_23.jpg", badge: "organic", unit: "150 ml" },
  { id: 24, name: "Aloe Vera Shampoo", category: "personalcare", price: 189, originalPrice: 249, discount: 24, rating: 4.6, reviews: 245, emoji: "🧖", image: "/products/prod_24.jpg", badge: null, unit: "300 ml" },
  { id: 25, name: "Moisturizing Lotion", category: "personalcare", price: 129, originalPrice: 179, discount: 28, rating: 4.5, reviews: 198, emoji: "💊", image: "/products/prod_25.jpg", badge: null, unit: "200 ml" },
  { id: 26, name: "Charcoal Toothpaste", category: "personalcare", price: 99, originalPrice: 130, discount: 24, rating: 4.8, reviews: 421, emoji: "🦷", image: "/products/prod_26.jpg", badge: "new", unit: "100 g" },
  { id: 27, name: "Rose Hand Cream", category: "personalcare", price: 75, originalPrice: 99, discount: 24, rating: 4.6, reviews: 176, emoji: "🌹", image: "/products/prod_27.jpg", badge: null, unit: "50 ml" },
  { id: 28, name: "Bamboo Toothbrush Set", category: "personalcare", price: 149, originalPrice: 199, discount: 25, rating: 4.9, reviews: 287, emoji: "🪥", image: "/products/prod_28.jpg", badge: "organic", unit: "4 pcs" },

  // Household
  { id: 29, name: "Lavender Dish Soap", category: "household", price: 89, originalPrice: 120, discount: 26, rating: 4.7, reviews: 334, emoji: "🧼", image: "/products/prod_29.jpg", badge: null, unit: "500 ml" },
  { id: 30, name: "Multi-Surface Cleaner", category: "household", price: 129, originalPrice: 169, discount: 24, rating: 4.6, reviews: 212, emoji: "🧹", image: "/products/prod_30.jpg", badge: "new", unit: "750 ml" },
  { id: 31, name: "Microfiber Cloth Set", category: "household", price: 199, originalPrice: 259, discount: 23, rating: 4.8, reviews: 287, emoji: "🧽", image: "/products/prod_31.jpg", badge: null, unit: "6 pcs" },
  { id: 32, name: "Reusable Garbage Bags", category: "household", price: 79, originalPrice: 99, discount: 20, rating: 4.5, reviews: 156, emoji: "🗑️", image: "/products/prod_32.jpg", badge: "organic", unit: "30 pcs" },
  { id: 33, name: "Lemon Floor Cleaner", category: "household", price: 99, originalPrice: 129, discount: 23, rating: 4.7, reviews: 198, emoji: "🫧", image: "/products/prod_33.jpg", badge: null, unit: "1 litre" },
  { id: 34, name: "Air Freshener Spray", category: "household", price: 149, originalPrice: 199, discount: 25, rating: 4.6, reviews: 243, emoji: "💨", image: "/products/prod_34.jpg", badge: "new", unit: "300 ml" },
];

export const DEALS: Product[] = [
  { id: 101, name: "Organic Apple Basket", category: "fruits", price: 149, originalPrice: 249, discount: 40, rating: 4.9, reviews: 287, emoji: "🍎", image: "/products/prod_101.jpg", badge: "40% OFF", unit: "2 kg mix" },
  { id: 102, name: "Dairy Combo Pack", category: "dairy", price: 189, originalPrice: 280, discount: 33, rating: 4.8, reviews: 194, emoji: "🥛", image: "/products/prod_102.jpg", badge: "33% OFF", unit: "Bundle" },
  { id: 103, name: "Fresh Bakery Bundle", category: "bakery", price: 129, originalPrice: 210, discount: 39, rating: 4.7, reviews: 156, emoji: "🥖", image: "/products/prod_103.jpg", badge: "39% OFF", unit: "Bundle" },
  { id: 104, name: "Snack Party Box", category: "snacks", price: 299, originalPrice: 450, discount: 34, rating: 4.8, reviews: 221, emoji: "🍫", image: "/products/prod_104.jpg", badge: "34% OFF", unit: "Assorted" },
];

export const ALL_PRODUCTS: Product[] = [...PRODUCTS, ...DEALS];

export const CATEGORIES: Category[] = [
  { id: 'fruits', name: 'Fruits & Veggies', icon: '🍎', image: '/cat_fruits.png', count: 180 },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', image: '/cat_dairy.png', count: 95 },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩', image: '/cat_meat.png', count: 65 },
  { id: 'bakery', name: 'Bakery & Bread', icon: '🥖', image: '/cat_bakery.png', count: 70 },
  { id: 'beverages', name: 'Beverages', icon: '🥤', image: '/cat_beverages.png', count: 120 },
  { id: 'snacks', name: 'Snacks & Munchies', icon: '🍫', image: '/cat_snacks.png', count: 145 },
  { id: 'personalcare', name: 'Personal Care', icon: '🧴', image: '/cat_personalcare.png', count: 110 },
  { id: 'household', name: 'Household Essentials', icon: '🧹', image: '/cat_household.png', count: 85 },
];
