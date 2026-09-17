import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// THIS LINE IS CRITICAL: It must be exactly 'export async function POST'
export async function POST(req) {
  try {
    const { userId, email, action, name } = await req.json();

    // 1. Update the user's status in Supabase
    const newStatus = action === 'approve' ? 'active' : 'rejected';
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    if (dbError) throw dbError;

    // 2. Configure the Email Sender
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // 3. Craft the Email Content based on the action
    const subject = action === 'approve' 
      ? 'Central Command: Trial Request Approved!' 
      : 'Central Command: Trial Request Update';

    const htmlContent = action === 'approve'
      ? `<div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #4f46e5;">Access Granted</h2>
          <p>Hello ${name},</p>
          <p>Your 14-day free trial for Central Command has been approved! You can now log in to your dashboard.</p>
          <a href="http://localhost:3000/" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign In Now</a>
         </div>`
      : `<div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #ef4444;">Request Update</h2>
          <p>Hello ${name},</p>
          <p>Unfortunately, we are unable to approve your trial request at this time. Please contact sales for more information.</p>
         </div>`;

    // 4. Send the Email
    await transporter.sendMail({
      from: `"Central Command" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ message: `User ${action}d successfully and email sent.` }, { status: 200 });

  } catch (error) {
    console.error('Action error:', error);
    return NextResponse.json({ message: "Failed to process request.", error: error.message }, { status: 500 });
  }
}