import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, subject, name, email, company, details } = body;

    // Insert the data into Supabase
    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .insert([
        { type, subject, name, email, company, details }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Inquiry Submission Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}