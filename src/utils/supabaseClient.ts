// Varejão Era 1 — Supabase Client Initializer (TypeScript)
// Falls back to mock client if credentials are not provided (Option A).

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseUrl.trim() !== ''
);

let supabaseInstance: any = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully.');
  } catch (err: any) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
}

// Mock implementation when Supabase is not configured
const mockSupabase = {
  from: (table: string) => {
    console.log(`[Mock Supabase] Operating on table: "${table}"`);
    return {
      select: () => {
        let localData = [];
        try {
          if (table === 'skus_amostra') {
            localData = JSON.parse(localStorage.getItem('skus_amostra') || '[]');
          } else if (table === 'ajustes_pedidos') {
            localData = JSON.parse(localStorage.getItem('ajustes_pedidos') || '[]');
          } else if (table === 'leads_contato') {
            localData = JSON.parse(localStorage.getItem('leads_contato') || '[]');
          }
        } catch (e) {
          console.error('Error loading mock table data:', e);
        }
        
        return {
          data: localData,
          error: null,
          then: (cb: any) => cb({ data: localData, error: null })
        };
      },
      insert: (payload: any) => {
        console.log(`[Mock Supabase] Inserting into "${table}":`, payload);
        try {
          const key = table;
          const current = JSON.parse(localStorage.getItem(key) || '[]');
          const toAdd = Array.isArray(payload) ? payload : [payload];
          const updated = [...current, ...toAdd.map(item => ({ id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...item }))];
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error('Error inserting mock table data:', e);
        }
        return {
          data: payload,
          error: null,
          then: (cb: any) => cb({ data: payload, error: null })
        };
      },
      delete: () => {
        console.log(`[Mock Supabase] Deleting all from "${table}"`);
        try {
          localStorage.removeItem(table);
        } catch (e) {
          console.error('Error deleting mock table data:', e);
        }
        return {
          error: null,
          neq: () => ({ error: null, then: (cb: any) => cb({ error: null }) }),
          then: (cb: any) => cb({ error: null })
        };
      }
    };
  }
};

export const supabase = isSupabaseConfigured ? supabaseInstance : mockSupabase;
export const isRealSupabase = isSupabaseConfigured;
export { supabaseUrl };
