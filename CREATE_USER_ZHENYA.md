# 🚀 Создать пользователя "Женя" - Быстрая инструкция

## Автоматический способ (рекомендуется)

### Шаг 1: Получите Service Role Key

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Settings → API
3. Скопируйте **service_role** key

### Шаг 2: Добавьте в .env.local

```env
SUPABASE_SERVICE_ROLE_KEY=ваш_service_role_key_здесь
```

### Шаг 3: Запустите скрипт

```bash
npm install
npm run create-user
```

### Шаг 4: Войдите

```
Email: zhenya@twodo.app
Password: Zhenya2025!
```

---

## Ручной способ (если автоматический не работает)

### Через Supabase Dashboard

1. **Authentication → Users → Add user**
   - Email: `zhenya@twodo.app`
   - Password: `Zhenya2025!`
   - Auto Confirm: ✅
   - Create user
   - Скопируйте UUID

2. **SQL Editor → New Query**

```sql
DO $$
DECLARE
  user_uuid UUID := 'ВСТАВЬТЕ_UUID_СЮДА';
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

3. Run

---

## 📚 Подробная документация

- `scripts/README.md` - Полная инструкция по скрипту
- `supabase/CREATE_ZHENYA_CHEATSHEET.md` - Шпаргалка
- `supabase/QUICK_FIX_CREATE_USER.md` - Решение проблем
- `supabase/CREATE_USER_INSTRUCTIONS.md` - Детальное руководство

---

## 🐛 Проблемы?

### Ошибка 500 при входе

```sql
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'zhenya@twodo.app';
```

### Неверный пароль

```sql
UPDATE auth.users 
SET encrypted_password = crypt('Zhenya2025!', gen_salt('bf'))
WHERE email = 'zhenya@twodo.app';
```

### Удалить и создать заново

```sql
DELETE FROM auth.users WHERE email = 'zhenya@twodo.app';
```

Затем повторите создание.
