-- create_order_with_stock: atomically reserves stock and inserts the order in one
-- transaction, closing the race window between checkout's stock check and the
-- order insert (two concurrent checkouts could otherwise both pass the check and
-- both succeed on the last unit).
--
-- Preorder items (stock_quantity = 0) are never capped, so they're skipped —
-- carts never mix preorder and in-stock items (enforced in app/api/checkout/route.ts).
-- Row lock via SELECT ... FOR UPDATE serializes concurrent reservations per product.

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
  p_note             text
) RETURNS orders
  LANGUAGE plpgsql
  AS $$
DECLARE
  v_item       jsonb;
  v_product_id uuid;
  v_qty        integer;
  v_stock      integer;
  v_order      orders;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;

    SELECT stock_quantity INTO v_stock
    FROM products
    WHERE id = v_product_id
    FOR UPDATE;

    IF v_stock IS NULL THEN
      RAISE EXCEPTION 'product_not_found:%', v_product_id;
    END IF;

    IF v_stock > 0 THEN
      IF v_stock < v_qty THEN
        RAISE EXCEPTION 'insufficient_stock:%', v_product_id;
      END IF;
      UPDATE products SET stock_quantity = stock_quantity - v_qty WHERE id = v_product_id;
    END IF;
    -- v_stock = 0 => preorder item, no cap, nothing to reserve
  END LOOP;

  INSERT INTO orders (
    items, subtotal, status, payment_method, pickup_slot_id,
    customer_prenom, customer_nom, customer_email, customer_phone, line_username, note
  ) VALUES (
    p_items, p_subtotal, p_status, p_payment_method, p_pickup_slot_id,
    p_customer_prenom, p_customer_nom, p_customer_email, p_customer_phone, p_line_username, p_note
  )
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

-- Runs as the calling role (service_role from the admin client, which bypasses RLS).
GRANT EXECUTE ON FUNCTION create_order_with_stock TO service_role;

------------------------

-- restore_stock_for_order: releases previously-reserved stock back to products.
-- Called when a Stripe checkout session expires/fails before payment, or when
-- an admin cancels an order.
--
-- Relies on each item snapshot carrying a "capped" boolean (set at order time,
-- see app/api/checkout/route.ts) recording whether that qty was actually reserved
-- from stock. Checking the product's *current* stock_quantity instead would be wrong:
-- a fully-reserved in-stock item sits at 0, which is indistinguishable from an
-- unlimited preorder item (also 0) — restoring based on current state would silently
-- skip exactly the sold-out items that most need restoring.

CREATE OR REPLACE FUNCTION restore_stock_for_order(p_order_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  AS $$
DECLARE
  v_item       jsonb;
  v_product_id uuid;
  v_qty        integer;
BEGIN
  FOR v_item IN
    SELECT jsonb_array_elements(items) FROM orders WHERE id = p_order_id
  LOOP
    IF (v_item->>'capped')::boolean IS NOT TRUE THEN
      CONTINUE;
    END IF;

    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;

    UPDATE products
    SET stock_quantity = stock_quantity + v_qty
    WHERE id = v_product_id;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION restore_stock_for_order TO service_role;

-- Broadcasts stock_quantity changes to a public Realtime channel so the storefront
-- can show live "remaining stock" counts without polling.
--
-- Deliberately NOT using Postgres Changes (direct table subscription): that streams
-- the full row to subscribers, which would leak supplier/cost — the same columns
-- products' RLS setup already keeps hidden from anon behind the instock_products view
-- (see 02_products.sql). Broadcast lets the trigger hand-pick exactly which columns
-- go out (id, stock_quantity only).
--
-- private = false: a public broadcast, no Realtime Authorization (RLS on
-- realtime.messages) needed to subscribe — fine here since stock_quantity is already
-- public information via instock_products.

CREATE OR REPLACE FUNCTION broadcast_stock_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
BEGIN
  IF NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity THEN
    PERFORM realtime.send(
      jsonb_build_object('id', NEW.id, 'stock_quantity', NEW.stock_quantity),
      'stock_update',
      'products:stock',
      false
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_broadcast_stock
  AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION broadcast_stock_change();
