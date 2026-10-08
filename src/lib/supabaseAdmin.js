import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.RUNTIME;

if (!supabaseUrl || !supabaseServiceKey) {
  // Don't throw during build time, only at runtime
  if (!isBuildTime) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
}

// Create client with placeholder values for build time
const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeSupabaseServiceKey = supabaseServiceKey || 'placeholder_service_key';

// The 'export' keyword here is what fixes your error
export const supabaseAdmin = createClient(safeSupabaseUrl, safeSupabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});