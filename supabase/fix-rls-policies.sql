-- Исправление RLS policies для корректной работы с PostgREST

-- Удаляем старые проблемные policies
DROP POLICY IF EXISTS "Users can view their own spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can view space members of their spaces" ON public.space_members;

-- Создаем упрощенные policies без подзапросов

-- Spaces: пользователь видит свои пространства и те, где он участник
CREATE POLICY "Users can view their spaces" ON public.spaces
  FOR SELECT USING (
    owner_id = auth.uid()
  );

CREATE POLICY "Users can view shared spaces" ON public.spaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.space_members 
      WHERE space_members.space_id = spaces.id 
      AND space_members.user_id = auth.uid()
    )
  );

-- Space members: упрощенная policy
CREATE POLICY "Users can view members" ON public.space_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    )
  );

-- Проверяем, что policies применены
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('spaces', 'space_members')
ORDER BY tablename, policyname;
