-- Полное исправление всех RLS policies для работы с PostgREST

-- ============================================
-- 1. USERS TABLE
-- ============================================

-- Удаляем старые policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Создаем новые policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. SPACES TABLE
-- ============================================

-- Удаляем старые policies
DROP POLICY IF EXISTS "Users can view their own spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can view their spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can view shared spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can create spaces" ON public.spaces;
DROP POLICY IF EXISTS "Space owners can update their spaces" ON public.spaces;
DROP POLICY IF EXISTS "Space owners can delete their spaces" ON public.spaces;

-- Создаем новые упрощенные policies
CREATE POLICY "Users can view owned spaces" ON public.spaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view member spaces" ON public.spaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.space_members 
      WHERE space_members.space_id = spaces.id 
      AND space_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create spaces" ON public.spaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update spaces" ON public.spaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete spaces" ON public.spaces
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- 3. SPACE_MEMBERS TABLE
-- ============================================

-- Удаляем старые policies
DROP POLICY IF EXISTS "Users can view space members of their spaces" ON public.space_members;
DROP POLICY IF EXISTS "Users can view members" ON public.space_members;
DROP POLICY IF EXISTS "Space owners can manage members" ON public.space_members;

-- Создаем новые policies
CREATE POLICY "Users can view their memberships" ON public.space_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners can view members" ON public.space_members
  FOR SELECT USING (
    space_id IN (SELECT id FROM public.spaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners can manage members" ON public.space_members
  FOR ALL USING (
    space_id IN (SELECT id FROM public.spaces WHERE owner_id = auth.uid())
  );

-- ============================================
-- 4. CLUSTERS TABLE
-- ============================================

-- Удаляем старые policies
DROP POLICY IF EXISTS "Users can view clusters in their spaces" ON public.clusters;
DROP POLICY IF EXISTS "Users can manage clusters in their spaces" ON public.clusters;

-- Создаем новые policies
CREATE POLICY "Users can view clusters" ON public.clusters
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage clusters" ON public.clusters
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 5. TASKS TABLE
-- ============================================

-- Удаляем старые policies
DROP POLICY IF EXISTS "Users can view tasks in their spaces" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage tasks in their spaces" ON public.tasks;

-- Создаем новые policies
CREATE POLICY "Users can view tasks" ON public.tasks
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tasks" ON public.tasks
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 6. NOTES TABLE
-- ============================================

-- Удаляем старые policies
DROP POLICY IF EXISTS "Users can view notes in their spaces" ON public.notes;
DROP POLICY IF EXISTS "Users can manage notes in their spaces" ON public.notes;

-- Создаем новые policies
CREATE POLICY "Users can view notes" ON public.notes
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage notes" ON public.notes
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 7. EVENTS TABLE
-- ============================================

-- Удаляем старые policies
DROP POLICY IF EXISTS "Users can view events in their spaces" ON public.events;
DROP POLICY IF EXISTS "Users can manage events in their spaces" ON public.events;

-- Создаем новые policies
CREATE POLICY "Users can view events" ON public.events
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage events" ON public.events
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 8. SHOPPING_ITEMS TABLE
-- ============================================

-- Удаляем старые policies
DROP POLICY IF EXISTS "Users can view shopping items in their spaces" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can manage shopping items in their spaces" ON public.shopping_items;

-- Создаем новые policies
CREATE POLICY "Users can view shopping" ON public.shopping_items
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage shopping" ON public.shopping_items
  FOR ALL USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- ПРОВЕРКА
-- ============================================

-- Показать все policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Готово!
SELECT '✅ Все RLS policies обновлены!' as status;
