import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Resolves the caller from the Authorization: Bearer <supabase access token>
 * header and confirms they are an administrator.
 *
 * Returns { user, profile } on success, or { error, status } to return as-is.
 */
export async function getAdmin(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) return { error: 'Not authenticated.', status: 401 };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: 'Invalid or expired session.', status: 401 };

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email, first_name, last_name, role')
    .eq('id', data.user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Administrator access required.', status: 403 };
  }

  return { user: data.user, profile };
}
