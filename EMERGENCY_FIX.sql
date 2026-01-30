-- ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ: Отключить RLS для users
-- Выполните это ПРЯМО СЕЙЧАС в Supabase SQL Editor

-- Отключить RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Проверка
SELECT '✅ RLS отключен! Перезагрузите приложение (Ctrl+Shift+R)' as status;
