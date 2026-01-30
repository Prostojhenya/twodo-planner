-- Полная очистка и пересоздание пользователя "Женя"
-- Выполните этот скрипт, если предыдущие попытки не сработали

-- ШАГ 1: Удаляем все следы старого пользователя
DO $$
BEGIN
  -- Удаляем из auth.users (каскадно удалит всё остальное)
  DELETE FROM auth.users WHERE email = 'zhenya@twodo.app';
  
  RAISE NOTICE '🗑️ Старые данные удалены';
END $$;

-- ШАГ 2: Ждем немного (для очистки кэша)
SELECT pg_sleep(1);

-- ШАГ 3: Создаем пользователя заново
-- ВАЖНО: Используйте Supabase Dashboard для создания пользователя!
-- Authentication → Users → Add user → Create new user
-- Email: zhenya@twodo.app
-- Password: Zhenya2025!
-- Auto Confirm User: ✅

-- После создания через Dashboard, выполните следующий блок:
-- (Замените YOUR_USER_UUID на UUID из Dashboard)

/*
DO $$
DECLARE
  user_uuid UUID := 'YOUR_USER_UUID'; -- <-- ЗАМЕНИТЕ НА РЕАЛЬНЫЙ UUID
  new_space_id UUID;
BEGIN
  -- Проверяем, что пользователь существует в auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_uuid) THEN
    RAISE EXCEPTION 'Пользователь с UUID % не найден в auth.users. Сначала создайте пользователя через Dashboard!', user_uuid;
  END IF;
  
  -- Создаем профиль
  INSERT INTO public.users (
    id,
    name,
    initials,
    avatar_color,
    created_at,
    updated_at
  ) VALUES (
    user_uuid,
    'Женя',
    'Ж',
    'emerald',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    initials = EXCLUDED.initials,
    avatar_color = EXCLUDED.avatar_color,
    updated_at = NOW();
  
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
    user_uuid,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Профиль и пространство созданы успешно!';
  RAISE NOTICE 'User ID: %', user_uuid;
  RAISE NOTICE 'Space ID: %', new_space_id;
  
  -- Проверяем результат
  RAISE NOTICE '---';
  RAISE NOTICE 'Проверка:';
  RAISE NOTICE 'Email: %', (SELECT email FROM auth.users WHERE id = user_uuid);
  RAISE NOTICE 'Имя: %', (SELECT name FROM public.users WHERE id = user_uuid);
  RAISE NOTICE 'Пространств: %', (SELECT COUNT(*) FROM public.spaces WHERE owner_id = user_uuid);
  
END $$;
*/

-- ШАГ 4: Финальная проверка
-- Раскомментируйте и выполните после создания профиля:

/*
SELECT 
  'auth.users' as table_name,
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  au.created_at
FROM auth.users au
WHERE au.email = 'zhenya@twodo.app'

UNION ALL

SELECT 
  'public.users' as table_name,
  u.id,
  u.name as email,
  true as email_confirmed,
  u.created_at
FROM public.users u
WHERE u.name = 'Женя'

UNION ALL

SELECT 
  'public.spaces' as table_name,
  s.id,
  s.title as email,
  true as email_confirmed,
  s.created_at
FROM public.spaces s
JOIN public.users u ON s.owner_id = u.id
WHERE u.name = 'Женя';
*/
