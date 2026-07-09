-- site_config: singleton row controlling which storefront channel is open.
-- When both display_flash and display_instock are true, Flash takes priority
-- (nav button + home redirect both point to /flash). When both are false,
-- the shopping entry point is hidden entirely (nav button disappears, home
-- redirects to /comment-ca-marche instead).

CREATE TABLE IF NOT EXISTS site_config (
  id              integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  display_flash   boolean NOT NULL DEFAULT true,
  display_instock boolean NOT NULL DEFAULT false
);

INSERT INTO site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS: anon can read (Nav + home redirect need it on every request),
-- only service_role (admin client) can write.
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select" ON site_config
  FOR SELECT TO anon
  USING (true);

GRANT SELECT ON site_config TO anon;

-- customers.has_complete_order: re-added to power the "New" badge in
-- admin/clients — true once the customer has at least one order marked
-- 'complete'. Kept in sync by updateOrderStatusAction (commandes/actions.ts)
-- whenever an order transitions to 'complete'.
--
-- (Previously dropped in 06_stock_reservation.sql — it used to also gate
-- pay-on-pickup eligibility, which is no longer a thing. This re-add is
-- purely for the "New" badge and never touches checkout logic.)

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS has_complete_order boolean NOT NULL DEFAULT false;

-- Backfill from existing order history so returning customers aren't
-- incorrectly shown as "New" the moment this column reappears.
UPDATE customers c
SET has_complete_order = true
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_email = c.email AND o.status = 'complete'
);

-- create_order_with_stock previously decided whether an item was capped by
-- reading the product's *current* stock_quantity (> 0 = capped). That broke
-- for flash/preorder products carrying a nonzero stock_quantity left over from
-- before they became flash-only (e.g. Mangue Irwin: visible_flash = true,
-- visible_instock = false, stock_quantity = 6) — they'd be wrongly capped and
-- decremented as if sold through the instock channel.
--
-- app/api/checkout/route.ts now decides "capped" from the channel the order
-- actually checked out through (instock = capped, flash = never capped) and
-- writes that decision into each item snapshot's "capped" field before calling
-- this function. Trust that field instead of re-deriving it here.

-- p_partial_allowed: customer's choice at checkout, for flash/preorder orders
-- only, on whether to keep a partially-fulfilled basket (true) or cancel and
-- refund in full if anything is out of stock at the market (false). Null for
-- instock orders, which are never partial. See app/checkout/page.tsx.

CREATE OR REPLACE FUNCTION create_order_with_stock(
  p_items            jsonb,
  p_subtotal         integer,
  p_status           text,
  p_payment_method   text,
  p_pickup_slot_id   uuid,
  p_customer_prenom  text,
  p_customer_nom     text,
  p_customer_email   text,
  p_customer_phone   text,
  p_line_username    text,
  p_note             text,
  p_partial_allowed  boolean
) RETURNS orders
  LANGUAGE plpgsql
  AS $$
DECLARE
  v_item       jsonb;
  v_product_id uuid;
  v_qty        integer;
  v_capped     boolean;
  v_stock      integer;
  v_order      orders;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;
    v_capped := COALESCE((v_item->>'capped')::boolean, false);

    IF NOT v_capped THEN
      -- Flash/preorder item — no cap, nothing to reserve, regardless of the
      -- product's raw stock_quantity value.
      CONTINUE;
    END IF;

    SELECT stock_quantity INTO v_stock
    FROM products
    WHERE id = v_product_id
    FOR UPDATE;

    IF v_stock IS NULL THEN
      RAISE EXCEPTION 'product_not_found:%', v_product_id;
    END IF;

    IF v_stock < v_qty THEN
      RAISE EXCEPTION 'insufficient_stock:%', v_product_id;
    END IF;

    UPDATE products SET stock_quantity = stock_quantity - v_qty WHERE id = v_product_id;
  END LOOP;

  INSERT INTO orders (
    items, subtotal, status, payment_method, pickup_slot_id,
    customer_prenom, customer_nom, customer_email, customer_phone, line_username, note,
    partial_allowed
  ) VALUES (
    p_items, p_subtotal, p_status, p_payment_method, p_pickup_slot_id,
    p_customer_prenom, p_customer_nom, p_customer_email, p_customer_phone, p_line_username, p_note,
    p_partial_allowed
  )
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;
