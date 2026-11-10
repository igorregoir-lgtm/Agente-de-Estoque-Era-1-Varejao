-- Restrict RLS on skus_amostra and ajustes_pedidos to the row owner.
-- Requires "Anonymous sign-ins" enabled in Supabase Auth: the frontend signs in
-- anonymously and every row is scoped to auth.uid(). Legacy rows without an
-- owner stay readable only through the service role.

DROP POLICY IF EXISTS "Allow public insert/select to ajustes_pedidos" ON ajustes_pedidos;
DROP POLICY IF EXISTS "Allow public select/insert to skus_amostra" ON skus_amostra;
DROP POLICY IF EXISTS "Allow public select/insert/update/delete to skus_amostra" ON skus_amostra;

-- skus_amostra
ALTER TABLE skus_amostra
    ADD COLUMN IF NOT EXISTS owner_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE skus_amostra DROP CONSTRAINT IF EXISTS skus_amostra_pkey;
ALTER TABLE skus_amostra
    ADD CONSTRAINT skus_amostra_owner_sku_key UNIQUE (owner_id, sku);

ALTER TABLE skus_amostra ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON skus_amostra FROM anon;
REVOKE ALL ON skus_amostra FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON skus_amostra TO authenticated;

CREATE POLICY "Owner can select skus_amostra" ON skus_amostra
    FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can insert skus_amostra" ON skus_amostra
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update skus_amostra" ON skus_amostra
    FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can delete skus_amostra" ON skus_amostra
    FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ajustes_pedidos (append-only audit trail of buyer approvals)
ALTER TABLE ajustes_pedidos
    ADD COLUMN IF NOT EXISTS owner_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ajustes_pedidos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ajustes_pedidos FROM anon;
REVOKE ALL ON ajustes_pedidos FROM authenticated;
GRANT SELECT, INSERT ON ajustes_pedidos TO authenticated;

CREATE POLICY "Owner can select ajustes_pedidos" ON ajustes_pedidos
    FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can insert ajustes_pedidos" ON ajustes_pedidos
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
