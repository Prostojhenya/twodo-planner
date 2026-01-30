# 🔑 Как получить Service Role Key

## Шаг 1: Откройте Supabase Dashboard

Перейдите по ссылке: https://supabase.com/dashboard/project/ihivunmndpsysxdtedti

## Шаг 2: Перейдите в настройки API

1. В левом меню найдите **Settings** (⚙️)
2. Выберите **API**

## Шаг 3: Скопируйте Service Role Key

На странице API вы увидите несколько ключей:

- ❌ **anon public** - НЕ этот ключ (он уже есть в .env.local)
- ✅ **service_role** - ЭТОТ ключ нужен!

**Важно**: Service Role Key начинается с `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` и очень длинный.

## Шаг 4: Добавьте в .env.local

Откройте файл `.env.local` и добавьте строку:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ваш_ключ_здесь...
```

Должно получиться так:

```env
GEMINI_API_KEY=PLACEHOLDER_API_KEY

# Supabase Configuration
VITE_SUPABASE_URL=https://ihivunmndpsysxdtedti.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXZ1bm1uZHBzeXN4ZHRlZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3Nzg0OTksImV4cCI6MjA4NTM1NDQ5OX0.yyPVXLtFQnDl1DmcnUREcXIFrLVP-4VSGGO2qzzfAdo

# Service Role Key (для скриптов администратора)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ваш_service_role_ключ...
```

## Шаг 5: Запустите скрипт

```bash
npm run create-user
```

## ⚠️ Безопасность

**Service Role Key** - это ключ администратора с полными правами:
- ✅ Используйте только локально
- ✅ Никогда не коммитьте в Git (уже в .gitignore)
- ✅ Не используйте в клиентском коде
- ✅ Не делитесь с другими

Если ключ скомпрометирован:
1. Перейдите в Supabase Dashboard → Settings → API
2. Нажмите "Reset" рядом с service_role key
3. Обновите ключ в .env.local

---

## Готово!

После добавления ключа запустите:

```bash
npm run create-user
```

И пользователь "Женя" будет создан автоматически! 🎉
