import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ihivunmndpsysxdtedti.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXZ1bm1uZHBzeXN4ZHRlZHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc3ODQ5OSwiZXhwIjoyMDg1MzU0NDk5fQ.GmQ54TAgw9gvqKdIzTDAmCpMPWsdF-GpqoMrdc-lRh0';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixUserTable() {
  console.log('🔍 Проверка таблицы users...\n');

  console.log('📝 ВАЖНО: Выполните этот SQL в Supabase Dashboard > SQL Editor:\n');
  console.log('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;\n');
  
  // 1. Проверить пользователя Женя
  console.log('1️⃣ Проверка пользователя Женя...');
  const userId = '762eb16b-154c-4845-b66b-e2d820170829';
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (userError) {
    console.error('❌ Ошибка при проверке пользователя:', userError);
  } else if (!user) {
    console.log('⚠️ Пользователь не найден, создаем...');
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: 'Женя',
        initials: 'Ж',
        avatar_color: 'emerald'
      });
    
    if (insertError) {
      console.error('❌ Ошибка создания:', insertError);
    } else {
      console.log('✅ Пользователь создан!');
    }
  } else {
    console.log('✅ Пользователь найден:', user);
  }

  // 2. Проверить пространство
  console.log('\n2️⃣ Проверка пространства...');
  const { data: spaces, error: spacesError } = await supabase
    .from('spaces')
    .select('*')
    .eq('owner_id', userId);

  if (spacesError) {
    console.error('❌ Ошибка при проверке пространств:', spacesError);
  } else if (!spaces || spaces.length === 0) {
    console.log('⚠️ Пространство не найдено, создаем...');
    
    const { error: spaceError } = await supabase
      .from('spaces')
      .insert({
        title: 'Мое пространство',
        icon: '🏠',
        type: 'personal',
        owner_id: userId
      });
    
    if (spaceError) {
      console.error('❌ Ошибка создания пространства:', spaceError);
    } else {
      console.log('✅ Пространство создано!');
    }
  } else {
    console.log('✅ Найдено пространств:', spaces.length);
  }

  // 3. Тест запроса как в приложении
  console.log('\n3️⃣ Тестирование запроса из приложения...');
  const { data: testUser, error: testError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (testError) {
    console.error('❌ Ошибка тестового запроса:', testError);
    console.log('\n🔧 РЕШЕНИЕ:');
    console.log('1. Откройте Supabase Dashboard');
    console.log('2. Перейдите в SQL Editor');
    console.log('3. Выполните: ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
  } else {
    console.log('✅ Тестовый запрос успешен!');
    console.log('Данные:', testUser);
  }

  console.log('\n✨ Готово! Попробуйте войти в приложение.');
}

fixUserTable().catch(console.error);
