-- Add is_seller field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_seller BOOLEAN DEFAULT FALSE;

-- Update existing profiles to set is_seller based on whether they have properties
UPDATE profiles 
SET is_seller = TRUE 
WHERE id IN (
    SELECT DISTINCT realtor_id 
    FROM properties 
    WHERE realtor_id IS NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_seller ON profiles(is_seller);