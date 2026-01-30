# PowerShell скрипт автоматического деплоя на Vercel

Write-Host "🚀 Начинаем деплой TwoDo на Vercel..." -ForegroundColor Cyan

# Проверка установки Vercel CLI
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI не установлен" -ForegroundColor Red
    Write-Host "Установите: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Сборка проекта
Write-Host ""
Write-Host "📦 Сборка проекта..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Сборка успешна" -ForegroundColor Green

# Деплой на Vercel
Write-Host ""
Write-Host "🌐 Деплой на Vercel..." -ForegroundColor Cyan
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Деплой успешен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Не забудьте добавить переменные окружения в Vercel Dashboard:" -ForegroundColor Yellow
    Write-Host "   VITE_SUPABASE_URL" -ForegroundColor White
    Write-Host "   VITE_SUPABASE_ANON_KEY" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Приложение доступно по ссылке выше!" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка деплоя" -ForegroundColor Red
    exit 1
}
