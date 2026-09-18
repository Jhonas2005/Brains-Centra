import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    // Tell Supabase to send the password reset email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/update-password', // Update this to your live URL when deployed
    });

    if (error) throw error;

    return NextResponse.json({ message: "Password reset link sent successfully." }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ 
      message: "Failed to send reset link. Please verify the email address.", 
      error: error.message 
    }, { status: 500 });
  }
}