import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    // 1. Extract ALL fields sent by your frontend Free Trial page
    const { firstName, lastName, email, company, password } = await req.json();

    // 2. VALIDATE EMAIL & PASSWORD: Try to log them into Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ 
        message: "Account not found. Please check your email or password." 
      }, { status: 401 }); // This triggers the red error text on your frontend
    }

    // 3. Fetch their database profile to check Name and Company
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, company, status')
      .eq('email', email)
      .single();

    if (!profile) {
      return NextResponse.json({ 
        message: "Account not found. Please create an account before requesting a free trial." 
      }, { status: 404 }); // This triggers your Account Not Found modal
    }

    // 4. VALIDATE NAME & COMPANY (Using toLowerCase to prevent accidental capitalization errors)
    if (
      profile.first_name?.toLowerCase() !== firstName?.toLowerCase() ||
      profile.last_name?.toLowerCase() !== lastName?.toLowerCase() ||
      profile.company?.toLowerCase() !== company?.toLowerCase()
    ) {
      return NextResponse.json({ 
        message: "The Name or Company provided does not match the registered account details." 
      }, { status: 400 }); // This triggers the red error text on your frontend
    }

    // 5. If everything perfectly matches, update status to pending!
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: 'pending' })
      .eq('id', profile.id);

    if (updateError) {
      return NextResponse.json({ message: "Failed to update trial status." }, { status: 400 });
    }

    return NextResponse.json({ message: "Trial requested successfully!" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "An unexpected error occurred", error: error.message }, { status: 500 });
  }
}