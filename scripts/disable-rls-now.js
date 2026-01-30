/**
 * Экстренное отключение RLS для users
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
  console.error('❌ Не удалось загрузить .env.local');
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения');
  console.error('\n📋 Выполните вручную в Supabase SQL Editor:');
  console.error('https://supabase.com/dashboard/project/ihivunmndpsysxdtedti/sql/new\n');
  console.error('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  console.log('🚨 ЭКСТРЕННОЕ ОТКЛЮЧЕНИЕ RLS для users...\n');

  try {
    // Попытка через прямой SQL запрос
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;'
    });

    if (error) {
      throw error;
    }

    console.log('✅ RLS отключен для users!');
    console.log('\n🔄 Перезагрузите приложение (Ctrl+Shift+R)');
    console.log('\n⚠️  Это временное решение для разработки!');
    
  } catch (error) {
    console.log('⚠️  Не удалось выполнить автоматически\n');
    console.log('📋 Выполните вручную в Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/ihivunmndpsysxdtedti/sql/new\n');
    console.log('Скопируйте и выполните:');
    console.log('---');
    console.log('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
    console.log('SELECT \'✅ RLS отключен!\' as status;');
    console.log('---');
  }
}

disableRLS();
