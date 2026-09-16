import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    console.log('Login route hit');
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ 
        message: "Email and password are required" 
      }, { status: 400 });
    }

    // Check if supabase is configured
    if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase')) {
      return NextResponse.json({ 
        message: "Server configuration error: Supabase credentials missing. Please add your Supabase URL and keys to .env.local" 
      }, { status: 500 });
    }

    console.log('Attempting to sign in...');
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    }); 

    if (error) {
      console.error('Login error:', error);
      return NextResponse.json({ 
        message: "Invalid credentials" 
      }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ 
        message: "Invalid credentials" 
      }, { status: 401 });
    }

    console.log('Login successful for user:', data.user.id);

    // FETCH THE CUSTOM ROLE FROM YOUR SUPABASE TABLE
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email)
      .single();
      
    // Determine the role (checking table first, then metadata, then default)
    const activeRole = userData?.role || data.user.user_metadata?.role || 'customer';

    // Get additional user data from metadata or profiles table
    const userResponse = {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.user_metadata?.first_name || '',
      lastName: data.user.user_metadata?.last_name || '',
      company: data.user.user_metadata?.company || '',
      role: activeRole, // Updated to use the fetched role
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token
    };

    return NextResponse.json({ 
      message: "Login successful", 
      role: activeRole, // <-- This must be at the root level for your frontend to see it!
      user: userResponse,
      session: data.session
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected login error:', error);
    return NextResponse.json({ 
      message: "An unexpected error occurred during login", 
      error: error.message 
    }, { status: 500 });
  }
}