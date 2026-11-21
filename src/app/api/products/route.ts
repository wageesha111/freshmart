import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured, MISSING_SERVICE_KEY_ERROR } from '@/lib/supabase';
import { addStoreProduct } from '@/lib/product-store';
import { getCatalog } from '@/lib/catalog';
import { forbiddenAdmin, isAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const sort = searchParams.get('sort');

    let list = await getCatalog();

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
  if (!isAdmin(request)) return forbiddenAdmin();
  if (isSupabaseConfigured && !supabaseAdmin) {
    return NextResponse.json({ success: false, error: MISSING_SERVICE_KEY_ERROR }, { status: 500 });
  }

  try {
    const body = await request.json();

    const price = Number(body.price);
    if (typeof body.name !== 'string' || !body.name.trim() || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ success: false, error: 'Name and a valid price are required' }, { status: 400 });
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
    const client = supabaseAdmin;
    if (client) {
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
