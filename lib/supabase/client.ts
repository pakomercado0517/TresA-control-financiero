/**
 * Cliente de Supabase para el navegador
 * Usar este cliente en componentes del cliente
 * Usa @supabase/ssr para sincronización correcta con el middleware
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file'
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

