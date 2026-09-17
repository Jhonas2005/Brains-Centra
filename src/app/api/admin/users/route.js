import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all users (admin only)
export async function GET(req) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        message: "Server configuration error" 
      }, { status: 500 });
    }

    // Get all profiles with user data
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        company,
        role,
        created_at,
        updated_at,
        status
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ 
        message: "Error fetching users", 
        error: error.message 
      }, { status: 500 });
    }

    // Get auth data for each user
    const usersWithAuthData = await Promise.all(
      profiles.map(async (profile) => {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.id);
        return {
          ...profile,
          email_confirmed: !!authUser?.user?.email_confirmed_at,
          last_sign_in: authUser?.user?.last_sign_in_at,
          auth_created_at: authUser?.user?.created_at
        };
      })
    );

    return NextResponse.json({
      users: usersWithAuthData,
      total: usersWithAuthData.length
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      message: "An unexpected error occurred", 
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Update user role (admin only)
export async function POST(req) {
  try {
    const { userId, newRole, action } = await req.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        message: "Server configuration error" 
      }, { status: 500 });
    }

    if (action === 'updateRole') {
      if (!userId || !newRole || !['admin', 'customer'].includes(newRole)) {
        return NextResponse.json({ 
          message: "Invalid userId or role. Role must be 'admin' or 'customer'" 
        }, { status: 400 });
      }

      // Update user role
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ 
          message: "Error updating user role", 
          error: error.message 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        message: `User role updated to ${newRole}`, 
        user: data[0] 
      });
    }

    return NextResponse.json({ 
      message: "Invalid action" 
    }, { status: 400 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      message: "An unexpected error occurred", 
      error: error.message 
    }, { status: 500 });
  }
}