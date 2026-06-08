-- Varejão Fase 1 — Supabase Database Schema
-- Paste this into your Supabase SQL Editor to set up the tables.

-- Table for contact leads
CREATE TABLE IF NOT EXISTS leads_contato (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for tracking manual purchase order adjustments (Human-in-the-loop)
CREATE TABLE IF NOT EXISTS ajustes_pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL,
    original_qty INTEGER NOT NULL,
    adjusted_qty INTEGER NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for raw SKU sample data
DROP TABLE IF EXISTS skus_amostra;
CREATE TABLE skus_amostra (
    sku TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    "estoqueAtual" INTEGER NOT NULL,
    saidas INTEGER[] NOT NULL,
    custo NUMERIC(10,2) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    "leadTimeDias" INTEGER NOT NULL, -- Lead time in business days
    moq INTEGER NOT NULL, -- Minimum order quantity
    "nivelServicoAlvo" NUMERIC(5,2), -- Target service level in % (e.g. 95.00)
    "custoArmazenagemPercentual" NUMERIC(5,2), -- Annual carrying cost in % (e.g. 25.00)
    "desvioPrazoEntrega" NUMERIC(5,2) -- Lead time standard deviation in days (e.g. 1.50)
);

-- Enable Row Level Security (RLS) - Disabled for initial demo simplicity
-- but can be configured later. For now, allow public access.
ALTER TABLE leads_contato ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajustes_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus_amostra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to leads_contato" ON leads_contato FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert/select to ajustes_pedidos" ON ajustes_pedidos FOR ALL USING (true);
CREATE POLICY "Allow public select/insert to skus_amostra" ON skus_amostra FOR ALL USING (true);
