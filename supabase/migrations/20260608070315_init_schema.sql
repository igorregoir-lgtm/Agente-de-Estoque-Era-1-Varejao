-- Varejão Era 1 — Supabase Database Schema

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
CREATE TABLE IF NOT EXISTS skus_amostra (
    sku TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    estoque INTEGER NOT NULL,
    s1 INTEGER NOT NULL,
    s2 INTEGER NOT NULL,
    s3 INTEGER NOT NULL,
    s4 INTEGER NOT NULL,
    s5 INTEGER NOT NULL,
    s6 INTEGER NOT NULL,
    s7 INTEGER NOT NULL,
    s8 INTEGER NOT NULL,
    custo NUMERIC(10,2) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    lt INTEGER NOT NULL, -- Lead time in business days
    moq INTEGER NOT NULL -- Minimum order quantity
);

-- Enable Row Level Security (RLS) - Disabled for initial demo simplicity
-- but can be configured later. For now, allow public access.
ALTER TABLE leads_contato ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajustes_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus_amostra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to leads_contato" ON leads_contato FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert/select to ajustes_pedidos" ON ajustes_pedidos FOR ALL USING (true);
CREATE POLICY "Allow public select/insert to skus_amostra" ON skus_amostra FOR ALL USING (true);
