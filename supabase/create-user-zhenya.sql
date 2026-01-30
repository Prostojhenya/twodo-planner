-- Создание пользователя "Женя" в базе данных TwoDo
-- 
-- ВАЖНО: Этот скрипт создает пользователя напрямую в базе данных.
-- В продакшене пользователи должны регистрироваться через Supabase Auth.

-- Шаг 1: Создать пользователя в auth.users
-- Замените 'zhenya@example.com' и 'secure_password_here' на реальные данные
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(), -- Генерируем UUID для пользователя
  '00000000-0000-0000-0000-000000000000', -- Instance ID (используйте ID вашего проекта)
  'zhenya@example.com', -- Email пользователя
  crypt('secure_password_here', gen_salt('bf')), -- Зашифрованный пароль
  NOW(), -- Email подтвержден сразу
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  'authenticated'
)
RETURNING id; -- Запомните этот ID для следующего шага

-- Шаг 2: Добавить профиль пользователя в public.users
-- Замените 'USER_ID_FROM_STEP_1' на UUID, полученный в шаге 1
INSERT INTO public.users (
  id,
  name,
  initials,
  avatar_color,
  created_at,
  updated_at
) VALUES (
  'USER_ID_FROM_STEP_1', -- UUID из шага 1
  'Женя',
  'Ж',
  'emerald', -- Цвет аватара (slate, rose, blue, emerald, amber, violet)
  NOW(),
  NOW()
);

-- Шаг 3 (опционально): Создать личное пространство для пользователя
INSERT INTO public.spaces (
  id,
  title,
  icon,
  type,
  owner_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Мое пространство',
  '🏠',
  'personal',
  'USER_ID_FROM_STEP_1', -- UUID пользователя
  NOW(),
  NOW()
);

-- Проверка: Посмотреть созданного пользователя
SELECT 
  u.id,
  u.name,
  u.initials,
  u.avatar_color,
  au.email,
  u.created_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.name = 'Женя';
