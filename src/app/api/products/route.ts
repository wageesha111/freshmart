import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getAllStoreProducts, addStoreProduct } from '@/lib/product-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const sort = searchParams.get('sort');

    let list = getAllStoreProducts();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) {
          const supabaseFormatted = data.map((p: any) => ({
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
          }));

          // Merge: Keep active store products (authoritative for edits/adds) and include any additional Supabase products
          const localIds = new Set(list.map((p) => p.id));
          const supabaseExtra = supabaseFormatted.filter((p: any) => !localIds.has(p.id));
          list = [...list, ...supabaseExtra];
        }
      } catch (err) {
        console.warn('Supabase product query fallback:', err);
      }
    }

    if (category && category !== 'all') {
      list = list.filter((p) => p.category === category);
    }

    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    console.error('API /api/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.price) {
      return NextResponse.json({ success: false, error: 'Name and price are required' }, { status: 400 });
    }

    // 1. Add to synchronized product store immediately
    const newProduct = addStoreProduct({
      id: body.id ? Number(body.id) : undefined,
      name: body.name.trim(),
      category: body.category || 'fruits',
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : (body.original_price ? Number(body.original_price) : Number(body.price)),
      discount: body.discount || 0,
      unit: body.unit || '1 kg',
      emoji: body.emoji || '🥬',
      image: body.image || '/products/prod_1.jpg',
      badge: body.badge || null,
      rating: 4.8,
      reviews: 1,
    });

    // 2. Attempt insert to Supabase
    const client = supabaseAdmin || supabase;
    if (isSupabaseConfigured && client) {
      try {
        const supabasePayload = {
          id: newProduct.id,
          name: newProduct.name,
          category: newProduct.category,
          price: newProduct.price,
          original_price: newProduct.originalPrice,
          discount: newProduct.discount,
          unit: newProduct.unit,
          emoji: newProduct.emoji,
          image: newProduct.image,
          badge: newProduct.badge,
          rating: newProduct.rating,
          reviews: newProduct.reviews,
        };

        const { error } = await client.from('products').insert([supabasePayload]);
        if (error) {
          console.warn('Supabase product insert note (RLS policy check):', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase product insert warning:', err?.message || err);
      }
    }

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('API POST /api/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
