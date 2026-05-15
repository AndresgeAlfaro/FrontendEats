-- =============================================================================
-- Script completo para Supabase SQL Editor (dev): tablas + combos + RLS.
-- =============================================================================

CREATE TABLE IF NOT EXISTS restaurantes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  cedula_juridica TEXT NOT NULL UNIQUE,
  direccion TEXT,
  tipo_comida TEXT
);

CREATE TABLE IF NOT EXISTS clientes (
  cedula TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT,
  tarjeta TEXT,
  celular TEXT,
  correo TEXT,
  suspendido BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS repartidores (
  id SERIAL PRIMARY KEY,
  id_restaurante INTEGER REFERENCES restaurantes (id),
  cedula TEXT UNIQUE,
  nombre TEXT,
  correo TEXT,
  direccion TEXT,
  celular TEXT,
  tarjeta TEXT,
  amonestaciones INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cedula_cliente TEXT REFERENCES clientes (cedula),
  id_restaurante INTEGER REFERENCES restaurantes (id),
  nombre_restaurante TEXT,
  distancia_km DOUBLE PRECISION,
  es_feriado BOOLEAN DEFAULT FALSE,
  mensaje TEXT,
  observacion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  estado TEXT NOT NULL DEFAULT 'EN_PREPARACION',
  id_repartidor INTEGER REFERENCES repartidores (id)
);

CREATE TABLE IF NOT EXISTS items_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos (id) ON DELETE CASCADE,
  numero_combo INTEGER,
  descripcion TEXT,
  precio_unitario DOUBLE PRECISION,
  cantidad INTEGER
);

CREATE TABLE IF NOT EXISTS combos (
  id SERIAL PRIMARY KEY,
  id_restaurante INTEGER NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  numero_combo INTEGER NOT NULL CHECK (numero_combo BETWEEN 1 AND 9),
  descripcion TEXT NOT NULL,
  precio DOUBLE PRECISION NOT NULL,
  UNIQUE (id_restaurante, numero_combo)
);

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'EN_PREPARACION';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS id_repartidor INTEGER REFERENCES repartidores (id);

ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE repartidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all ON restaurantes;
DROP POLICY IF EXISTS allow_all ON clientes;
DROP POLICY IF EXISTS allow_all ON repartidores;
DROP POLICY IF EXISTS allow_all ON pedidos;
DROP POLICY IF EXISTS allow_all ON items_pedido;
DROP POLICY IF EXISTS allow_all ON combos;

DROP POLICY IF EXISTS allow_all_restaurantes ON restaurantes;
CREATE POLICY allow_all_restaurantes ON restaurantes FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_clientes ON clientes;
CREATE POLICY allow_all_clientes ON clientes FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_repartidores ON repartidores;
CREATE POLICY allow_all_repartidores ON repartidores FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_pedidos ON pedidos;
CREATE POLICY allow_all_pedidos ON pedidos FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_items_pedido ON items_pedido;
CREATE POLICY allow_all_items_pedido ON items_pedido FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_combos ON combos;
CREATE POLICY allow_all_combos ON combos FOR ALL TO public USING (true) WITH CHECK (true);
