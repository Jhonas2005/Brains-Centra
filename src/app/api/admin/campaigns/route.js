import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail } from '@/lib/mailer';
import { campaignEmail } from '@/lib/emailTemplates';
import { getAdmin } from '@/lib/requireAdmin';
import {
  resolveAudience,
  normalizeEmail,
  isEmail,
  unsubscribeUrl,
  MAX_RECIPIENTS,
} from '@/lib/campaigns';

// Batches are small on purpose: the browser drives the loop so no single
// request has to outlive the serverless timeout.
export const maxDuration = 60;

const AUDIENCES = ['customers', 'prospects', 'all', 'custom'];
const DEFAULT_BATCH = 25;
const MAX_BATCH = 50;
const SEND_CONCURRENCY = 4;

async function runLimited(items, limit, worker) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

function fail(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

/** Campaign history + the two mailing lists the composer offers. */
export async function GET(request) {
  const { error, status } = await getAdmin(request);
  if (error) return fail(error, status);

  try {
    const [audience, campaignsResult] = await Promise.all([
      resolveAudience(),
      supabaseAdmin
        .from('email_campaigns')
        .select('id, subject, audience, recipient_count, sent_count, failed_count, status, created_at, completed_at')
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

    if (campaignsResult.error) throw campaignsResult.error;

    return NextResponse.json({
      customers: audience.customers,
      prospects: audience.prospects,
      campaigns: campaignsResult.data || [],
    });
  } catch (err) {
    console.error('Campaign fetch error:', err);
    return fail(err.message || 'Could not load campaigns.', 500);
  }
}

export async function POST(request) {
  const { error, status, profile } = await getAdmin(request);
  if (error) return fail(error, status);

  try {
    const payload = await request.json();

    if (payload.action === 'prepare') return await prepareCampaign(payload, profile);
    if (payload.action === 'sendBatch') return await sendBatch(payload);
    if (payload.action === 'test') return await sendTest(payload);
    if (payload.action === 'cancel') return await cancelCampaign(payload);

    return fail('Unknown action.');
  } catch (err) {
    console.error('Campaign error:', err);
    return fail(err.message || 'Campaign failed.', 500);
  }
}

/**
 * Freezes the recipient list into email_campaign_recipients. Sending then
 * happens batch by batch, so a failure or a closed tab never loses track of
 * who still needs the email.
 */
async function prepareCampaign(payload, profile) {
  const subject = String(payload.subject || '').trim();
  const body = String(payload.body || '').trim();
  const audience = String(payload.audience || '');

  if (!subject) return fail('Add a subject line.');
  if (subject.length > 200) return fail('Keep the subject under 200 characters.');
  if (!body) return fail('Write the email body.');
  if (!AUDIENCES.includes(audience)) return fail('Choose an audience.');

  const imageUrls = (Array.isArray(payload.imageUrls) ? payload.imageUrls : [])
    .filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url))
    .slice(0, 6);

  const { customers, prospects } = await resolveAudience();
  const everyone = [...customers, ...prospects];

  let pool;
  if (audience === 'customers') pool = customers;
  else if (audience === 'prospects') pool = prospects;
  else if (audience === 'all') pool = everyone;
  else {
    const wanted = new Set(
      (Array.isArray(payload.emails) ? payload.emails : [])
        .map(normalizeEmail)
        .filter(isEmail)
    );
    pool = everyone.filter((recipient) => wanted.has(recipient.email));
  }

  if (pool.length === 0) return fail('No recipients match that selection.');
  if (pool.length > MAX_RECIPIENTS) {
    return fail(
      `That selection has ${pool.length} recipients, above the ${MAX_RECIPIENTS}-email limit per campaign. Split it into smaller sends.`
    );
  }

  const { data: campaign, error: insertError } = await supabaseAdmin
    .from('email_campaigns')
    .insert([{
      subject,
      body,
      image_urls: imageUrls,
      audience,
      recipient_count: pool.length,
      status: 'sending',
      created_by: profile?.email || 'admin',
    }])
    .select('id')
    .single();

  if (insertError) throw insertError;

  const rows = pool.map((recipient) => ({
    campaign_id: campaign.id,
    email: recipient.email,
    name: recipient.name || null,
    kind: recipient.kind,
  }));

  try {
    for (let i = 0; i < rows.length; i += 500) {
      const { error: queueError } = await supabaseAdmin
        .from('email_campaign_recipients')
        .insert(rows.slice(i, i + 500));
      if (queueError) throw queueError;
    }
  } catch (err) {
    // Never leave a half-built campaign behind.
    await supabaseAdmin.from('email_campaigns').delete().eq('id', campaign.id);
    throw err;
  }

  return NextResponse.json({ campaignId: campaign.id, total: pool.length });
}

/** Sends the next slice of pending recipients for one campaign. */
async function sendBatch(payload) {
  const campaignId = String(payload.campaignId || '');
  const limit = Math.min(Math.max(Number(payload.limit) || DEFAULT_BATCH, 1), MAX_BATCH);

  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from('email_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) return fail('Campaign not found.', 404);

  if (campaign.status === 'cancelled') {
    return NextResponse.json({
      sent: campaign.sent_count,
      failed: campaign.failed_count,
      remaining: 0,
      done: true,
      cancelled: true,
    });
  }

  const { data: queue, error: queueError } = await supabaseAdmin
    .from('email_campaign_recipients')
    .select('id, email, name')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .order('id', { ascending: true })
    .limit(limit);

  if (queueError) throw queueError;

  const results = [];

  await runLimited(queue || [], SEND_CONCURRENCY, async (row) => {
    try {
      await sendMail({
        to: row.email,
        ...campaignEmail({
          subject: campaign.subject,
          body: campaign.body,
          images: campaign.image_urls || [],
          recipientName: row.name,
          unsubscribeUrl: unsubscribeUrl(row.email),
        }),
      });
      results.push({ id: row.id, status: 'sent' });
    } catch (err) {
      results.push({
        id: row.id,
        status: 'failed',
        error: String(err.message || err).slice(0, 300),
      });
    }
  });

  // Bookkeeping per recipient. A failure here must not make the caller
  // resend an email that already went out.
  await Promise.all(
    results.map((result) =>
      supabaseAdmin
        .from('email_campaign_recipients')
        .update({
          status: result.status,
          error: result.error || null,
          sent_at: result.status === 'sent' ? new Date().toISOString() : null,
        })
        .eq('id', result.id)
    )
  );

  const countOf = async (status) => {
    const { count } = await supabaseAdmin
      .from('email_campaign_recipients')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', status);
    return count || 0;
  };

  const [remaining, sent, failed] = await Promise.all([
    countOf('pending'),
    countOf('sent'),
    countOf('failed'),
  ]);

  const done = remaining === 0;

  await supabaseAdmin
    .from('email_campaigns')
    .update({
      sent_count: sent,
      failed_count: failed,
      ...(done ? { status: 'sent', completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', campaignId);

  return NextResponse.json({
    sent,
    failed,
    remaining,
    done,
    errors: results.filter((r) => r.status === 'failed').map((r) => r.error).slice(0, 5),
  });
}

/** Preview send. Restricted to administrator addresses so it is not a relay. */
async function sendTest(payload) {
  const to = normalizeEmail(payload.to);
  if (!isEmail(to)) return fail('Invalid test address.');

  const { data: admin } = await supabaseAdmin
    .from('profiles')
    .select('role, first_name, email')
    .eq('email', to)
    .maybeSingle();

  if (!admin || admin.role !== 'admin') {
    return fail('Test emails can only be sent to an administrator address.', 403);
  }

  const subject = `[TEST] ${String(payload.subject || 'Campaign preview').trim()}`;

  await sendMail({
    to,
    ...campaignEmail({
      subject,
      body: payload.body,
      images: (Array.isArray(payload.imageUrls) ? payload.imageUrls : []).slice(0, 6),
      recipientName: admin.first_name,
      unsubscribeUrl: unsubscribeUrl(to),
    }),
  });

  return NextResponse.json({ success: true, to });
}

async function cancelCampaign(payload) {
  const campaignId = String(payload.campaignId || '');
  const { error } = await supabaseAdmin
    .from('email_campaigns')
    .update({ status: 'cancelled', completed_at: new Date().toISOString() })
    .eq('id', campaignId);

  if (error) throw error;
  return NextResponse.json({ success: true });
}
