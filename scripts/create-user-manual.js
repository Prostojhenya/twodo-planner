/**
 * Упрощенный скрипт - создает только профиль и пространство
 * Пользователя в auth.users нужно создать вручную через Dashboard
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import * as readline from 'readline';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createProfile() {
  console.log('🚀 Создание профиля для пользователя "Женя"\n');
  console.log('📋 Сначала создайте пользователя в Supabase Dashboard:');
  console.log('   1. Authentication → Users → Add user');
  console.log('   2. Email: zhenya@twodo.app');
  console.log('   3. Password: Zhenya2025!');
  console.log('   4. Auto Confirm: ✅');
  console.log('   5. Create user\n');

  const userId = await question('Введите UUID созданного пользователя: ');
  
  if (!userId || userId.length < 30) {
    console.log('❌ Неверный UUID');
    rl.close();
    return;
  }

  try {
    console.log('\n1️⃣ Создаем профиль в public.users...');
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId.trim(),
        name: 'Женя',
        initials: 'Ж',
        avatar_color: 'emerald',
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      throw new Error(`Ошибка создания профиля: ${profileError.message}`);
    }

    console.log('✅ Профиль создан');

    console.log('\n2️⃣ Создаем личное пространство...');
    const { data: newSpace, error: spaceError } = await supabase
      .from('spaces')
      .insert({
        title: 'Мое пространство',
        icon: '🏠',
        type: 'personal',
        owner_id: userId.trim()
      })
      .select()
      .single();

    if (spaceError) {
      throw new Error(`Ошибка создания пространства: ${spaceError.message}`);
    }

    console.log('✅ Пространство создано');
    console.log(`   Space ID: ${newSpace.id}`);

    console.log('\n✅ Готово! Пользователь "Женя" настроен\n');
    console.log('📋 Данные для входа:');
    console.log('   Email: zhenya@twodo.app');
    console.log('   Password: Zhenya2025!');
    console.log('\n🎉 Теперь можете войти в приложение!');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
  }

  rl.close();
}

createProfile();
