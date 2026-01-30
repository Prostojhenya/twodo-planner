/**
 * Скрипт для создания пользователя "Женя" через Supabase Admin API
 * 
 * Использование:
 * 1. Установите зависимости: npm install @supabase/supabase-js dotenv
 * 2. Убедитесь, что .env.local содержит VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
 * 3. Добавьте SUPABASE_SERVICE_ROLE_KEY в .env.local (из Supabase Dashboard → Settings → API)
 * 4. Запустите: node scripts/create-user-zhenya.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Загружаем переменные окружения
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

try {
  const envConfig = dotenv.parse(readFileSync(envPath));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
} catch (error) {
  console.error('❌ Не удалось загрузить .env.local:', error.message);
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены необходимые переменные окружения');
  console.error('Убедитесь, что в .env.local есть:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (из Supabase Dashboard → Settings → API → service_role key)');
  process.exit(1);
}

// Создаем Supabase Admin клиент
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUserZhenya() {
  console.log('🚀 Начинаем создание пользователя "Женя"...\n');

  const email = 'zhenya@twodo.app';
  const password = 'Zhenya2025!';
  const name = 'Женя';
  const initials = 'Ж';
  const avatarColor = 'emerald';

  try {
    // Шаг 1: Проверяем, существует ли пользователь
    console.log('1️⃣ Проверяем существующего пользователя...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId;

    if (existingUser) {
      console.log(`⚠️  Пользователь с email ${email} уже существует`);
      console.log(`   User ID: ${existingUser.id}`);
      userId = existingUser.id;
      
      // Обновляем пароль на всякий случай
      console.log('   Обновляем пароль...');
      await supabase.auth.admin.updateUserById(userId, { password });
    } else {
      // Шаг 2: Создаем пользователя через Admin API
      console.log('2️⃣ Создаем пользователя в auth.users...');
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
      });

      if (authError) {
        throw new Error(`Ошибка создания пользователя: ${authError.message}`);
      }

      userId = newUser.user.id;
      console.log(`✅ Пользователь создан в auth.users`);
      console.log(`   User ID: ${userId}`);
    }

    // Шаг 3: Создаем или обновляем профиль в public.users
    console.log('\n3️⃣ Создаем профиль в public.users...');
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        name,
        initials,
        avatar_color: avatarColor,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      throw new Error(`Ошибка создания профиля: ${profileError.message}`);
    }

    console.log('✅ Профиль создан в public.users');

    // Шаг 4: Проверяем наличие личного пространства
    console.log('\n4️⃣ Проверяем личное пространство...');
    const { data: existingSpaces } = await supabase
      .from('spaces')
      .select('*')
      .eq('owner_id', userId)
      .eq('type', 'personal');

    if (!existingSpaces || existingSpaces.length === 0) {
      // Создаем личное пространство
      const { data: newSpace, error: spaceError } = await supabase
        .from('spaces')
        .insert({
          title: 'Мое пространство',
          icon: '🏠',
          type: 'personal',
          owner_id: userId
        })
        .select()
        .single();

      if (spaceError) {
        throw new Error(`Ошибка создания пространства: ${spaceError.message}`);
      }

      console.log('✅ Личное пространство создано');
      console.log(`   Space ID: ${newSpace.id}`);
    } else {
      console.log('✅ Личное пространство уже существует');
      console.log(`   Space ID: ${existingSpaces[0].id}`);
    }

    // Финальная проверка
    console.log('\n5️⃣ Финальная проверка...');
    const { data: userData } = await supabase
      .from('users')
      .select('*, spaces(*)')
      .eq('id', userId)
      .single();

    console.log('\n✅ Пользователь "Женя" успешно создан!\n');
    console.log('📋 Данные для входа:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Имя:', userData.name);
    console.log('   Инициалы:', userData.initials);
    console.log('   Цвет:', userData.avatar_color);
    console.log('   Пространств:', userData.spaces?.length || 0);
    console.log('\n🎉 Теперь можете войти в приложение!');

  } catch (error) {
    console.error('\n❌ Ошибка при создании пользователя:');
    console.error(error.message);
    console.error('\n💡 Возможные решения:');
    console.error('1. Проверьте, что SUPABASE_SERVICE_ROLE_KEY правильный');
    console.error('2. Убедитесь, что схема базы данных создана (supabase/schema.sql)');
    console.error('3. Проверьте RLS policies в Supabase Dashboard');
    process.exit(1);
  }
}

// Запускаем скрипт
createUserZhenya();
