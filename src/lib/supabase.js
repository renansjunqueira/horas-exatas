import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pnjmodknysligtixmpck.supabase.co';
const supabaseKey = 'sb_publishable_dEapKqCFmdjpF40VmIJB8w_Z0JwKdvX';

export const supabase = createClient(supabaseUrl, supabaseKey);
