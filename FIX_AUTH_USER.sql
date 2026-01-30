-- Исправление пользователя в auth.users

-- Шаг 1: Проверить пользователя
SELECT 
  id,
  email,
  email_confirmed_at,
  encrypted_password,
  created_at
FROM auth.users 
WHERE email = 'zhenya@twodo.app';

-- Шаг 2: Если пользователь есть, но email не подтвержден:
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'zhenya@twodo.app' AND email_confirmed_at IS NULL;

-- Шаг 3: Сбросить пароль (если нужно)
UPDATE auth.users 
SET encrypted_password = crypt('Zhenya2025!', gen_salt('bf'))
WHERE email = 'zhenya@twodo.app';

-- Шаг 4: Проверить identities
SELECT * FROM auth.identities 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'zhenya@twodo.app'
);

-- Шаг 5: Если identities нет, создать:
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  id,
  format('{"sub": "%s", "email": "%s"}', id::text, email)::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'zhenya@twodo.app'
AND NOT EXISTS (
  SELECT 1 FROM auth.identities 
  WHERE user_id = auth.users.id
);

-- Финальная проверка
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  (SELECT COUNT(*) FROM auth.identities WHERE user_id = u.id) as identities_count
FROM auth.users u
WHERE u.email = 'zhenya@twodo.app';

-- Должно показать: email_confirmed = true, identities_count = 1
