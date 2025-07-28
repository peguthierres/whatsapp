import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://quyyshcqwmcxrqdrghqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1eXlzaGNxd21jeHJxZHJnaHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzU4NzMsImV4cCI6MjA2OTMxMTg3M30.tBgVBh_-O2iWaBfY_4tCl1uvKJlq66-JrnaU0UHe86I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
