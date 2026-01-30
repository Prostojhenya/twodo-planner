# Исправление ошибки 406 Not Acceptable

## Что было сделано

### 1. Изменения в коде
- ✅ Заменил `.maybeSingle()` на `.limit(1)` во всех запросах к таблице users
- ✅ Добавил явные заголовки Accept и Content-Type в Supabase клиент
- ✅ Улучшил обработку ошибок и логирование

### 2. Файлы изменены
- `lib/supabase.ts` - добавлены заголовки и настройки
- `App.tsx` - изменен метод loadUserProfile
- `lib/supabaseHelpers.ts` - изменен getUserProfile
- `lib/useSupabaseData.ts` - изменен запрос партнера

### 3. Созданы скрипты
- `scripts/fix-406-error.js` - проверка базы данных
- `FINAL_FIX_406.sql` - SQL для исправления
- `test-anon-access.html` - тест доступа через браузер

## Что нужно сделать

### Шаг 1: Выполнить SQL
1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите проект
3. Перейдите в SQL Editor
4. Скопируйте и выполните содержимое файла `FINAL_FIX_406.sql`

### Шаг 2: Проверить изменения
```bash
node scripts/fix-406-error.js
```

Должно показать:
- ✅ Пользователь найден
- ✅ Найдено пространств: >= 1
- ✅ Тестовый запрос успешен

### Шаг 3: Пересобрать и запустить приложение
```bash
npm run build
npm run dev
```

### Шаг 4: Войти в приложение
- Email: `zhenya@twodo.app`
- Password: `Zhenya2025!`

## Если ошибка все еще есть

### Вариант 1: Тест через браузер
1. Откройте файл `test-anon-access.html` в браузере
2. Нажмите кнопку "Проверить доступ"
3. Посмотрите результаты в консоли

### Вариант 2: Проверить RLS
```sql
-- В Supabase SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
```

Должно показать: `rowsecurity = false`

### Вариант 3: Проверить API напрямую
```bash
curl -X GET "https://ihivunmndpsysxdtedti.supabase.co/rest/v1/users?id=eq.762eb16b-154c-4845-b66b-e2d820170829" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXZ1bm1uZHBzeXN4ZHRlZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3Nzg0OTksImV4cCI6MjA4NTM1NDQ5OX0.yyPVXLtFQnDl1DmcnUREcXIFrLVP-4VSGGO2qzzfAdo" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXZ1bm1uZHBzeXN4ZHRlZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3Nzg0OTksImV4cCI6MjA4NTM1NDQ5OX0.yyPVXLtFQnDl1DmcnUREcXIFrLVP-4VSGGO2qzzfAdo"
```

## Причина ошибки 406

Ошибка 406 "Not Acceptable" в PostgREST возникает когда:
1. RLS блокирует доступ (решено: отключили RLS)
2. `.maybeSingle()` не может вернуть данные в нужном формате (решено: заменили на `.limit(1)`)
3. Отсутствуют правильные заголовки Accept (решено: добавили явные заголовки)

## Следующие шаги

После того как приложение заработает:
1. Включить RLS обратно
2. Настроить правильные политики доступа
3. Протестировать все функции
4. Сделать коммит и деплой
