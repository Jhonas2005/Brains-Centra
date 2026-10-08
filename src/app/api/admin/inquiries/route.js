import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ inquiries: data });
  } catch (error) {
    console.error('Fetch Inquiries Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, newStatus } = body;

    if (action === 'updateStatus') {
      const { error } = await supabaseAdmin
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
    } else if (action === 'delete') {
      const { error } = await supabaseAdmin
        .from('inquiries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mutate Inquiry Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}