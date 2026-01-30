# 🚀 Быстрое решение: Создание пользователя "Женя"

## Проблема
Ошибка 500 при попытке входа означает, что пользователь создан некорректно в auth.users.

## ✅ Решение 1: Через Supabase Dashboard (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Создайте пользователя через UI

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Authentication** → **Users**
4. Нажмите **Add user** → **Create new user**
5. Заполните форму:
   ```
   Email: zhenya@twodo.app
   Password: Zhenya2025!
   Auto Confirm User: ✅ (ОБЯЗАТЕЛЬНО включить!)
   ```
6. Нажмите **Create user**
7. **ВАЖНО**: Скопируйте UUID пользователя из списка (например: `a1b2c3d4-...`)

### Шаг 2: Добавьте профиль пользователя

1. Перейдите в **SQL Editor**
2. Нажмите **New Query**
3. Вставьте этот код (замените `YOUR_USER_UUID`):

```sql
-- Замените YOUR_USER_UUID на скопированный UUID из шага 1
DO $$
DECLARE
  user_uuid UUID := 'YOUR_USER_UUID'; -- <-- ВСТАВЬТЕ СЮДА UUID
  new_space_id UUID;
BEGIN
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
    user_uuid,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Профиль создан!';
  RAISE NOTICE 'Space ID: %', new_space_id;
END $$;
```

4. Нажмите **Run**

### Шаг 3: Войдите в приложение

Теперь можете войти:
- Email: `zhenya@twodo.app`
- Password: `Zhenya2025!`

---

## ✅ Решение 2: Через SQL (если решение 1 не работает)

Если у вас есть права администратора, попробуйте этот скрипт:

### Шаг 1: Удалите старого пользователя (если есть)

```sql
-- Удалить все следы старого пользователя
DELETE FROM auth.users WHERE email = 'zhenya@twodo.app';
```

### Шаг 2: Выполните безопасный скрипт

Откройте файл `supabase/create-user-zhenya-safe.sql` и выполните его в SQL Editor.

---

## 🔍 Проверка после создания

Выполните эти запросы, чтобы убедиться, что всё создано правильно:

```sql
-- 1. Проверить пользователя в auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'zhenya@twodo.app';

-- 2. Проверить профиль в public.users
SELECT * FROM public.users WHERE name = 'Женя';

-- 3. Проверить пространства
SELECT s.* 
FROM public.spaces s
JOIN public.users u ON s.owner_id = u.id
WHERE u.name = 'Женя';

-- 4. Проверить identities (важно для входа!)
SELECT * FROM auth.identities 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'zhenya@twodo.app'
);
```

**Ожидаемый результат:**
- ✅ 1 запись в auth.users
- ✅ 1 запись в public.users
- ✅ 1 запись в public.spaces
- ✅ 1 запись в auth.identities

---

## 🐛 Troubleshooting

### Ошибка: "Email not confirmed"

```sql
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'zhenya@twodo.app';
```

### Ошибка: "Invalid login credentials"

Сбросьте пароль:

```sql
UPDATE auth.users 
SET encrypted_password = crypt('Zhenya2025!', gen_salt('bf'))
WHERE email = 'zhenya@twodo.app';
```

### Ошибка: "User not found in public.users"

```sql
-- Получите UUID пользователя
SELECT id FROM auth.users WHERE email = 'zhenya@twodo.app';

-- Создайте профиль (замените UUID)
INSERT INTO public.users (id, name, initials, avatar_color)
VALUES ('UUID_FROM_ABOVE', 'Женя', 'Ж', 'emerald');
```

### Всё ещё не работает?

1. Проверьте логи в Supabase Dashboard → **Logs** → **Auth Logs**
2. Убедитесь, что Email provider включен: **Authentication** → **Providers** → **Email** (должен быть зеленым)
3. Проверьте RLS policies: возможно, они блокируют доступ

---

## 📝 Данные для входа

После успешного создания:

```
Email: zhenya@twodo.app
Password: Zhenya2025!
Имя: Женя
Инициалы: Ж
Цвет: Emerald (зеленый)
```

---

## 🔐 Безопасность

⚠️ После первого входа рекомендуется:
1. Сменить пароль на более безопасный
2. Включить двухфакторную аутентификацию (если доступно)
3. Не использовать тестовые пароли в продакшене
