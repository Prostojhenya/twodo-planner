-- Temporarily disable RLS for testing
-- WARNING: This is for development only!

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled for testing! ⚠️' as message;
