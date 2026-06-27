-- products table
-- unit_price and cost are stored in euro cents (e.g. 890 = €8.90)
-- stock_quantity, supplier, cost are internal — never expose to clients

CREATE TABLE IF NOT EXISTS products (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr         text        NOT NULL,
  name_tw         text        NOT NULL,
  origin          text        NOT NULL,
  unit_price      integer     NOT NULL CHECK (unit_price >= 0),
  unit_label      text        NOT NULL,          -- e.g. "顆", "100g", "串"
  promo_price     integer,
  promo_until     timestamptz,
  description     text,
  image_url       text,
  available       boolean     NOT NULL DEFAULT true,
  stock_quantity  integer     NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  supplier        text,
  cost            integer     CHECK (cost >= 0), -- internal, euro cents
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
-- anon has NO direct policy on products — all public access goes through the view below.
-- authenticated / service_role still get full access by default (Supabase behaviour).
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Internal roles (authenticated, service_role) can read everything.
CREATE POLICY "authenticated_select" ON products
  FOR SELECT TO authenticated
  USING (true);

-- Client-safe view: excludes stock_quantity, supplier, cost.
-- Because anon has no RLS policy on the base table, they cannot bypass this view.
-- PostgreSQL checks table-level permissions against the view owner (postgres/admin),
-- not the querying role, so anon can query the view without touching the table directly.
CREATE VIEW public_products AS
  SELECT
    id,
    name_fr,
    name_tw,
    origin,
    unit_price,
    unit_label,
    description,
    image_url,
    available,
    created_at
  FROM products
  WHERE available = true;

-- Grant SELECT on the view (not the table) to anon.
GRANT SELECT ON public_products TO anon;

------------------------

-- instock_products view
-- Exposes stock_quantity so the client can display availability and enforce cart limits.
-- preorder (public_products) does NOT expose stock_quantity.

CREATE VIEW instock_products AS
  SELECT
    id,
    name_fr,
    name_tw,
    origin,
    unit_price,
    unit_label,
    description,
    image_url,
    available,
    stock_quantity,
    created_at
  FROM products
  WHERE available = true
    AND stock_quantity > 0;

GRANT SELECT ON instock_products TO anon;
