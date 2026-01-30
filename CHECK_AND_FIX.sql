-- Проверка и создание пространства для Жени

-- Шаг 1: Проверить пользователя
SELECT * FROM public.users WHERE id = '762eb16b-154c-4845-b66b-e2d820170829';

-- Шаг 2: Создать пространство (если его нет)
INSERT INTO public.spaces (title, icon, type, owner_id)
VALUES (
  'Мое пространство',
  '🏠',
  'personal',
  '762eb16b-154c-4845-b66b-e2d820170829'
)
ON CONFLICT DO NOTHING;

-- Шаг 3: Финальная проверка
SELECT 
  u.id,
  u.name,
  u.initials,
  u.avatar_color,
  (SELECT COUNT(*) FROM public.spaces WHERE owner_id = u.id) as spaces_count
FROM public.users u
WHERE u.id = '762eb16b-154c-4845-b66b-e2d820170829';

-- Должно показать: spaces_count = 1
