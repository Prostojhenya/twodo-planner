-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT 'indigo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces table
CREATE TABLE public.spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏠',
  type TEXT NOT NULL CHECK (type IN ('personal', 'shared')),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Space members (for shared spaces)
CREATE TABLE public.space_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Clusters table
CREATE TABLE public.clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'slate' CHECK (color IN ('slate', 'rose', 'blue', 'emerald', 'amber', 'violet')),
  size TEXT NOT NULL DEFAULT 'md' CHECK (size IN ('sm', 'md', 'lg')),
  x NUMERIC NOT NULL DEFAULT 50,
  y NUMERIC NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  cluster_id UUID REFERENCES public.clusters(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  assignee TEXT NOT NULL DEFAULT 'ME' CHECK (assignee IN ('ME', 'PARTNER', 'BOTH')),
  deadline DATE,
  x NUMERIC,
  y NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  type TEXT NOT NULL DEFAULT 'OTHER' CHECK (type IN ('DATE', 'BIRTHDAY', 'TRIP', 'OTHER')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping items table
CREATE TABLE public.shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  added_by TEXT NOT NULL DEFAULT 'ME' CHECK (added_by IN ('ME', 'PARTNER', 'BOTH')),
  is_bought BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_spaces_owner ON public.spaces(owner_id);
CREATE INDEX idx_space_members_space ON public.space_members(space_id);
CREATE INDEX idx_space_members_user ON public.space_members(user_id);
CREATE INDEX idx_clusters_space ON public.clusters(space_id);
CREATE INDEX idx_tasks_space ON public.tasks(space_id);
CREATE INDEX idx_tasks_cluster ON public.tasks(cluster_id);
CREATE INDEX idx_notes_space ON public.notes(space_id);
CREATE INDEX idx_events_space ON public.events(space_id);
CREATE INDEX idx_shopping_space ON public.shopping_items(space_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Spaces policies
CREATE POLICY "Users can view their own spaces" ON public.spaces
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create spaces" ON public.spaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Space owners can update their spaces" ON public.spaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Space owners can delete their spaces" ON public.spaces
  FOR DELETE USING (owner_id = auth.uid());

-- Space members policies
CREATE POLICY "Users can view space members of their spaces" ON public.space_members
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Space owners can manage members" ON public.space_members
  FOR ALL USING (
    space_id IN (SELECT id FROM public.spaces WHERE owner_id = auth.uid())
  );

-- Clusters policies
CREATE POLICY "Users can view clusters in their spaces" ON public.clusters
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage clusters in their spaces" ON public.clusters
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in their spaces" ON public.tasks
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tasks in their spaces" ON public.tasks
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- Notes policies
CREATE POLICY "Users can view notes in their spaces" ON public.notes
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage notes in their spaces" ON public.notes
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- Events policies
CREATE POLICY "Users can view events in their spaces" ON public.events
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage events in their spaces" ON public.events
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- Shopping items policies
CREATE POLICY "Users can view shopping items in their spaces" ON public.shopping_items
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage shopping items in their spaces" ON public.shopping_items
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clusters_updated_at BEFORE UPDATE ON public.clusters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_items_updated_at BEFORE UPDATE ON public.shopping_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
