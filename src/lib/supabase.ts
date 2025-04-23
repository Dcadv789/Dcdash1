import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xcatfgimofnrldbnezra.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYXRmZ2ltb2ZucmxkYm5lenJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTQzMzYsImV4cCI6MjA2MDk5MDMzNn0.H8tT_mPaFfQs0Q4cLcl9ittbizt-ntWzfq2Yw7nXVeE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});