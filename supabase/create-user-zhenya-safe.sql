-- Безопасное создание пользователя "Женя" через Supabase Admin API
-- Этот скрипт использует правильные функции Supabase

-- ВАЖНО: Выполните этот скрипт в Supabase SQL Editor

-- Шаг 1: Создаем пользователя через auth.users с правильной структурой
DO $$
DECLARE
  new_user_id UUID;
  new_space_id UUID;
BEGIN
  -- Генерируем UUID
  new_user_id := gen_random_uuid();
  
  -- Вставляем в auth.users с минимальными обязательными полями
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'zhenya@twodo.app',
    crypt('Zhenya2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Женя"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Вставляем в auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    format('{"sub": "%s", "email": "%s"}', new_user_id::text, 'zhenya@twodo.app')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
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
  
  RAISE NOTICE '✅ Пользователь создан успешно!';
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE 'Email: zhenya@twodo.app';
  RAISE NOTICE 'Password: Zhenya2025!';
  RAISE NOTICE 'Space ID: %', new_space_id;
  
END $$;

-- Проверка
SELECT 
  u.id,
  u.name,
  u.initials,
  u.avatar_color,
  au.email,
  au.email_confirmed_at,
  u.created_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.name = 'Женя';
