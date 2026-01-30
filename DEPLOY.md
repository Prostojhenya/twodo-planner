# 🚀 Деплой TwoDo на Vercel

## Быстрый деплой (5 минут)

### Вариант 1: Через Vercel CLI (рекомендуется)

#### Шаг 1: Установите Vercel CLI

```bash
npm install -g vercel
```

#### Шаг 2: Войдите в Vercel

```bash
vercel login
```

#### Шаг 3: Деплой

```bash
vercel
```

Следуйте инструкциям:
- Set up and deploy? **Y**
- Which scope? Выберите ваш аккаунт
- Link to existing project? **N**
- What's your project's name? **twodo** (или любое другое)
- In which directory is your code located? **./** (нажмите Enter)

#### Шаг 4: Добавьте переменные окружения

```bash
vercel env add VITE_SUPABASE_URL
# Вставьте: https://ihivunmndpsysxdtedti.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Вставьте ключ из .env.local
```

#### Шаг 5: Production деплой

```bash
vercel --prod
```

✅ Готово! Ваше приложение доступно по ссылке, которую покажет Vercel.

---

### Вариант 2: Через Vercel Dashboard

#### Шаг 1: Подготовьте Git репозиторий

```bash
git init
git add .
git commit -m "Initial commit"
```

Загрузите на GitHub:
```bash
# Создайте репозиторий на GitHub, затем:
git remote add origin https://github.com/ваш-username/twodo.git
git branch -M main
git push -u origin main
```

#### Шаг 2: Импортируйте в Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/new)
2. Нажмите **Import Project**
3. Выберите ваш GitHub репозиторий
4. Vercel автоматически определит настройки (Vite)

#### Шаг 3: Добавьте переменные окружения

В настройках проекта:
1. Settings → Environment Variables
2. Добавьте:
   ```
   VITE_SUPABASE_URL = https://ihivunmndpsysxdtedti.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### Шаг 4: Deploy

Нажмите **Deploy** и дождитесь завершения.

✅ Готово! Приложение доступно по ссылке типа `twodo.vercel.app`

---

## 🔧 Настройка домена (опционально)

### Добавить свой домен

1. Vercel Dashboard → Settings → Domains
2. Добавьте ваш домен (например, `twodo.app`)
3. Следуйте инструкциям по настройке DNS

---

## 📋 Проверка после деплоя

### 1. Откройте приложение

Перейдите по ссылке, которую дал Vercel (например, `https://twodo.vercel.app`)

### 2. Проверьте подключение к Supabase

Откройте DevTools (F12) → Console. Должны увидеть:
```
Supabase URL: https://ihivunmndpsysxdtedti.supabase.co
Supabase Key exists: true
```

### 3. Войдите в приложение

```
Email: zhenya@twodo.app
Password: Zhenya2025!
```

Если всё работает - деплой успешен! 🎉

---

## 🐛 Troubleshooting

### Ошибка: "Failed to compile"

Проверьте, что все зависимости установлены:
```bash
npm install
npm run build
```

### Ошибка: "Environment variables not found"

Убедитесь, что переменные добавлены в Vercel:
- Settings → Environment Variables
- Должны быть `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`

### Ошибка: "Cannot connect to Supabase"

1. Проверьте переменные окружения в Vercel
2. Убедитесь, что Supabase проект активен
3. Проверьте, что anon key правильный

### Приложение не загружается (белый экран)

1. Проверьте логи в Vercel Dashboard → Deployments → View Function Logs
2. Проверьте консоль браузера (F12)
3. Убедитесь, что `vercel.json` настроен правильно

---

## 🔄 Обновление деплоя

### Через CLI

```bash
# Внесите изменения в код
git add .
git commit -m "Update"
git push

# Или напрямую через Vercel CLI
vercel --prod
```

### Через GitHub

Просто сделайте `git push` - Vercel автоматически задеплоит изменения.

---

## 📊 Мониторинг

### Vercel Analytics

1. Vercel Dashboard → Analytics
2. Смотрите статистику посещений, производительность

### Supabase Logs

1. Supabase Dashboard → Logs
2. Смотрите запросы к базе данных, ошибки

---

## 🎯 Что дальше?

- ✅ Настройте свой домен
- ✅ Включите Vercel Analytics
- ✅ Настройте мониторинг ошибок (Sentry)
- ✅ Добавьте CI/CD тесты
- ✅ Настройте preview deployments для pull requests

---

## 📚 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase with Vercel](https://supabase.com/docs/guides/getting-started/tutorials/with-vercel)
