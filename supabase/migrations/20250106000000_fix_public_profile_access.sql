-- Fix public profile access policies
-- This migration ensures that profiles can be viewed by anyone, even without authentication

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Create a comprehensive policy that allows public read access
CREATE POLICY "Enable read access for all users" ON profiles 
FOR SELECT 
USING (true);

-- Ensure users can still insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
CREATE POLICY "Users can update their own profile." ON profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to anon role for public access
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;

-- Also ensure the same for properties table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties') THEN
        -- Allow public read access to properties
        DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
        CREATE POLICY "Properties are viewable by everyone" ON properties 
        FOR SELECT 
        USING (true);
        
        GRANT SELECT ON properties TO anon;
        GRANT SELECT ON properties TO authenticated;
    END IF;
END $$;

-- Ensure ratings can be viewed publicly as well
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ratings') THEN
        DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON ratings;
        CREATE POLICY "Ratings are viewable by everyone" ON ratings 
        FOR SELECT 
        USING (true);
        
        GRANT SELECT ON ratings TO anon;
        GRANT SELECT ON ratings TO authenticated;
    END IF;
END $$;