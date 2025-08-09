-- 1. Create the properties table
create table
  public.properties (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    realtor_id uuid not null,
    title text not null,
    price integer not null,
    location text null,
    address text null,
    type text not null,
    bedrooms integer null,
    bathrooms integer null,
    area integer null,
    description text null,
    features text[] null,
    images text[] null,
    constraint properties_pkey primary key (id),
    constraint properties_realtor_id_fkey foreign key (realtor_id) references profiles (id) on delete cascade
  ) tablespace pg_default;

-- 2. Set up Row Level Security (RLS)
-- In Supabase, RLS is enabled by default. We need to create policies to allow access.

-- First, drop existing policies to avoid conflicts
drop policy if exists "Users can see all properties" on public.properties;
drop policy if exists "Users can insert their own properties" on public.properties;
drop policy if exists "Users can update their own properties" on public.properties;
drop policy if exists "Users can delete their own properties" on public.properties;

-- Enable RLS
alter table public.properties enable row level security;

-- Policy to allow anyone to view all properties
create policy "Users can see all properties" on public.properties
for select using (true);

-- Policy to allow authenticated users to insert a property for themselves
create policy "Users can insert their own properties" on public.properties
for insert with check (auth.uid() = realtor_id);

-- Policy to allow users to update their own properties
create policy "Users can update their own properties" on public.properties
for update using (auth.uid() = realtor_id);

-- Policy to allow users to delete their own properties
create policy "Users can delete their own properties" on public.properties
for delete using (auth.uid() = realtor_id);
