-- Update skus_amostra table schema for monthly demand & camelCase columns
DROP TABLE IF EXISTS skus_amostra CASCADE;

CREATE TABLE skus_amostra (
    sku TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    "estoqueAtual" INTEGER NOT NULL,
    saidas INTEGER[] NOT NULL,
    custo NUMERIC(10,2) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    "leadTimeDias" INTEGER NOT NULL,
    moq INTEGER NOT NULL
);

ALTER TABLE skus_amostra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select/insert/update/delete to skus_amostra" ON skus_amostra FOR ALL USING (true);
