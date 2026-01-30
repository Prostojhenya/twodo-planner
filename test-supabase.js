// Quick test to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ihivunmndpsysxdtedti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXZ1bm1uZHBzeXN4ZHRlZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3Nzg0OTksImV4cCI6MjA4NTM1NDQ5OX0.yyPVXLtFQnDl1DmcnUREcXIFrLVP-4VSGGO2qzzfAdo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Test 1: Check if we can query
  const { data, error } = await supabase
    .from('spaces')
    .select('count');
  
  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  You need to run the schema.sql in Supabase SQL Editor!');
    console.log('   Go to: https://supabase.com/dashboard/project/ihivunmndpsysxdtedti/sql');
  } else {
    console.log('✅ Connection successful!');
    console.log('   Tables are ready.');
  }
}

testConnection();
