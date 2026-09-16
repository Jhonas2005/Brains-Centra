import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  try {
    console.log('Register route hit');
    const { firstName, lastName, email, company, password } = await req.json();
    console.log('Request data:', { firstName, lastName, email, company, password: password ? '[PRESENT]' : '[MISSING]' });

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ 
        message: "All fields are required" 
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      console.error('❌ Supabase not configured properly');
      return NextResponse.json({ 
        message: "Server configuration error: Supabase credentials missing. Please add your Supabase URL and keys to .env.local" 
      }, { status: 500 });
    }

    console.log('Creating user with Supabase Auth...');
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin creation
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company: company || null,
        role: 'customer'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ 
          message: "Email already in use." 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        message: "Failed to create account", 
        error: authError.message 
      }, { status: 500 });
    }

    console.log('User created successfully:', authData.user.id);

    // Optionally, insert additional user data into a custom profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        company: company || null,
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      // This might fail if trigger already created the profile, which is fine
      console.log('Profile insert info (this is normal if trigger created it):', profileError.message);
    } else {
      console.log('Profile created successfully in profiles table');
    }

    return NextResponse.json({ 
      message: "Account created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName,
        lastName,
        company: company || null
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      message: "An unexpected error occurred", 
      error: error.message 
    }, { status: 500 });
  }
}