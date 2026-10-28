import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail } from '@/lib/mailer';
import { welcomeEmail } from '@/lib/emailTemplates';

/**
 * Normalises a person's name to title case: "jANE" -> "Jane",
 * "mary jane" -> "Mary Jane", "o'brien" -> "O'Brien", "anne-marie" -> "Anne-Marie".
 */
function titleCaseName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-z])/g, (_, separator, letter) => separator + letter.toUpperCase());
}

export async function POST(req) {
  try {
    console.log('Register route hit');
    let { firstName, lastName, email, company, password } = await req.json();
    console.log('Request data:', { firstName, lastName, email, company, password: password ? '[PRESENT]' : '[MISSING]' });

    // Stored in title case so the dashboard, emails and CSV export all read
    // consistently no matter how the person typed their name.
    firstName = titleCaseName(firstName);
    lastName = titleCaseName(lastName);

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ 
        message: "All fields are required" 
      }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!supabaseAdmin) {
      console.error('❌ Supabase not configured properly');
      return NextResponse.json({ 
        message: "Server configuration error: Supabase credentials missing. Please add your Supabase URL and keys to .env.local" 
      }, { status: 500 });
    }

    console.log('Creating user with Supabase Auth...');
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
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
      
      // Supabase reports a duplicate as "A user with this email address has
      // already been registered" (code email_exists), not "already registered",
      // so match on the code first and fall back to the message text.
      const alreadyExists =
        authError.code === 'email_exists' ||
        /already|exists|registered/i.test(authError.message || '');

      if (alreadyExists) {
        return NextResponse.json({
          message: "An account with this email already exists. Sign in instead, or register with a different email address.",
          code: 'ACCOUNT_EXISTS'
        }, { status: 409 });
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
        email: normalizedEmail,
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

    // Send the welcome email. A mail failure must never undo a real account,
    // so it is logged and reported back instead of thrown.
    let emailSent = false;
    try {
      await sendMail({
        to: normalizedEmail,
        ...welcomeEmail({
          firstName,
          lastName,
          email: normalizedEmail,
          company: company || null,
          createdAt: new Date().toUTCString()
        })
      });
      emailSent = true;
    } catch (mailError) {
      console.error('Welcome email failed for', normalizedEmail, mailError);
    }

    return NextResponse.json({ 
      message: "Account created successfully",
      emailSent,
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