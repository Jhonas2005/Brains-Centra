import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Fetch user's purchased modules, payment methods, and invoices
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // 1. Fetch Subscribed Modules from profiles or user_subscriptions table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscribed_modules')
      .eq('id', userId)
      .single();

    // 2. Fetch Payment Methods
    const { data: paymentMethods } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId);

    // 3. Fetch Invoices / Billing History
    const { data: invoices } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      subscribed_modules: profile?.subscribed_modules || [],
      payment_methods: paymentMethods || [],
      invoices: invoices || []
    }, { status: 200 });

  } catch (error) {
    console.error('Billing fetch error:', error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

// POST: Handle module upgrades and record invoices/payments
export async function POST(req) {
  try {
    const { userId, newModules, paymentDetails, amountCharged, description } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // 1. Update subscribed_modules array in public.profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ subscribed_modules: newModules, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 2. If payment details are provided, save the card
    if (paymentDetails) {
      await supabaseAdmin.from('payment_methods').insert({
        user_id: userId,
        card_brand: paymentDetails.brand || 'Visa',
        last4: paymentDetails.last4 || '4242',
        exp_month: paymentDetails.expMonth || 12,
        exp_year: paymentDetails.expYear || 2028
      });
    }

    // 3. Record an invoice for the purchase
    if (amountCharged) {
      await supabaseAdmin.from('invoices').insert({
        user_id: userId,
        amount: amountCharged,
        description: description || 'Module Purchase / Subscription Upgrade',
        status: 'paid'
      });
    }

    return NextResponse.json({ message: "Subscription updated successfully" }, { status: 200 });

  } catch (error) {
    console.error('Billing update error:', error);
    return NextResponse.json({ message: "Failed to update subscription", error: error.message }, { status: 500 });
  }
}