# Brains Central Command

A Next.js application with Supabase authentication and database.

## Setup Instructions

### 1. Supabase Configuration

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to Settings → API
3. Copy your Project URL and API Keys
4. Update your `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Database Setup (Optional)

If you want additional user profile data beyond Supabase Auth:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase-schema.sql`

This creates a `profiles` table with additional user metadata and automatic triggers.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoints

- `POST /api/register` - Create new user account
- `POST /api/login` - User authentication

## Features

- ✅ User registration with Supabase Auth
- ✅ User authentication
- ✅ Protected routes
- ✅ User profile management
- ✅ Role-based access (customer/admin)

## Project Structure

```
src/
  app/
    api/
      login/          # Authentication endpoint
      register/       # User registration endpoint
    free-trial/       # Free trial page
    get-started/      # Get started page
  contexts/
    AuthContext.js    # React context for auth state
  lib/
    supabase.js       # Supabase client configuration
```