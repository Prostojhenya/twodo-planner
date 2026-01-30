#!/bin/bash

# Скрипт автоматического деплоя на Vercel

echo "🚀 Начинаем деплой TwoDo на Vercel..."

# Проверка установки Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен"
    echo "Установите: npm install -g vercel"
    exit 1
fi

# Сборка проекта
echo ""
echo "📦 Сборка проекта..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки"
    exit 1
fi

echo "✅ Сборка успешна"

# Деплой на Vercel
echo ""
echo "🌐 Деплой на Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Деплой успешен!"
    echo ""
    echo "📋 Не забудьте добавить переменные окружения в Vercel Dashboard:"
    echo "   VITE_SUPABASE_URL"
    echo "   VITE_SUPABASE_ANON_KEY"
    echo ""
    echo "🎉 Приложение доступно по ссылке выше!"
else
    echo "❌ Ошибка деплоя"
    exit 1
fi
