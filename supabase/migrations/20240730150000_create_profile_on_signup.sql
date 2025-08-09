
-- Crea la tabla de perfiles con la estructura más reciente
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  email text,
  avatar_url text,
  bio text,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  subscription_status text default 'inactive' check (subscription_status in ('active', 'inactive')),
  is_profile_complete boolean default false,
  role text default 'buyer' check (role in ('buyer', 'agent', 'developer')),
  preferences jsonb default null,
  is_seller boolean default false,
  phone_number text
);


-- Habilita Row Level Security (RLS)
alter table public.profiles enable row level security;


drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);


-- Trigger y función para crear perfil automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, username, role, phone_number)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substring(md5(random()::text), 0, 5)),
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'phone_number'
  );
  return new;
end;
$$;


-- Elimina el trigger anterior si existe y crea el nuevo
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();