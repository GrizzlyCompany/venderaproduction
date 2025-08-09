-- Create users table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT
);

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realtor_id UUID REFERENCES public.profiles(id),
  title TEXT,
  price NUMERIC,
  location TEXT,
  address TEXT,
  type TEXT,
  bedrooms INT,
  bathrooms INT,
  area INT,
  description TEXT,
  features TEXT[],
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial data for profiles from mock data
-- Note: In a real scenario, you wouldn't hardcode user IDs or data like this.
-- This is for demonstration purposes to match the mock data in the app.
INSERT INTO public.profiles (id, full_name, avatar_url) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jane Doe', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'John Smith', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Emily White', 'https://images.unsplash.com/photo-1690749170664-fe894475db98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhJTIwR2lybHxlbnwwfHx8fDE3NTMxMjI1NjR8MA&ixlib=rb-4.1.0&q=80&w=1080'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Michael Brown', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for properties
CREATE POLICY "Properties are viewable by everyone." ON public.properties
  FOR SELECT USING (true);
  
CREATE POLICY "Authenticated users can insert properties." ON public.properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = realtor_id);

-- Storage bucket and policies for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly viewable."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "A user can upload their own avatar."
ON storage.objects FOR INSERT
WITH CHECK ( auth.uid() = ((storage.foldername(name))[1])::uuid );

CREATE POLICY "A user can update their own avatar."
ON storage.objects FOR UPDATE
USING ( auth.uid() = ((storage.foldername(name))[1])::uuid );

-- Storage bucket and policies for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property_images', 'property_images', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Property images are publicly viewable."
ON storage.objects FOR SELECT
USING ( bucket_id = 'property_images' );

CREATE POLICY "Authenticated users can upload property images."
ON storage.objects FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );
