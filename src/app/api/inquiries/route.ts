import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CustomerInquiry } from '@/types';

// In-memory fallback inquiries store for local dev and serverless continuity
let inMemoryInquiries: CustomerInquiry[] = [
  {
    id: 'INQ-1001',
    name: 'Kasun Perera',
    email: 'kasun.p@gmail.com',
    phone: '077 123 4567',
    subject: 'Express Delivery to Negombo',
    message: 'Hello, do you provide 2-hour express delivery to Negombo town on Sunday mornings? I want to place a regular weekly produce order.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    status: 'New',
  },
  {
    id: 'INQ-1002',
    name: 'Dilini Silva',
    email: 'dilini.silva@yahoo.com',
    phone: '071 987 6543',
    subject: 'Organic Farm Fruit Baskets',
    message: 'Can I customize the seasonal fruit box for a corporate gift hamper? Need around 15 baskets by Friday.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: 'Replied',
  },
];

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: CustomerInquiry[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone || '',
          subject: item.subject || 'General Inquiry',
          message: item.message,
          createdAt: item.created_at || new Date().toISOString(),
          status: item.status || 'New',
        }));
        return NextResponse.json({ success: true, count: formatted.length, data: formatted });
      }
    }

    return NextResponse.json({
      success: true,
      count: inMemoryInquiries.length,
      data: inMemoryInquiries,
    });
  } catch (err: any) {
    console.error('Error fetching inquiries:', err);
    return NextResponse.json({
      success: true,
      count: inMemoryInquiries.length,
      data: inMemoryInquiries,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const newInquiry: CustomerInquiry = {
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      subject: subject ? String(subject).trim() : 'Website Customer Inquiry',
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
      status: 'New',
    };

    // Prepend to in-memory store
    inMemoryInquiries.unshift(newInquiry);

    // If Supabase is available, sync to DB
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('inquiries').insert([
          {
            id: newInquiry.id,
            name: newInquiry.name,
            email: newInquiry.email,
            phone: newInquiry.phone,
            subject: newInquiry.subject,
            message: newInquiry.message,
            status: newInquiry.status,
            created_at: newInquiry.createdAt,
          },
        ]);
      } catch (dbErr) {
        console.warn('Could not insert inquiry to Supabase, stored in memory:', dbErr);
      }
    }

    return NextResponse.json({ success: true, data: newInquiry });
  } catch (err: any) {
    console.error('Error saving inquiry:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID and new status are required' },
        { status: 400 }
      );
    }

    inMemoryInquiries = inMemoryInquiries.map((inq) =>
      inq.id === id ? { ...inq, status } : inq
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('inquiries').update({ status }).eq('id', id);
      } catch (dbErr) {
        console.warn('Could not update inquiry status in Supabase:', dbErr);
      }
    }

    return NextResponse.json({ success: true, message: `Inquiry ${id} updated to ${status}` });
  } catch (err: any) {
    console.error('Error updating inquiry status:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Inquiry ID required' }, { status: 400 });
    }

    inMemoryInquiries = inMemoryInquiries.filter((inq) => inq.id !== id);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('inquiries').delete().eq('id', id);
      } catch (dbErr) {
        console.warn('Could not delete inquiry in Supabase:', dbErr);
      }
    }

    return NextResponse.json({ success: true, message: `Inquiry ${id} deleted` });
  } catch (err: any) {
    console.error('Error deleting inquiry:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
