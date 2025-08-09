# Database Schema Fix Instructions

## Problem
The current database schema doesn't match what the application code expects, causing the following errors:
- "Error fetching properties: {}"
- "Error fetching ratings: {}"
- "Error fetching properties for profile: {}"
- React rendering error with favorites object

## Solution
You need to apply the updated database schema that matches the TypeScript interfaces.

## Steps to Fix

### 1. Apply the Database Schema
Run the SQL script `database_schema_fix.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database_schema_fix.sql`
4. Execute the script

**⚠️ WARNING: This will drop and recreate all tables, so you'll lose existing data. Make sure to backup any important data first.**

### 2. Verify the Schema
After running the script, verify that the following tables exist with the correct structure:

- `public.profiles` (with columns: id, full_name, username, email, avatar_url, bio, updated_at, created_at, subscription_status, is_profile_complete)
- `public.properties` (with UUID id, not BIGINT)
- `public.ratings`
- `public.conversations` (with UUID id)
- `public.messages`

### 3. Test the Application
After applying the schema:

1. Restart your development server: `npm run dev`
2. Try to:
   - View the home page (should load properties)
   - View user profiles (should load user data and ratings)
   - Navigate through the app without React rendering errors

## Key Changes Made

### Database Schema:
- Changed property IDs from BIGINT to UUID
- Added missing columns to profiles table (username, email, subscription_status, is_profile_complete)
- Updated conversation structure to match application expectations
- Added proper ratings table
- Fixed all foreign key relationships

### Application Code:
- Fixed React rendering error by using correct translation keys
- Updated all references from `user_id` to `id` in profile-related code
- Added missing translation keys for empty states
- Improved error handling in data fetching functions

## Alternative: Incremental Migration
If you have important data and can't drop tables, you can modify the existing schema incrementally:

```sql
-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update properties table to use UUID (this is more complex and may require data migration)
-- You'll need to create a new table, migrate data, then rename tables
```

## Verification
After applying the fix, the following should work without errors:
- Home page loads properties
- Profile pages load user data and ratings
- No React rendering errors
- Favorites functionality works
- All translation keys resolve properly