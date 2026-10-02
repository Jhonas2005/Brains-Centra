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

    // 1. Fetch Subscribed Modules from user_subscriptions table
    const { data: subscriptions } = await supabaseAdmin
      .from('user_subscriptions')
      .select('module_id, status, created_at')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Flatten into an array so the frontend still receives the format it expects
    const activeModules = subscriptions ? subscriptions.map(sub => sub.module_id) : [];

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
      subscribed_modules: activeModules,
      payment_methods: paymentMethods || [],
      invoices: invoices || []
    }, { status: 200 });

  } catch (error) {
    console.error('Billing fetch error:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST: Handle module upgrades and record invoices/payments
export async function POST(req) {
  try {
    const body = await req.json();
    const { action, userId, moduleToCancel, newModules, paymentDetails, amountCharged, description } = body;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // ==========================================
    // 1. HANDLE CANCELLATION
    // ==========================================
    if (action === 'cancel') {
      if (moduleToCancel === 'all') {
        // Mark all active subscriptions as canceled
        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({ status: 'canceled' })
          .eq('user_id', userId)
          .eq('status', 'active');

        if (error) throw error;
      } else {
        // Mark the specific module as canceled
        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({ status: 'canceled' })
          .eq('user_id', userId)
          .eq('module_id', moduleToCancel);

        if (error) throw error;
      }

      return NextResponse.json({ message: "Subscription canceled successfully" }, { status: 200 });
    }

    // ==========================================
    // 2. HANDLE UPGRADE / PURCHASE
    // ==========================================
    if (newModules && newModules.length > 0) {
      const subscriptionInserts = newModules.map(moduleId => ({
        user_id: userId,
        module_id: moduleId,
        status: 'active'
      }));

      const { error: subError } = await supabaseAdmin
        .from('user_subscriptions')
        .upsert(subscriptionInserts, { onConflict: 'user_id, module_id' });

      if (subError) throw subError;
    }

    if (paymentDetails) {
      await supabaseAdmin.from('payment_methods').insert({
        user_id: userId,
        card_brand: paymentDetails.brand || 'Visa',
        last4: paymentDetails.last4 || '4242',
        exp_month: paymentDetails.expMonth || 12,
        exp_year: paymentDetails.expYear || 2028
      });
    }

    if (amountCharged) {
      await supabaseAdmin.from('invoices').insert({
        user_id: userId,
        amount: amountCharged,
        currency: 'PHP',
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