import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { supabaseAdmin, useMemoryFallback, MISSING_SERVICE_KEY_ERROR } from '@/lib/supabase';
import { setCachedOrderStatus, getCachedOrderStatus } from '@/lib/order-status-store';
import { forbiddenAdmin, getCustomerSession, isAdmin, unauthorized } from '@/lib/session';
import { getCatalog } from '@/lib/catalog';
import { computeTotals, promoDiscountFor } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ['Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

// In-memory store for local demo mode (no Supabase)
const globalForOrders = globalThis as unknown as { __fmOrders?: any[] };
const inMemoryOrders: any[] = globalForOrders.__fmOrders || (globalForOrders.__fmOrders = []);

const misconfigured = () =>
  NextResponse.json({ success: false, error: MISSING_SERVICE_KEY_ERROR }, { status: 500 });

/** Trim a user-supplied string field and cap its length. */
function str(value: unknown, max = 200): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v ? v.slice(0, max) : null;
}

function formatDbOrder(o: any) {
  return {
    id: o.id,
    date: o.date,
    total: Number(o.total),
    slot: o.slot,
    status: getCachedOrderStatus(o.id) || o.status,
    userEmail: o.user_email,
    customerName: o.customer_name || null,
    customerPhone: o.customer_phone || null,
    deliveryAddress: o.delivery_address || null,
    city: o.city || null,
    pincode: o.pincode || null,
    paymentMethod: o.payment_method || null,
    address: {
      street: o.delivery_address || '',
      city: o.city || '',
      pincode: o.pincode || '',
      phone: o.customer_phone || '',
      firstName: o.customer_name ? o.customer_name.split(' ')[0] : '',
      lastName: o.customer_name ? o.customer_name.split(' ').slice(1).join(' ') : '',
    },
    items: (o.order_items || []).map((i: any) => ({
      id: i.product_id || i.id,
      name: i.name,
      price: Number(i.price),
      qty: Number(i.qty),
      image: i.image,
    })),
  };
}

// ---------------------------------------------------------------------------
// GET /api/orders            -> the signed-in customer's own orders
// GET /api/orders?admin=true -> all orders (admin session required)
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wantsAll = searchParams.get('admin') === 'true';

    let email: string | null = null;
    if (wantsAll) {
      if (!isAdmin(request)) return forbiddenAdmin();
    } else {
      const session = getCustomerSession(request);
      if (!session) return unauthorized();
      email = session.email;
    }

    if (supabaseAdmin) {
      let qb = supabaseAdmin
        .from('orders')
        .select('*, order_items ( id, product_id, name, price, qty, image )');
      if (email) qb = qb.eq('user_email', email);

      const { data, error } = await qb.order('created_at', { ascending: false });
      if (error) throw error;

      const formatted = (data || []).map(formatDbOrder);
      return NextResponse.json({ success: true, count: formatted.length, data: formatted });
    }

    if (!useMemoryFallback) return misconfigured();

    const filtered = email
      ? inMemoryOrders.filter((o) => o.userEmail?.toLowerCase() === email)
      : inMemoryOrders;
    return NextResponse.json({ success: true, count: filtered.length, data: filtered });
  } catch (error: any) {
    console.error('API /api/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/orders -> place an order (customer session required).
// Prices and totals are calculated here from the product catalogue.
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const session = getCustomerSession(request);
    if (!session) return unauthorized('Please sign in to place an order.');

    const body = await request.json().catch(() => ({}));

    // 1. Validate items and look up real prices
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
      return NextResponse.json({ success: false, error: 'Your cart is empty.' }, { status: 400 });
    }

    const catalog = await getCatalog();
    const byId = new Map(catalog.map((p) => [p.id, p]));
    const lineItems: { product_id: number; name: string; price: number; qty: number; image: string | null }[] = [];

    for (const raw of body.items) {
      const id = Number(raw?.id);
      const qty = Number(raw?.qty ?? 1);
      const product = byId.get(id);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `A product in your cart is no longer available (id ${raw?.id}).` },
          { status: 400 }
        );
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        return NextResponse.json({ success: false, error: `Invalid quantity for ${product.name}.` }, { status: 400 });
      }
      lineItems.push({ product_id: product.id, name: product.name, price: product.price, qty, image: product.image || null });
    }

    const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const promoCode = str(body.promoCode, 30);
    if (promoCode && promoDiscountFor(promoCode, subtotal) === null) {
      return NextResponse.json({ success: false, error: 'Invalid promo code.' }, { status: 400 });
    }
    const totals = computeTotals(subtotal, promoCode);

    // 2. Delivery details
    const customerName = str(body.customerName, 100) || session.name;
    const customerPhone = str(body.customerPhone, 30);
    const deliveryAddress = str(body.deliveryAddress, 300);
    const city = str(body.city, 100);
    const pincode = str(body.pincode, 20);
    const paymentMethod = str(body.paymentMethod, 50) || 'Cash on Delivery';
    const slot = str(body.slot, 100) || 'Standard Delivery';

    if (!customerPhone || !deliveryAddress || !city) {
      return NextResponse.json(
        { success: false, error: 'Phone number, address and city are required.' },
        { status: 400 }
      );
    }

    const requestedId = typeof body.id === 'string' && /^FM-\d{6}$/.test(body.id) ? body.id : null;
    const newId = () => `FM-${randomInt(100000, 1000000)}`;
    const dateStr = new Date().toLocaleDateString('en-LK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Colombo',
    });

    const result = {
      id: requestedId || newId(),
      date: dateStr,
      total: totals.total,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      promoDiscount: totals.promoDiscount,
      slot,
      status: 'Processing',
      userEmail: session.email,
      customerName,
      customerPhone,
      deliveryAddress,
      city,
      pincode,
      paymentMethod,
      address: {
        street: deliveryAddress,
        city,
        pincode: pincode || '',
        phone: customerPhone,
        firstName: customerName.split(' ')[0],
        lastName: customerName.split(' ').slice(1).join(' '),
      },
      items: lineItems.map((i) => ({ id: i.product_id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
    };

    if (supabaseAdmin) {
      const row = () => ({
        id: result.id,
        date: result.date,
        total: result.total,
        slot: result.slot,
        status: result.status,
        user_email: result.userEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        city,
        pincode,
        payment_method: paymentMethod,
      });

      let { error } = await supabaseAdmin.from('orders').insert([row()]);
      // Retry once with a fresh ID if the order number already exists
      if (error && (error as any).code === '23505') {
        result.id = newId();
        ({ error } = await supabaseAdmin.from('orders').insert([row()]));
      }
      if (error) throw error;

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(lineItems.map((i) => ({ ...i, order_id: result.id })));
      if (itemsError) {
        // Don't leave an order without its items
        await supabaseAdmin.from('orders').delete().eq('id', result.id);
        throw itemsError;
      }
    } else if (useMemoryFallback) {
      if (inMemoryOrders.some((o) => o.id === result.id)) result.id = newId();
      inMemoryOrders.unshift(result);
    } else {
      return misconfigured();
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error('API POST /api/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/orders -> update order status (admin only)
// ---------------------------------------------------------------------------
export async function PATCH(request: Request) {
  try {
    if (!isAdmin(request)) return forbiddenAdmin();

    const { id, status } = await request.json().catch(() => ({}));
    if (typeof id !== 'string' || !id || typeof status !== 'string' || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Missing order id or invalid status (allowed: ${ALLOWED_STATUSES.join(', ')})` },
        { status: 400 }
      );
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('orders').update({ status }).eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      setCachedOrderStatus(id, status);
      return NextResponse.json({ success: true, data: data[0] });
    }

    if (!useMemoryFallback) return misconfigured();

    const order = inMemoryOrders.find((o) => o.id === id);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    order.status = status;
    setCachedOrderStatus(id, status);
    return NextResponse.json({ success: true, data: { id, status } });
  } catch (error: any) {
    console.error('API PATCH /api/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
  }
}
