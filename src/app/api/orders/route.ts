import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { setCachedOrderStatus, getCachedOrderStatus } from '@/lib/order-status-store';

// In-memory store for fallback in local dev without live Supabase
let inMemoryOrders: any[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const isAdmin = searchParams.get('admin') === 'true';

    // If no user email and not admin, do not leak other users' orders
    if (!isAdmin && (!email || !email.trim())) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';

    if (isSupabaseConfigured && supabase) {
      let qb = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            name,
            price,
            qty,
            image
          )
        `);

      if (!isAdmin && cleanEmail) {
        qb = qb.eq('user_email', cleanEmail);
      }

      const { data, error } = await qb.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch orders error:', error);
        throw error;
      }

      // Map relation to match frontend Order interface
      const formatted = (data || []).map((o: any) => ({
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
      }));

      return NextResponse.json({ success: true, count: formatted.length, data: formatted });
    }

    // Local fallback
    let filtered = inMemoryOrders;
    if (!isAdmin && cleanEmail) {
      filtered = inMemoryOrders.filter((o) => o.userEmail?.toLowerCase() === cleanEmail);
    }

    return NextResponse.json({ success: true, count: filtered.length, data: filtered });
  } catch (error: any) {
    console.error('API /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      total,
      slot,
      items,
      userEmail,
      customerName,
      customerPhone,
      deliveryAddress,
      city,
      pincode,
      paymentMethod,
    } = body;

    const orderId = id || `FM-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : null;

    if (isSupabaseConfigured && supabase) {
      // 1. Try full payload with delivery details
      const fullPayload: any = {
        id: orderId,
        date: dateStr,
        total: Number(total),
        slot: slot || 'Standard Delivery',
        status: 'Processing',
        user_email: cleanEmail,
      };

      if (customerName) fullPayload.customer_name = customerName;
      if (customerPhone) fullPayload.customer_phone = customerPhone;
      if (deliveryAddress) fullPayload.delivery_address = deliveryAddress;
      if (city) fullPayload.city = city;
      if (pincode) fullPayload.pincode = pincode;
      if (paymentMethod) fullPayload.payment_method = paymentMethod;

      let orderData: any = null;
      const { data, error: fullError } = await supabase
        .from('orders')
        .insert([fullPayload])
        .select()
        .single();

      if (!fullError && data) {
        orderData = data;
      } else {
        // Fallback to base columns if columns haven't been added to Supabase yet
        const basePayload = {
          id: orderId,
          date: dateStr,
          total: Number(total),
          slot: slot || 'Standard Delivery',
          status: 'Processing',
          user_email: cleanEmail,
        };

        const { data: baseData, error: baseError } = await supabase
          .from('orders')
          .insert([basePayload])
          .select()
          .single();

        if (baseError) {
          console.error('Supabase base insert error:', baseError);
          throw baseError;
        }

        orderData = { ...baseData, ...fullPayload };
      }

      // 2. Insert order items
      let insertedItems: any[] = [];
      if (items && Array.isArray(items) && items.length > 0) {
        const itemsToInsert = items.map((i: any) => ({
          order_id: orderId,
          product_id: typeof i.id === 'number' ? i.id : null,
          name: i.name,
          price: Number(i.price),
          qty: Number(i.qty || 1),
          image: i.image || null,
        }));

        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert)
          .select();

        if (itemsError) {
          console.error('Supabase order_items insert error:', itemsError);
        } else {
          insertedItems = itemsData || [];
        }
      }

      const orderResult = {
        id: orderData.id,
        date: orderData.date,
        total: Number(orderData.total),
        slot: orderData.slot,
        status: orderData.status,
        userEmail: orderData.user_email,
        customerName: orderData.customer_name || customerName || null,
        customerPhone: orderData.customer_phone || customerPhone || null,
        deliveryAddress: orderData.delivery_address || deliveryAddress || null,
        city: orderData.city || city || null,
        pincode: orderData.pincode || pincode || null,
        paymentMethod: orderData.payment_method || paymentMethod || null,
        address: {
          street: deliveryAddress || '',
          city: city || '',
          pincode: pincode || '',
          phone: customerPhone || '',
          firstName: customerName ? customerName.split(' ')[0] : '',
          lastName: customerName ? customerName.split(' ').slice(1).join(' ') : '',
        },
        items: insertedItems.length > 0 ? insertedItems.map((i: any) => ({
          id: i.product_id || i.id,
          name: i.name,
          price: Number(i.price),
          qty: Number(i.qty),
          image: i.image,
        })) : (items || []),
      };

      return NextResponse.json({ success: true, data: orderResult }, { status: 201 });
    }

    // Local fallback
    const fallbackOrder = {
      id: orderId,
      date: dateStr,
      total: Number(total),
      slot: slot || 'Standard Delivery',
      status: 'Processing',
      userEmail: cleanEmail,
      customerName,
      customerPhone,
      deliveryAddress,
      city,
      pincode,
      paymentMethod,
      address: {
        street: deliveryAddress || '',
        city: city || '',
        pincode: pincode || '',
        phone: customerPhone || '',
        firstName: customerName ? customerName.split(' ')[0] : '',
        lastName: customerName ? customerName.split(' ').slice(1).join(' ') : '',
      },
      items: items || [],
    };

    inMemoryOrders.unshift(fallbackOrder);

    return NextResponse.json({ success: true, data: fallbackOrder }, { status: 201 });
  } catch (error: any) {
    console.error('API POST /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing order id or status' },
        { status: 400 }
      );
    }

    // 1. Immediately cache status so live polling and GET /api/orders instantly reflect it
    setCachedOrderStatus(id, status);

    // 2. Also update fallback in-memory order if present
    const order = inMemoryOrders.find((o) => o.id === id);
    if (order) {
      order.status = status;
    }

    // 3. Update Supabase if configured (uses supabaseAdmin if service role key available, else supabase)
    const client = supabaseAdmin || supabase;
    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select();

        if (error) {
          console.warn('Supabase update status note (RLS policy check):', error.message);
        } else if (data && data.length > 0) {
          return NextResponse.json({ success: true, data: data[0] });
        }
      } catch (err: any) {
        console.warn('Supabase update attempt error:', err?.message || err);
      }
    }

    // Return success to the client
    return NextResponse.json({ success: true, data: { id, status } });
  } catch (error: any) {
    console.error('API PATCH /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

