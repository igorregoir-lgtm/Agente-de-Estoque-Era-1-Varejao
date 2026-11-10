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
-- Rows are scoped to the Supabase auth user (anonymous sign-in) that created them.
CREATE TABLE IF NOT EXISTS ajustes_pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
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
    owner_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
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
    "desvioPrazoEntrega" NUMERIC(5,2), -- Lead time standard deviation in days (e.g. 1.50)
    CONSTRAINT skus_amostra_owner_sku_key UNIQUE (owner_id, sku)
);

-- Row Level Security: leads are insert-only for visitors; SKUs and order
-- adjustments are visible/editable only by their owner (auth.uid()).
-- Requires "Anonymous sign-ins" enabled in Supabase Auth settings.
ALTER TABLE leads_contato ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajustes_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus_amostra ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON skus_amostra FROM anon;
REVOKE ALL ON skus_amostra FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON skus_amostra TO authenticated;
REVOKE ALL ON ajustes_pedidos FROM anon;
REVOKE ALL ON ajustes_pedidos FROM authenticated;
GRANT SELECT, INSERT ON ajustes_pedidos TO authenticated;

CREATE POLICY "Allow public insert to leads_contato" ON leads_contato FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner can select ajustes_pedidos" ON ajustes_pedidos
    FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can insert ajustes_pedidos" ON ajustes_pedidos
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can select skus_amostra" ON skus_amostra
    FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can insert skus_amostra" ON skus_amostra
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update skus_amostra" ON skus_amostra
    FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can delete skus_amostra" ON skus_amostra
    FOR DELETE TO authenticated USING (owner_id = auth.uid());
