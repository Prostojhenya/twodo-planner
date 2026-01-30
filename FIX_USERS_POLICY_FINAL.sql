-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ: Правильная настройка RLS для users

-- Шаг 1: Удалить ВСЕ существующие policies для users
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    END LOOP;
END $$;

-- Шаг 2: Создать правильные policies

-- SELECT: Пользователи могут видеть свой профиль
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- INSERT: Пользователи могут создавать свой профиль
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Пользователи могут обновлять свой профиль
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Шаг 3: Убедиться, что RLS включен
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Шаг 4: Разрешить service_role полный доступ (для скриптов)
CREATE POLICY "users_service_role_all" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Проверка
SELECT 
  policyname,
  cmd,
  roles::text
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

SELECT '✅ RLS policies для users настроены правильно!' as status;
