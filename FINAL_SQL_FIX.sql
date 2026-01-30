-- ФИНАЛЬНОЕ РЕШЕНИЕ: Отключить RLS для users
-- Скопируйте эти 2 строки и выполните в Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ihivunmndpsysxdtedti/sql/new

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users';

-- Должно показать: users | false
-- Это означает, что RLS отключен и приложение заработает
