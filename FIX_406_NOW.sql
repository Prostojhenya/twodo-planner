-- БЫСТРОЕ ИСПРАВЛЕНИЕ ОШИБКИ 406
-- Скопируйте и выполните в Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ihivunmndpsysxdtedti/sql/new

-- Исправление policy для users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Проверка
SELECT '✅ Policy исправлена! Перезагрузите приложение (Ctrl+Shift+R)' as status;
