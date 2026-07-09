-- order_number_seq (introduced in 08_order_number_on_complete.sql) started at 1,
-- but rows already carry real order_number values assigned by the old per-insert
-- trigger (03_orders.sql) — nextval() beginning at 1 collides with an already-used
-- 'ORD-YY-001' and the UPDATE that marks an order complete fails on the
-- order_number UNIQUE constraint, silently leaving the order un-updated.
SELECT setval(
  'order_number_seq',
  COALESCE((SELECT MAX(substring(order_number from '(\d+)$')::int) FROM orders WHERE order_number IS NOT NULL), 0) + 1,
  false
);
