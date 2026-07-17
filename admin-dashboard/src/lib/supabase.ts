import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nbbkbsdikayrdocvpmea.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iYmtic2Rpa2F5cmRvY3ZwbWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDMwMjEsImV4cCI6MjA5ODgxOTAyMX0.t5EV8_mahMxP2VDYoFmv1sgW3RYjxeUlQkqbN9EHd2U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
