/**
 * Скрипт для исправления RLS policies через Supabase API
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения');
  console.error('Нужны: VITE_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPolicies() {
  console.log('🔧 Исправление RLS policies...\n');

  const sql = `
-- Исправление policy для users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
`;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.log('⚠️  Не удалось выполнить через API');
      console.log('Выполните вручную в Supabase SQL Editor:\n');
      console.log('https://supabase.com/dashboard/project/ihivunmndpsysxdtedti/sql/new\n');
      console.log('Скопируйте и выполните:');
      console.log('---');
      console.log(sql);
      console.log('---');
    } else {
      console.log('✅ RLS policies исправлены!');
      console.log('\n🎉 Теперь перезагрузите приложение (Ctrl+Shift+R)');
    }
  } catch (error) {
    console.log('⚠️  Выполните SQL вручную в Supabase Dashboard:\n');
    console.log('1. Откройте: https://supabase.com/dashboard/project/ihivunmndpsysxdtedti/sql/new');
    console.log('2. Скопируйте и выполните:\n');
    console.log(sql);
  }
}

fixPolicies();
