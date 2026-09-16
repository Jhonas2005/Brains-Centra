import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isConfigured = supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your_supabase') && 
    !supabaseAnonKey.includes('your_supabase');

  // Check key formats
  const anonKeyFormat = supabaseAnonKey ? 
    (supabaseAnonKey.startsWith('eyJ') ? '✅ JWT format' : '❌ Invalid format') : 
    'Not set';
  
  const serviceKeyFormat = supabaseServiceKey ? 
    (supabaseServiceKey.startsWith('eyJ') ? '✅ JWT format' : '❌ Invalid format') : 
    'Not set';

  return NextResponse.json({
    status: 'API is running',
    supabase: {
      configured: isConfigured,
      url: supabaseUrl,
      anonKey: {
        present: !!supabaseAnonKey,
        format: anonKeyFormat,
        preview: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'Not set'
      },
      serviceKey: {
        present: !!supabaseServiceKey,
        format: serviceKeyFormat,
        preview: supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'Not set'
      }
    },
    message: isConfigured 
      ? '✅ Supabase is properly configured' 
      : '❌ Please add your Supabase credentials to .env.local',
    instructions: [
      '1. Go to your Supabase project dashboard',
      '2. Navigate to Settings → API',
      '3. Copy the anon/public key (starts with eyJhbGciOi...)',
      '4. Copy the service_role key (starts with eyJhbGciOi...)',
      '5. Update your .env.local file'
    ]
  });
}