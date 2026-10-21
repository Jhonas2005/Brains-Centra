import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// The function must be named GET in all caps and have the 'export' keyword
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ inquiries: data || [] });
  } catch (error) {
    console.error('Fetch user inquiries error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}