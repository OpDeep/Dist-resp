import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

export function initializeSupabase() {
  const supabase = createClient(config.supabase.url, config.supabase.anonKey);
  return supabase;
}