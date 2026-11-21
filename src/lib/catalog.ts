import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { getAllStoreProducts } from '@/lib/product-store';

function fromDb(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice ?? p.original_price ?? p.price),
    discount: Number(p.discount || 0),
    rating: Number(p.rating || 4.8),
    reviews: Number(p.reviews || 0),
    emoji: p.emoji || '🥬',
    image: p.image || '/products/prod_1.jpg',
    badge: p.badge || null,
    unit: p.unit || '1 unit',
  };
}

/**
 * Full product catalogue: in-memory store (authoritative for edits/adds made on
 * this server) plus any extra products that only exist in Supabase.
 */
export async function getCatalog(): Promise<Product[]> {
  let list = [...getAllStoreProducts()];
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        const localIds = new Set(list.map((p) => p.id));
        list = [...list, ...data.map(fromDb).filter((p) => !localIds.has(p.id))];
      }
    } catch (err) {
      console.warn('Supabase product query fallback:', err);
    }
  }
  return list;
}
