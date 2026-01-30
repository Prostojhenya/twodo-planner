-- TwoDo Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT 'indigo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces table
CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏠',
  type TEXT NOT NULL CHECK (type IN ('personal', 'shared')),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Space members (for shared spaces)
CREATE TABLE IF NOT EXISTS public.space_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Clusters table
CREATE TABLE IF NOT EXISTS public.clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'slate',
  size TEXT NOT NULL DEFAULT 'md',
  x NUMERIC NOT NULL DEFAULT 50,
  y NUMERIC NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  cluster_id UUID REFERENCES public.clusters(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'TODO',
  assignee TEXT NOT NULL DEFAULT 'ME',
  deadline DATE,
  x NUMERIC,
  y NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  type TEXT NOT NULL DEFAULT 'OTHER',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping items table
CREATE TABLE IF NOT EXISTS public.shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  added_by TEXT NOT NULL DEFAULT 'ME',
  is_bought BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for spaces
CREATE POLICY "Users can view own spaces" ON public.spaces FOR SELECT USING (
  owner_id = auth.uid() OR 
  id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create spaces" ON public.spaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update spaces" ON public.spaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete spaces" ON public.spaces FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for space_members
CREATE POLICY "Users can view members of their spaces" ON public.space_members FOR SELECT USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Owners can manage members" ON public.space_members FOR ALL USING (
  space_id IN (SELECT id FROM public.spaces WHERE owner_id = auth.uid())
);

-- RLS Policies for clusters
CREATE POLICY "Users can view clusters in their spaces" ON public.clusters FOR SELECT USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage clusters" ON public.clusters FOR ALL USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in their spaces" ON public.tasks FOR SELECT USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage tasks" ON public.tasks FOR ALL USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);

-- RLS Policies for notes
CREATE POLICY "Users can view notes in their spaces" ON public.notes FOR SELECT USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage notes" ON public.notes FOR ALL USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);

-- RLS Policies for events
CREATE POLICY "Users can view events in their spaces" ON public.events FOR SELECT USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage events" ON public.events FOR ALL USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);

-- RLS Policies for shopping_items
CREATE POLICY "Users can view shopping in their spaces" ON public.shopping_items FOR SELECT USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage shopping" ON public.shopping_items FOR ALL USING (
  space_id IN (
    SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    UNION
    SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
  )
);

-- Success message
SELECT 'Database schema created successfully! ✅' as message;
