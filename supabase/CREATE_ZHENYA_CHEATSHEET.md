# 🚀 Шпаргалка: Создать пользователя "Женя"

## Быстрые шаги (5 минут)

### 1️⃣ Создать пользователя в Dashboard

```
Supabase Dashboard → Authentication → Users → Add user
Email: zhenya@twodo.app
Password: Zhenya2025!
Auto Confirm: ✅
→ Create user
→ Скопировать UUID
```

### 2️⃣ Добавить профиль через SQL

```
Supabase Dashboard → SQL Editor → New Query
```

Вставить (заменить `YOUR_USER_UUID`):

```sql
DO $$
DECLARE
  user_uuid UUID := 'YOUR_USER_UUID';
  new_space_id UUID;
BEGIN
  INSERT INTO public.users (id, name, initials, avatar_color)
  VALUES (user_uuid, 'Женя', 'Ж', 'emerald');
  
  new_space_id := gen_random_uuid();
  INSERT INTO public.spaces (title, icon, type, owner_id)
  VALUES ('Мое пространство', '🏠', 'personal', user_uuid);
  
  RAISE NOTICE '✅ Готово!';
END $$;
```

→ Run

### 3️⃣ Войти

```
Email: zhenya@twodo.app
Password: Zhenya2025!
```

---

## 🐛 Если не работает

### Проблема: Ошибка 500 при входе

**Решение**: Проверить email подтвержден

```sql
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'zhenya@twodo.app';
```

### Проблема: "Invalid credentials"

**Решение**: Сбросить пароль

```sql
UPDATE auth.users 
SET encrypted_password = crypt('Zhenya2025!', gen_salt('bf'))
WHERE email = 'zhenya@twodo.app';
```

### Проблема: Пользователь уже существует

**Решение**: Удалить и создать заново

```sql
DELETE FROM auth.users WHERE email = 'zhenya@twodo.app';
```

Затем повторить шаги 1-2.

---

## ✅ Проверка

```sql
-- Должно вернуть 3 строки
SELECT 'auth.users' as table_name, COUNT(*) as count
FROM auth.users WHERE email = 'zhenya@twodo.app'
UNION ALL
SELECT 'public.users', COUNT(*)
FROM public.users WHERE name = 'Женя'
UNION ALL
SELECT 'public.spaces', COUNT(*)
FROM public.spaces s
JOIN public.users u ON s.owner_id = u.id
WHERE u.name = 'Женя';
```

Ожидаемый результат:
```
auth.users    | 1
public.users  | 1
public.spaces | 1
```

---

## 📁 Полезные файлы

- `CREATE_USER_INSTRUCTIONS.md` - Подробная инструкция
- `QUICK_FIX_CREATE_USER.md` - Решение проблем
- `create-user-zhenya-safe.sql` - Безопасный SQL скрипт
- `reset-and-create-zhenya.sql` - Полная очистка и пересоздание
