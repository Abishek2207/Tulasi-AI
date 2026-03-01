import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eutfcuksxystonjbniud.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dGZjdWtzeHlzdG9uamJuaXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxOTgzMjgsImV4cCI6MjA4Nzc3NDMyOH0.vQ89ZjAEgPmLEDZt0eIR9dvgtG7cLh3yoACp_WG7itc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
