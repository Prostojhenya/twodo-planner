-- ВРЕМЕННОЕ РЕШЕНИЕ: Отключить RLS для users
-- Это позволит приложению работать, пока мы разбираемся с policies

-- Отключить RLS для users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Проверка
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users';

-- ВАЖНО: Это временное решение для разработки!
-- В продакшене нужно правильно настроить RLS policies.

SELECT '⚠️ RLS отключен для users. Приложение должно работать!' as status;
