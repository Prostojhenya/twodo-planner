-- Добавление таблицы для списков покупок

-- 1. Создать таблицу shopping_lists
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon TEXT DEFAULT '🛒',
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Добавить колонку list_id в shopping_items
ALTER TABLE public.shopping_items 
ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE;

-- 3. Создать индексы
CREATE INDEX IF NOT EXISTS idx_shopping_lists_space_id ON public.shopping_lists(space_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_list_id ON public.shopping_items(list_id);

-- 4. Включить RLS
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- 5. Создать политики для shopping_lists
DROP POLICY IF EXISTS "Users can view shopping lists in their spaces" ON public.shopping_lists;
CREATE POLICY "Users can view shopping lists in their spaces"
ON public.shopping_lists FOR SELECT
USING (
  space_id IN (
    SELECT id FROM public.spaces 
    WHERE owner_id = auth.uid()
    OR id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can create shopping lists in their spaces" ON public.shopping_lists;
CREATE POLICY "Users can create shopping lists in their spaces"
ON public.shopping_lists FOR INSERT
WITH CHECK (
  space_id IN (
    SELECT id FROM public.spaces 
    WHERE owner_id = auth.uid()
    OR id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update shopping lists in their spaces" ON public.shopping_lists;
CREATE POLICY "Users can update shopping lists in their spaces"
ON public.shopping_lists FOR UPDATE
USING (
  space_id IN (
    SELECT id FROM public.spaces 
    WHERE owner_id = auth.uid()
    OR id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can delete shopping lists in their spaces" ON public.shopping_lists;
CREATE POLICY "Users can delete shopping lists in their spaces"
ON public.shopping_lists FOR DELETE
USING (
  space_id IN (
    SELECT id FROM public.spaces 
    WHERE owner_id = auth.uid()
    OR id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
  )
);

-- 6. Создать дефолтный список для каждого пространства
INSERT INTO public.shopping_lists (title, icon, space_id)
SELECT 'Основной список', '🛒', id
FROM public.spaces
WHERE NOT EXISTS (
  SELECT 1 FROM public.shopping_lists WHERE space_id = spaces.id
);

-- 7. Обновить существующие покупки - привязать к дефолтному списку
UPDATE public.shopping_items si
SET list_id = (
  SELECT id FROM public.shopping_lists sl
  WHERE sl.space_id = si.space_id
  LIMIT 1
)
WHERE list_id IS NULL;

SELECT '✅ Таблица shopping_lists создана и настроена!' as status;
