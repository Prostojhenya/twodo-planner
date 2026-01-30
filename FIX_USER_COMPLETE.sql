-- ПОЛНОЕ ИСПРАВЛЕНИЕ: Создание пользователя с нуля

-- Шаг 1: Проверить существующих пользователей в auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'zhenya@twodo.app';

-- Если пользователь НЕ найден, создайте его через Dashboard:
-- Authentication → Users → Add user → Create new user
-- Email: zhenya@twodo.app
-- Password: Zhenya2025!
-- Auto Confirm: ✅

-- После создания через Dashboard, скопируйте UUID и выполните:

-- Шаг 2: Создать профиль (замените YOUR_USER_ID на UUID из шага 1)
/*
INSERT INTO public.users (id, name, initials, avatar_color)
VALUES (
  'YOUR_USER_ID', -- <-- ВСТАВЬТЕ UUID СЮДА
  'Женя',
  'Ж',
  'emerald'
);

-- Шаг 3: Создать личное пространство
INSERT INTO public.spaces (title, icon, type, owner_id)
VALUES (
  'Мое пространство',
  '🏠',
  'personal',
  'YOUR_USER_ID' -- <-- ТОТ ЖЕ UUID
);

-- Шаг 4: Проверка
SELECT 
  u.id,
  u.name,
  u.initials,
  (SELECT COUNT(*) FROM public.spaces WHERE owner_id = u.id) as spaces_count
FROM public.users u
WHERE u.name = 'Женя';
*/

-- Должно показать: 1 строку с именем "Женя" и spaces_count = 1
