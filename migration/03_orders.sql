-- orders schema
-- order_number:    human-readable sequential ID (ORD-26-001, ORD-27-152, …)
-- tracking_token:  16-byte hex token for public order lookup without auth
-- items:           JSONB array copied at order time — [{product_id, quantity}, ...]
-- subtotal:        items 加總（歐分）；discount_amount 折扣（歐分）；total_amount = subtotal - discount_amount（自動計算欄位）
-- customer_*:      denormalized at order time for invoice / receipt purposes

-- ── Pickup slots ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pickup_slots (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_at     timestamptz NOT NULL,          -- 面交的確切時間，例如 2025-06-28 15:00 Europe/Paris
  label       text        NOT NULL,          -- e.g. "Sam 28 juin 15h00 — Paris 11e"
  location    text,
  active      boolean     NOT NULL DEFAULT true,    -- false = 時段已關閉，客人無法在結帳時選取
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pickup_slots ENABLE ROW LEVEL SECURITY;

-- Anon can read active slots (date picker at checkout)
CREATE POLICY "anon_select_active" ON pickup_slots
  FOR SELECT TO anon
  USING (active = true);

CREATE POLICY "authenticated_all" ON pickup_slots
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── Orders ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  order_seq        integer     GENERATED ALWAYS AS IDENTITY,
  order_number     text        NOT NULL UNIQUE DEFAULT '',  -- set by trigger below

  -- Public tracking token: share with customer so they can check status without login
  tracking_token   text        NOT NULL UNIQUE
                               DEFAULT encode(gen_random_bytes(16), 'hex'),

  -- Line items snapshot — [{product_id, name_fr, name_tw, unit_label, unit_price, promo_price, qty, line_total}, ...]
  items            jsonb       NOT NULL DEFAULT '[]'
                               CHECK (jsonb_typeof(items) = 'array'),

  subtotal         integer     NOT NULL CHECK (subtotal >= 0),                   -- items 加總，歐分
  discount_amount  integer     NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),  -- 折扣金額，歐分
  discount_reason  text        CHECK (discount_amount = 0 OR discount_reason IS NOT NULL), -- 有折扣時必填
  total_amount     integer     GENERATED ALWAYS AS (subtotal - discount_amount) STORED,

  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'locked', 'confirmed', 'done', 'canceled')),

  -- Optional admin flag — set manually when something needs attention
  flag             text        CHECK (flag IN ('shortage', 'contact_needed', 'postponed', 'others')),

  pickup_slot_id   uuid        REFERENCES pickup_slots(id) ON DELETE SET NULL,

  -- Nullable FK: 訪客結帳後補填，或登入時直接關聯
  customer_id      uuid        REFERENCES customers(id) ON DELETE SET NULL,

  -- Denormalized at order time for invoices — do not update after creation
  customer_name    text        NOT NULL,
  customer_email   text        NOT NULL,
  customer_phone   text,
  customer_address text,

  note             text,
  stripe_session_id text,
  reviewd_at       timestamptz,
  rejection_reason text,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX orders_status_idx        ON orders (status);
CREATE INDEX orders_customer_id_idx   ON orders (customer_id);
CREATE INDEX orders_pickup_slot_idx   ON orders (pickup_slot_id);
CREATE INDEX orders_tracking_token_idx ON orders (tracking_token);

-- Generate order_number in a trigger (GENERATED ALWAYS AS rejected: TO_CHAR(timestamptz)
-- is STABLE not IMMUTABLE). Identity value is available in NEW during BEFORE INSERT.
CREATE OR REPLACE FUNCTION set_order_number()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.order_number := 'ORD-'
    || TO_CHAR(now() AT TIME ZONE 'Europe/Paris', 'YY')
    || '-'
    || LPAD(NEW.order_seq::text, 3, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- auto-update updated_at (set_updated_at() already created in 002_products.sql)
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anon: guest checkout (INSERT only; token-based reads go through a server action
-- with service_role, which bypasses RLS — avoids exposing all orders to anon)
CREATE POLICY "anon_insert" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated users: read and insert their own orders
-- customer_id → customers.auth_user_id でjoinして本人確認
CREATE POLICY "owner_select" ON orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = orders.customer_id
        AND customers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "owner_insert" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    customer_id IS NULL OR
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = orders.customer_id
        AND customers.auth_user_id = auth.uid()
    )
  );
