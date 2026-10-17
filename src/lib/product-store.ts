import { Product } from '@/types';
import { ALL_PRODUCTS } from '@/data/products';

// Persist store on globalThis so it is shared across all API routes in Next.js
const globalForProducts = globalThis as unknown as {
  inMemoryProductsStore?: Product[];
};

if (!globalForProducts.inMemoryProductsStore) {
  globalForProducts.inMemoryProductsStore = [...ALL_PRODUCTS];
}

export function getAllStoreProducts(): Product[] {
  if (!globalForProducts.inMemoryProductsStore) {
    globalForProducts.inMemoryProductsStore = [...ALL_PRODUCTS];
  }
  return globalForProducts.inMemoryProductsStore;
}

export function addStoreProduct(product: Omit<Product, 'id'> & { id?: number }): Product {
  const list = getAllStoreProducts();
  const nextId = product.id || (Math.max(0, ...list.map((p) => p.id)) + 1);
  const newProduct: Product = {
    id: nextId,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    originalPrice: Number(product.originalPrice || product.price),
    discount: product.discount || (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0),
    rating: product.rating || 4.8,
    reviews: product.reviews || 1,
    emoji: product.emoji || '🥬',
    image: product.image || '/products/prod_1.jpg',
    badge: product.badge || null,
    unit: product.unit || '1 unit',
  };

  // Prepend so new products appear at the top of the catalog
  globalForProducts.inMemoryProductsStore = [newProduct, ...list];
  return newProduct;
}

export function updateStoreProduct(id: number, updates: Partial<Product>): Product | null {
  const list = getAllStoreProducts();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = list[index];
  const cleanedUpdates: Partial<Product> = {};
  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined) {
      (cleanedUpdates as any)[key] = val;
    }
  }

  const updated: Product = {
    ...current,
    ...cleanedUpdates,
    price: cleanedUpdates.price !== undefined ? Number(cleanedUpdates.price) : current.price,
    originalPrice: cleanedUpdates.originalPrice !== undefined ? Number(cleanedUpdates.originalPrice) : current.originalPrice,
  };

  if (updated.originalPrice && updated.originalPrice > updated.price) {
    updated.discount = Math.round(((updated.originalPrice - updated.price) / updated.originalPrice) * 100);
  }

  const copy = [...list];
  copy[index] = updated;
  globalForProducts.inMemoryProductsStore = copy;
  return updated;
}

export function deleteStoreProduct(id: number): boolean {
  const list = getAllStoreProducts();
  const initialLength = list.length;
  globalForProducts.inMemoryProductsStore = list.filter((p) => p.id !== id);
  return globalForProducts.inMemoryProductsStore.length < initialLength;
}
