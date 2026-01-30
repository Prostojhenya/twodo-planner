-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ 406 ОШИБКИ
-- Выполните этот SQL в Supabase Dashboard > SQL Editor

-- 1. Отключить RLS для users (временно для отладки)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Проверить что пользователь существует
SELECT 
  id,
  name,
  initials,
  avatar_color,
  created_at
FROM public.users 
WHERE id = '762eb16b-154c-4845-b66b-e2d820170829';

-- 3. Проверить пространства
SELECT 
  id,
  title,
  icon,
  type,
  owner_id
FROM public.spaces 
WHERE owner_id = '762eb16b-154c-4845-b66b-e2d820170829';

-- 4. Если нужно создать пространство
INSERT INTO public.spaces (title, icon, type, owner_id)
VALUES (
  'Мое пространство',
  '🏠',
  'personal',
  '762eb16b-154c-4845-b66b-e2d820170829'
)
ON CONFLICT DO NOTHING;

-- 5. Финальная проверка
SELECT 
  'Пользователь' as type,
  COUNT(*) as count
FROM public.users 
WHERE id = '762eb16b-154c-4845-b66b-e2d820170829'
UNION ALL
SELECT 
  'Пространства' as type,
  COUNT(*) as count
FROM public.spaces 
WHERE owner_id = '762eb16b-154c-4845-b66b-e2d820170829';

-- Должно показать:
-- Пользователь: 1
-- Пространства: >= 1

SELECT '✅ Готово! Теперь попробуйте войти в приложение.' as status;
