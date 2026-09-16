import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if configuration is missing or contains placeholder values
const isConfigMissing = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl.includes('your_supabase') || 
  supabaseAnonKey.includes('your_supabase');

if (isConfigMissing) {
  console.error('❌ Supabase configuration missing or invalid!');
  console.error('Please update your .env.local file with your Supabase credentials:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
}

// Create a dummy client to prevent crashes during development when config is missing
const dummyClient = {
  auth: {
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    admin: {
      createUser: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }
  },
  from: () => ({
    insert: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
  })
};

// Export the appropriate clients based on configuration
export const supabase = isConfigMissing ? dummyClient : createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = isConfigMissing || !supabaseServiceKey 
  ? null 
  : createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });