-- Fix users table RLS policy for registration

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create new policies that allow registration
CREATE POLICY "Enable all for authenticated users" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication" ON public.users
  FOR INSERT WITH CHECK (true);

SELECT 'Users policies fixed! ✅' as message;
