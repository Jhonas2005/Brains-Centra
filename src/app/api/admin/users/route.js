import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all users (admin only)
export async function GET(req) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    // UPDATED: Added `subscribed_modules` to the select query
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`id, first_name, last_name, email, company, role, created_at, updated_at, status, subscribed_modules`)
      .order('created_at', { ascending: false });

    if (error) throw error;

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
    return NextResponse.json({ message: "An unexpected error occurred", error: error.message }, { status: 500 });
  }
}

// POST - Merged actions for Update Role, Delete User, and Cancel Subscription
export async function POST(req) {
  try {
    const { action, userId, newRole } = await req.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    // ACTION: UPDATE ROLE
    if (action === 'updateRole') {
      if (!userId || !newRole || !['admin', 'customer'].includes(newRole)) {
        return NextResponse.json({ message: "Invalid userId or role." }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select();

      if (error) throw error;
      return NextResponse.json({ message: `User role updated to ${newRole}`, user: data[0] });
    }

    // ACTION: DELETE USER
    if (action === 'delete') {
      // 1. Delete from Profiles Table FIRST (Prevents Foreign Key Constraint errors)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) throw profileError;

      // 2. Delete from Supabase Auth SECOND (Removes login access)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      return NextResponse.json({ message: "User completely deleted from system." }, { status: 200 });
    }

    // --- NEW ACTION: CANCEL SUBSCRIPTION ---
    if (action === 'cancelSubscription') {
      if (!userId) {
        return NextResponse.json({ message: "User ID is required." }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ subscribed_modules: [], updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select();

      if (error) throw error;
      return NextResponse.json({ message: "User subscription successfully cancelled.", user: data[0] });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: "Failed to process request", error: error.message }, { status: 500 });
  }
}