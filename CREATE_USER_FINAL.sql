-- СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ "ЖЕНЯ" С НУЛЯ
-- Выполните в Supabase SQL Editor

-- Шаг 1: Проверить существующего пользователя
SELECT * FROM auth.users WHERE email = 'zhenya@twodo.app';

-- Шаг 2: Если пользователь есть в auth.users, создать профиль
-- Замените USER_ID_HERE на ID из шага 1
INSERT INTO public.users (id, name, initials, avatar_color)
VALUES (
  'bce3b14c-4ed7-4682-965c-a2ac05f76348', -- ID пользователя из auth.users
  'Женя',
  'Ж',
  'emerald'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  initials = EXCLUDED.initials,
  avatar_color = EXCLUDED.avatar_color;

-- Шаг 3: Создать личное пространство
INSERT INTO public.spaces (title, icon, type, owner_id)
VALUES (
  'Мое пространство',
  '🏠',
  'personal',
  'bce3b14c-4ed7-4682-965c-a2ac05f76348'
)
ON CONFLICT DO NOTHING;

-- Шаг 4: Проверка
SELECT 
  u.id,
  u.name,
  u.initials,
  u.avatar_color,
  (SELECT COUNT(*) FROM public.spaces WHERE owner_id = u.id) as spaces_count
FROM public.users u
WHERE u.id = 'bce3b14c-4ed7-4682-965c-a2ac05f76348';

-- Должно показать: 1 строку с именем "Женя" и spaces_count = 1
