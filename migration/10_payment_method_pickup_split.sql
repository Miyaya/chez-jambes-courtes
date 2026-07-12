-- Admin needs to manually record how an on-site order was actually paid
-- (cash vs. card) instead of the single generic 'pay_on_pickup' bucket set
-- at checkout. Old rows keep 'pay_on_pickup' — the constraint accepts both
-- the legacy value and the two new ones so nothing existing breaks.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('stripe', 'virement', 'pay_on_pickup', 'cash_on_pickup', 'card_on_pickup'));
