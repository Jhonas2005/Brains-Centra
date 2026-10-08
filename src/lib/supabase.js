import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if configuration is missing or contains placeholder values
const isConfigMissing = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl.includes('your_supabase') || 
  supabaseAnonKey.includes('your_supabase') ||
  supabaseUrl === 'https://placeholder.supabase.co';

const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.RUNTIME;

if (isConfigMissing && !isBuildTime) {
  console.error('❌ Supabase configuration missing or invalid!');
  console.error('Please update your .env.local file with your Supabase credentials:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
}

// Create clients with placeholder values for build time
const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeSupabaseAnonKey = supabaseAnonKey || 'placeholder_key';
const safeSupabaseServiceKey = supabaseServiceKey || 'placeholder_service_key';

// Export the clients
export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey);

export const supabaseAdmin = createClient(safeSupabaseUrl, safeSupabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});