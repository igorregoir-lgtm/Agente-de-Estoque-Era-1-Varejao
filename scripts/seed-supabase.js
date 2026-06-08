// Varejão Era 1 — Database Seeder
// Run this script using `node scripts/seed-supabase.js` to seed sample SKUs into Supabase.

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual loading of .env.local variables
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split(/\r?\n/);
      for (const line of lines) {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
          if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
          if (key === 'VITE_SUPABASE_ANON_KEY') supabaseKey = val;
        }
      }
    }
  } catch (err) {
    console.error('Error loading .env.local:', err.message);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.log('Skipping seed: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined in environment or .env.local');
  console.log('To run this locally with Supabase, create a .env.local file with:');
  console.log('VITE_SUPABASE_URL=your_supabase_project_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const skusData = [
  { sku: 'FILT-OL-001', name: 'Filtro de Óleo Universal', estoque: 45, s1: 28, s2: 32, s3: 25, s4: 30, s5: 35, s6: 28, s7: 31, s8: 29, custo: 12.00, preco: 22.00, lt: 2, moq: 24 },
  { sku: 'PAST-FR-001', name: 'Pastilha Freio Dianteira', estoque: 8, s1: 15, s2: 18, s3: 12, s4: 16, s5: 14, s6: 17, s7: 15, s8: 16, custo: 45.00, preco: 89.00, lt: 3, moq: 4 },
  { sku: 'CORR-DIS-001', name: 'Correia Dentada Kit', estoque: 2, s1: 4, s2: 3, s3: 5, s4: 4, s5: 3, s6: 4, s7: 5, s8: 3, custo: 120.00, preco: 220.00, lt: 7, moq: 2 },
  { sku: 'VELA-IG-001', name: 'Vela de Ignição (jogo)', estoque: 60, s1: 22, s2: 25, s3: 18, s4: 24, s5: 26, s6: 20, s7: 23, s8: 25, custo: 35.00, preco: 65.00, lt: 2, moq: 12 },
  { sku: 'JUNT-TM-001', name: 'Junta do Cabeçote', estoque: 0, s1: 1, s2: 0, s3: 2, s4: 1, s5: 0, s6: 1, s7: 2, s8: 1, custo: 380.00, preco: 680.00, lt: 10, moq: 1 },
  { sku: 'AMORT-F-001', name: 'Amortecedor Dianteiro (par)', estoque: 6, s1: 3, s2: 2, s3: 4, s4: 3, s5: 2, s6: 3, s7: 2, s8: 3, custo: 280.00, preco: 520.00, lt: 5, moq: 2 },
  { sku: 'FILT-AR-001', name: 'Filtro de Ar', estoque: 30, s1: 18, s2: 20, s3: 16, s4: 19, s5: 21, s6: 17, s7: 20, s8: 18, custo: 18.00, preco: 35.00, lt: 2, moq: 12 },
  { sku: 'BOMB-AG-001', name: "Bomba d'Água", estoque: 3, s1: 2, s2: 1, s3: 2, s4: 1, s5: 2, s6: 1, s7: 1, s8: 2, custo: 165.00, preco: 295.00, lt: 6, moq: 1 },
  { sku: 'BUJE-BA-001', name: 'Buje de Bandeja', estoque: 20, s1: 8, s2: 10, s3: 7, s4: 9, s5: 11, s6: 8, s7: 9, s8: 10, custo: 28.00, preco: 55.00, lt: 2, moq: 4 },
  { sku: 'SENS-OX-001', name: 'Sensor Lambda / O2', estoque: 1, s1: 2, s2: 1, s3: 3, s4: 2, s5: 1, s6: 2, s7: 2, s8: 1, custo: 185.00, preco: 340.00, lt: 8, moq: 1 },
  { sku: 'ROLA-KM-001', name: 'Rolamento de Roda', estoque: 12, s1: 5, s2: 6, s3: 4, s4: 5, s5: 7, s6: 5, s7: 6, s8: 5, custo: 95.00, preco: 175.00, lt: 4, moq: 2 },
  { sku: 'BATE-60A-001', name: 'Bateria 60Ah', estoque: 4, s1: 3, s2: 2, s3: 1, s4: 2, s5: 4, s6: 5, s7: 6, s8: 7, custo: 290.00, preco: 520.00, lt: 3, moq: 1 },
  { sku: 'FILT-CB-001', name: 'Filtro de Cabine', estoque: 22, s1: 8, s2: 7, s3: 9, s4: 8, s5: 10, s6: 7, s7: 8, s8: 9, custo: 25.00, preco: 48.00, lt: 2, moq: 6 },
  { sku: 'PAST-TR-001', name: 'Pastilha Freio Traseira', estoque: 5, s1: 9, s2: 8, s3: 10, s4: 9, s5: 8, s6: 10, s7: 9, s8: 8, custo: 38.00, preco: 72.00, lt: 3, moq: 4 },
  { sku: 'EMBL-CL-001', name: 'Kit Embreagem Completo', estoque: 1, s1: 1, s2: 0, s3: 1, s4: 1, s5: 0, s6: 1, s7: 0, s8: 1, custo: 520.00, preco: 920.00, lt: 12, moq: 1 }
];

async function seed() {
  console.log('Seeding SKUs sample data into Supabase table: skus_amostra...');
  
  // Clear existing data
  const { error: deleteError } = await supabase
    .from('skus_amostra')
    .delete()
    .neq('sku', '');

  if (deleteError) {
    console.error('Error clearing old SKUs:', deleteError);
  }

  // Insert items
  const { data, error } = await supabase
    .from('skus_amostra')
    .insert(skusData);

  if (error) {
    console.error('Error seeding data:', error.message);
  } else {
    console.log('Successfully seeded 15 SKUs into skus_amostra!');
  }
}

seed();
