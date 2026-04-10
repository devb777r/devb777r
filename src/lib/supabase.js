import { createClient } from '@supabase/supabase-js';

// WARNING: In a real project, these values should come from environment variables.
// Use VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY inside a .env file.
const supabaseUrl = 'https://anxsdcgheckkshvzgmcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueHNkY2doZWNra3NodnpnbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjgzNDgsImV4cCI6MjA5MTQwNDM0OH0.Juzfx7Ay9Z5QMCjvkzXAq80JZkP08-jsX4CWllygQYw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
