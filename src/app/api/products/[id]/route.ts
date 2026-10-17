import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getAllStoreProducts, updateStoreProduct, deleteStoreProduct } from '@/lib/product-store';
import { Product } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = getAllStoreProducts().find((p) => p.id === id);
    if (product) {
      return NextResponse.json({ success: true, data: product });
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        const formatted = {
          ...data,
          originalPrice: data.originalPrice ?? data.original_price,
        };
        return NextResponse.json({ success: true, data: formatted });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('API GET /api/products/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();

    // 1. Update in-memory store with defined fields only
    const updates: Partial<Product> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.originalPrice !== undefined) updates.originalPrice = Number(body.originalPrice);
    if (body.original_price !== undefined) updates.originalPrice = Number(body.original_price);
    if (body.unit !== undefined) updates.unit = body.unit;
    if (body.badge !== undefined) updates.badge = body.badge;
    if (body.image !== undefined) updates.image = body.image;
    if (body.emoji !== undefined) updates.emoji = body.emoji;
    if (body.discount !== undefined) updates.discount = Number(body.discount);

    const updated = updateStoreProduct(id, updates);

    // 2. Attempt Supabase update
    const client = supabaseAdmin || supabase;
    if (isSupabaseConfigured && client) {
      try {
        const updateData: any = {};
        if (body.price !== undefined) updateData.price = Number(body.price);
        if (body.originalPrice !== undefined) updateData.original_price = Number(body.originalPrice);
        if (body.original_price !== undefined) updateData.original_price = Number(body.original_price);
        if (body.name !== undefined) updateData.name = body.name;
        if (body.category !== undefined) updateData.category = body.category;
        if (body.unit !== undefined) updateData.unit = body.unit;
        if (body.badge !== undefined) updateData.badge = body.badge;
        if (body.image !== undefined) updateData.image = body.image;
        if (body.emoji !== undefined) updateData.emoji = body.emoji;

        await client.from('products').update(updateData).eq('id', id);
      } catch (err: any) {
        console.warn('Supabase product update note (RLS):', err?.message || err);
      }
    }

    return NextResponse.json({ success: true, data: updated || { id, ...body } });
  } catch (error: any) {
    console.error('API PATCH /api/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    deleteStoreProduct(id);

    const client = supabaseAdmin || supabase;
    if (isSupabaseConfigured && client) {
      try {
        await client.from('products').delete().eq('id', id);
      } catch (err: any) {
        console.warn('Supabase product delete note:', err?.message || err);
      }
    }

    return NextResponse.json({ success: true, message: `Product ${id} deleted` });
  } catch (error: any) {
    console.error('API DELETE /api/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}

