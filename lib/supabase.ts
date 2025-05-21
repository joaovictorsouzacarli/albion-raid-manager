import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frmrzplklolykqxthxrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybXJ6cGxrbG9seWtxeHRoeHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDgzMDYsImV4cCI6MjA2MzQyNDMwNn0.kwUtBH6TK__t84KKMvFCqOWdKhbw_Kniv1XAbp1sjtk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);