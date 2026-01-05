-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Handle new user signup automatically
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ROUTINES
create table public.routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  default_exercises jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.routines enable row level security;

create policy "Users can view their own routines."
  on public.routines for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own routines."
  on public.routines for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own routines."
  on public.routines for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own routines."
  on public.routines for delete
  using ( auth.uid() = user_id );

-- WORKOUT LOGS
create table public.workout_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  date text not null,
  timestamp bigint not null,
  routine_name text,
  duration int,
  feedback text,
  exercises jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workout_logs enable row level security;

create policy "Users can view their own workout logs."
  on public.workout_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own workout logs."
  on public.workout_logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own workout logs."
  on public.workout_logs for delete
  using ( auth.uid() = user_id );

-- HABITS
create table public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  category text not null,
  streak int default 0,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.habits enable row level security;

create policy "Users can view their own habits."
  on public.habits for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own habits."
  on public.habits for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own habits."
  on public.habits for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own habits."
  on public.habits for delete
  using ( auth.uid() = user_id );

-- BOOKS
create table public.books (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  author text not null,
  status text not null, -- 'read', 'reading', 'toread'
  rating int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.books enable row level security;

create policy "Users can view their own books."
  on public.books for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own books."
  on public.books for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own books."
  on public.books for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own books."
  on public.books for delete
  using ( auth.uid() = user_id );

-- NOTES
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  content text,
  date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notes enable row level security;

create policy "Users can view their own notes."
  on public.notes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own notes."
  on public.notes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own notes."
  on public.notes for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own notes."
  on public.notes for delete
  using ( auth.uid() = user_id );
