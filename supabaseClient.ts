import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseCredentials'; // Import credentials from the new config file

// Check if the user has replaced the placeholder values
// FIX: Used type assertion to prevent TypeScript from throwing an error on string literal comparison after credentials have been updated.
if (!SUPABASE_URL || (SUPABASE_URL as string) === 'TUTAJ_WKLEJ_SWOJ_PROJECT_URL') {
  throw new Error("Błąd konfiguracji: Proszę ustawić SUPABASE_URL w pliku supabaseCredentials.ts");
}

// FIX: Used type assertion to prevent TypeScript from throwing an error on string literal comparison after credentials have been updated.
if (!SUPABASE_ANON_KEY || (SUPABASE_ANON_KEY as string) === 'TUTAJ_WKLEJ_SWOJ_ANON_PUBLIC_KEY') {
  throw new Error("Błąd konfiguracji: Proszę ustawić SUPABASE_ANON_KEY w pliku supabaseCredentials.ts");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);