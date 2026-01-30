-- Создание профиля для пользователя Женя
-- UUID: 762eb16b-154c-4845-b66b-e2d820170829

-- Шаг 1: Создать профиль
INSERT INTO public.users (id, name, initials, avatar_color)
VALUES (
  '762eb16b-154c-4845-b66b-e2d820170829',
  'Женя',
  'Ж',
  'emerald'
);

-- Шаг 2: Создать личное пространство
INSERT INTO public.spaces (title, icon, type, owner_id)
VALUES (
  'Мое пространство',
  '🏠',
  'personal',
  '762eb16b-154c-4845-b66b-e2d820170829'
);

-- Шаг 3: Проверка
SELECT 
  u.id,
  u.name,
  u.initials,
  u.avatar_color,
  (SELECT COUNT(*) FROM public.spaces WHERE owner_id = u.id) as spaces_count
FROM public.users u
WHERE u.id = '762eb16b-154c-4845-b66b-e2d820170829';

-- Должно показать: 1 строку с именем "Женя" и spaces_count = 1
