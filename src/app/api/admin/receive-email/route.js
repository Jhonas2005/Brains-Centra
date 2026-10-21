import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    // Inbound email services usually send multipart/form-data
    const formData = await request.formData();
    
    const from = formData.get('from') || '';
    const subject = formData.get('subject') || 'No Subject';
    const textBody = formData.get('text') || formData.get('text-body') || '';

    // Extract the raw email address from formats like "John Doe <john@company.com>"
    const emailMatch = from.match(/<(.+)>/);
    const customerEmail = emailMatch ? emailMatch[1] : from;
    const customerName = from.split('<')[0].trim() || 'Customer';

    // Insert the incoming email into your existing Supabase Inquiries table
    const { error } = await supabaseAdmin
      .from('inquiries')
      .insert([{
        type: 'Email Reply',
        subject: `Re: ${subject.replace(/Re: /ig, '')}`,
        name: customerName,
        email: customerEmail,
        company: 'From Inbox',
        details: textBody,
        status: 'Pending'
      }]);

    if (error) throw error;

    // Return a 200 OK so the email provider knows it was received successfully
    return NextResponse.json({ success: true, message: 'Email parsed and saved.' });
  } catch (error) {
    console.error('Inbound Email Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}