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
  { sku: "JUNT-TM", nome: "Junta Homocinética Vetor VT5031", categoria: "Transmissão", estoqueAtual: 2, saidas: [58, 52, 60], custo: 180.00, preco: 310.00, leadTimeDias: 10, moq: 10 },
  { sku: "PAST-FR", nome: "Pastilha Freio Diant. Cobreq N-2032", categoria: "Freios", estoqueAtual: 5, saidas: [95, 102, 98], custo: 65.00, preco: 110.00, leadTimeDias: 5, moq: 20 },
  { sku: "SENS-OX", nome: "Sensor de Oxigênio Bosch Sonda Lambda", categoria: "Injeção", estoqueAtual: 1, saidas: [18, 22, 20], custo: 145.00, preco: 290.00, leadTimeDias: 7, moq: 5 },
  { sku: "AMOR-DI", nome: "Amortecedor Diant. Cofap GP32282", categoria: "Suspensão", estoqueAtual: 85, saidas: [35, 40, 36], custo: 210.00, preco: 390.00, leadTimeDias: 12, moq: 4 },
  { sku: "OL-MO", nome: "Óleo de Motor Castrol Edge 5W30 Sintético", categoria: "Lubrificantes", estoqueAtual: 120, saidas: [275, 290, 285], custo: 32.00, preco: 58.00, leadTimeDias: 4, moq: 48 },
  { sku: "FIL-AR", nome: "Filtro de Ar Tecfil ARL1032", categoria: "Filtros", estoqueAtual: 45, saidas: [72, 80, 75], custo: 18.00, preco: 35.00, leadTimeDias: 5, moq: 20 },
  { sku: "BOM-AG", nome: "Bomba d'Água Urba UB0621", categoria: "Arrefecimento", estoqueAtual: 6, saidas: [40, 45, 41], custo: 115.00, preco: 210.00, leadTimeDias: 7, moq: 12 },
  { sku: "DISC-FR", nome: "Disco de Freio Diant. Fremax BD4412", categoria: "Freios", estoqueAtual: 8, saidas: [58, 64, 60], custo: 90.00, preco: 175.00, leadTimeDias: 6, moq: 10 },
  { sku: "VEL-IG", nome: "Jogo de Vela de Ignição NGK BKR7E", categoria: "Ignição", estoqueAtual: 50, saidas: [45, 52, 49], custo: 45.00, preco: 85.00, leadTimeDias: 5, moq: 10 },
  { sku: "BOB-IG", nome: "Bobina de Ignição Magneti Marelli BI0022", categoria: "Ignição", estoqueAtual: 4, saidas: [16, 20, 18], custo: 135.00, preco: 250.00, leadTimeDias: 8, moq: 5 },
  { sku: "COR-DE", nome: "Correia Dentada Gates 40859x19XS", categoria: "Transmissão", estoqueAtual: 22, saidas: [30, 42, 33], custo: 55.00, preco: 105.00, leadTimeDias: 9, moq: 15 },
  { sku: "FIL-OL", nome: "Filtro de Óleo Tecfil PSL74", categoria: "Filtros", estoqueAtual: 180, saidas: [245, 260, 250], custo: 12.00, preco: 24.00, leadTimeDias: 5, moq: 50 },
  { sku: "ROL-TR", nome: "Rolamento de Roda Traseira SKF BAH-0062", categoria: "Rolamentos", estoqueAtual: 35, saidas: [10, 12, 11], custo: 80.00, preco: 160.00, leadTimeDias: 10, moq: 5 },
  { sku: "BIE-DI", nome: "Bieleta Dianteira Cofap BTC01103", categoria: "Suspensão", estoqueAtual: 3, saidas: [46, 52, 48], custo: 35.00, preco: 68.00, leadTimeDias: 6, moq: 15 },
  { sku: "FIL-CO", nome: "Filtro de Combustível Fram G5857", categoria: "Filtros", estoqueAtual: 200, saidas: [170, 185, 180], custo: 15.00, preco: 30.00, leadTimeDias: 4, moq: 50 }
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
