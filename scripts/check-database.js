/**
 * Скрипт для проверки состояния базы данных
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Проверка базы данных...\n');

  try {
    // Проверяем таблицу users
    console.log('1️⃣ Проверяем таблицу public.users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Таблица users не найдена или недоступна');
      console.log('   Ошибка:', usersError.message);
    } else {
      console.log('✅ Таблица users существует');
      console.log('   Записей:', users?.length || 0);
    }

    // Проверяем таблицу spaces
    console.log('\n2️⃣ Проверяем таблицу public.spaces...');
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .select('*')
      .limit(1);
    
    if (spacesError) {
      console.log('❌ Таблица spaces не найдена или недоступна');
      console.log('   Ошибка:', spacesError.message);
    } else {
      console.log('✅ Таблица spaces существует');
      console.log('   Записей:', spaces?.length || 0);
    }

    // Проверяем auth.users
    console.log('\n3️⃣ Проверяем auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Не удалось получить список пользователей');
      console.log('   Ошибка:', authError.message);
    } else {
      console.log('✅ Доступ к auth.users есть');
      console.log('   Пользователей:', authUsers?.users?.length || 0);
    }

    console.log('\n📋 Итог:');
    if (usersError || spacesError) {
      console.log('❌ База данных не настроена');
      console.log('\n💡 Решение:');
      console.log('1. Откройте Supabase Dashboard → SQL Editor');
      console.log('2. Выполните содержимое файла supabase/schema.sql');
      console.log('3. Повторите создание пользователя');
    } else {
      console.log('✅ База данных настроена правильно');
    }

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
  }
}

checkDatabase();
