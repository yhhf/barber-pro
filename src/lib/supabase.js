import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zdbthposgfxphsglkzxe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnRocG9zZ2Z4cGhzZ2xrenhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NTM1MjEsImV4cCI6MjA4NzEyOTUyMX0.LjA5jss1NKHS45nBrl2LHcaEjrWVxA1Q8CkYuSObvk0'

export const supabase = createClient(supabaseUrl, supabaseKey)