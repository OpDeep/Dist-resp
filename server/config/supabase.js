import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env file from the correct directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export function initializeSupabase() {
  console.log("URL:", process.env.SUPABASE_URL);
  console.log("KEY:", process.env.SUPABASE_ANON_KEY);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be set');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
