import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail } from '@/lib/mailer';
import { billingReceiptEmail, subscriptionCanceledEmail } from '@/lib/emailTemplates';

async function getUserFromRequest(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { error: 'Not authenticated.' };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: 'Invalid or expired session.' };
  return { user: data.user };
}

async function getProfile(userId) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('first_name, email')
    .eq('id', userId)
    .maybeSingle();
  return data || {};
}

function labelModule(id, fallback) {
  if (fallback) return fallback;
  return String(id || '')
    .replace(/[-_]/g, ' ')
    .toUpperCase();
}

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
    // The account being billed is always the one on the verified session.
    // Trusting a userId from the body would let anyone bill or cancel
    // subscriptions for any account.
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError) {
      console.warn('Billing auth rejected:', authError);
      return NextResponse.json({ message: authError }, { status: 401 });
    }
    const userId = user.id;

    const body = await req.json();
    const {
      action,
      moduleToCancel,
      moduleLabel,
      newModules,
      purchasedModules,
      paymentDetails,
      amountCharged,
      description,
    } = body;

    const profile = await getProfile(userId);
    const recipient = user.email || profile.email;

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

      if (recipient) {
        try {
          const mail = subscriptionCanceledEmail({
            firstName: profile.first_name,
            email: recipient,
            modules: moduleToCancel === 'all' ? [] : [labelModule(moduleToCancel, moduleLabel)],
            canceledAt: new Date().toISOString(),
          });
          await sendMail({ to: recipient, ...mail });
        } catch (mailError) {
          // The cancellation already committed; a mail outage must not undo it.
          console.error('Cancellation email failed:', mailError);
        }
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

    let invoice = null;

    if (amountCharged) {
      const { data: invoiceRow, error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .insert({
          user_id: userId,
          amount: amountCharged,
          currency: 'PHP',
          description: description || 'Module Purchase / Subscription Upgrade',
          status: 'paid'
        })
        .select('id, amount, currency, description, created_at')
        .single();

      if (invoiceError) {
        console.error('Invoice insert failed:', invoiceError);
      } else {
        invoice = invoiceRow;
      }
    }

    // Receipt goes out only after the invoice is actually recorded, so the
    // email can never claim a charge that was not persisted.
    if (invoice && recipient) {
      try {
        const invoiceNumber = `INV-${String(invoice.id).slice(0, 8).toUpperCase()}`;

        const mail = billingReceiptEmail({
          firstName: profile.first_name,
          email: recipient,
          invoiceNumber,
          amount: invoice.amount,
          currency: invoice.currency || 'PHP',
          description: invoice.description,
          modules: Array.isArray(purchasedModules) ? purchasedModules : [],
          paidAt: invoice.created_at,
          last4: paymentDetails?.last4,
        });

        await sendMail({ to: recipient, ...mail });
      } catch (mailError) {
        console.error('Receipt email failed:', mailError);
      }
    }

    return NextResponse.json({ message: "Subscription updated successfully" }, { status: 200 });

  } catch (error) {
    console.error('Billing update error:', error);
    return NextResponse.json({ message: "Failed to update subscription", error: error.message }, { status: 500 });
  }
}
