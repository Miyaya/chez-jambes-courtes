-- order_number is now assigned only when an order reaches 'complete' — not at
-- creation. Numbers are consumed in completion order, not creation order: a
-- canceled order never gets a number, so an order created after it that later
-- completes takes the number the canceled one would have used.

ALTER TABLE orders ALTER COLUMN order_number DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT NULL;

DROP TRIGGER IF EXISTS orders_set_order_number ON orders;
DROP FUNCTION IF EXISTS set_order_number();

-- Dedicated sequence: order_seq (identity column on orders) still increments at
-- insert time and no longer drives the number, so a separate counter is needed
-- that only advances when a number is actually handed out.
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION set_order_number_on_complete()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'complete' AND OLD.status IS DISTINCT FROM 'complete' AND NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-'
      || TO_CHAR(now() AT TIME ZONE 'Europe/Paris', 'YY')
      || '-'
      || LPAD(nextval('order_number_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_order_number_on_complete
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number_on_complete();
