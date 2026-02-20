import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zdbthposgfxphsglkzxe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnRocG9zZ2Z4cGhzZ2xrenhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NTM1MjEsImV4cCI6MjA4NzEyOTUyMX0.LjA5jss1NKHS45nBrl2LHcaEjrWVxA1Q8CkYuSObvk0'

export const supabase = createClient(supabaseUrl, supabaseKey)
export async function sendWhatsApp(phone, message) {
  const apiKey = '' // on ajoutera la clé plus tard
  if (!apiKey) return // skip si pas de clé
  const formatted = '213' + phone.replace(/^0/, '')
  const url = `https://api.callmebot.com/whatsapp.php?phone=${formatted}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
  try { await fetch(url) } catch { console.log('WhatsApp non envoyé') }
}