import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ihivunmndpsysxdtedti.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXZ1bm1uZHBzeXN4ZHRlZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3Nzg0OTksImV4cCI6MjA4NTM1NDQ5OX0.yyPVXLtFQnDl1DmcnUREcXIFrLVP-4VSGGO2qzzfAdo';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
