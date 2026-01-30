# ⚡ БЫСТРОЕ ИСПРАВЛЕНИЕ (30 секунд)

## Проблема: 406 Not Acceptable при запросе к users

## Решение:

### 1. Откройте Supabase SQL Editor

https://supabase.com/dashboard/project/ihivunmndpsysxdtedti/sql/new

### 2. Скопируйте и выполните этот SQL:

```sql
-- Исправление RLS policy для users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Проверка
SELECT '✅ Policy исправлена!' as status;
```

### 3. Нажмите Run (Ctrl+Enter)

### 4. Перезагрузите приложение (Ctrl+Shift+R)

✅ Ошибка 406 должна исчезнуть!

---

## Если не помогло:

Выполните полный скрипт исправления:

```sql
-- Скопируйте содержимое файла supabase/fix-all-policies.sql
-- И выполните в SQL Editor
```
