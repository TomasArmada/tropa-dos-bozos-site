import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Faltam as variáveis VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. Define-as no ficheiro .env na raiz do projeto.'
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const FAKE_EMAIL_DOMAIN = 'tropadosbozos.local'

export function usernameToEmail(username) {
    return `${username.trim().toLowerCase()}@${FAKE_EMAIL_DOMAIN}`
}