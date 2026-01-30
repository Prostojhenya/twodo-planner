-- Упрощенное создание пользователя "Женя"
-- Выполните этот скрипт в Supabase SQL Editor

-- Создаем пользователя с помощью одной транзакции
DO $$
DECLARE
  new_user_id UUID;
  new_space_id UUID;
BEGIN
  -- Генерируем UUID для нового пользователя
  new_user_id := gen_random_uuid();
  
  -- Создаем пользователя в auth.users
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
    role,
    aud
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'zhenya@twodo.app',
    crypt('Zhenya2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Женя"}'::jsonb,
    false,
    'authenticated',
    'authenticated'
  );
  
  -- Создаем профиль в public.users
  INSERT INTO public.users (
    id,
    name,
    initials,
    avatar_color,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'Женя',
    'Ж',
    'emerald',
    NOW(),
    NOW()
  );
  
  -- Создаем личное пространство
  new_space_id := gen_random_uuid();
  INSERT INTO public.spaces (
    id,
    title,
    icon,
    type,
    owner_id,
    created_at,
    updated_at
  ) VALUES (
    new_space_id,
    'Мое пространство',
    '🏠',
    'personal',
    new_user_id,
    NOW(),
    NOW()
  );
  
  -- Выводим информацию о созданном пользователе
  RAISE NOTICE 'Пользователь создан успешно!';
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE 'Email: zhenya@twodo.app';
  RAISE NOTICE 'Password: Zhenya2025!';
  RAISE NOTICE 'Space ID: %', new_space_id;
  
END $$;

-- Проверка созданного пользователя
SELECT 
  u.id,
  u.name,
  u.initials,
  u.avatar_color,
  au.email,
  u.created_at,
  (SELECT COUNT(*) FROM public.spaces WHERE owner_id = u.id) as spaces_count
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.name = 'Женя';
