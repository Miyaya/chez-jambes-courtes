-- products: per-channel visibility
-- `available` becomes `visible_instock`, and `visible_flash` is added alongside it,
-- letting a product be shown in Flash only, En Stock only, both, or neither.

ALTER TABLE products RENAME COLUMN available TO visible_instock;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS visible_flash boolean NOT NULL DEFAULT true;

------------------------

-- products.preference_options: list of selectable preference labels
-- (e.g. size/weight choices) for a product — a native array of strings.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS preference_options text[] NOT NULL DEFAULT '{}';

------------------------

-- products.has_price_range: when true, the storefront shows a "up to" (至多)
-- qualifier before the price, for products priced per-unit but whose actual
-- weight (and cost) varies.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS has_price_range boolean NOT NULL DEFAULT false;

-- CREATE OR REPLACE VIEW can add new trailing columns but cannot rename an
-- existing output column, so the view's own "available" column (still named
-- that from before the table rename above) needs an explicit rename first.
ALTER VIEW public_products RENAME COLUMN available TO visible_instock;
ALTER VIEW instock_products RENAME COLUMN available TO visible_instock;

CREATE OR REPLACE VIEW public_products AS
  SELECT
    id,
    name_fr,
    name_tw,
    origin,
    unit_price,
    unit_label,
    description,
    image_url,
    visible_instock,
    created_at,
    has_price_range,
    preference_options
  FROM products
  WHERE visible_flash = true;

CREATE OR REPLACE VIEW instock_products AS
  SELECT
    id,
    name_fr,
    name_tw,
    origin,
    unit_price,
    unit_label,
    description,
    image_url,
    visible_instock,
    stock_quantity,
    created_at,
    has_price_range,
    preference_options
  FROM products
  WHERE visible_instock = true;

------------------------

-- orders.line_username: optional LINE ID the customer can leave at checkout
-- so the owner can reach them directly (pickup coordination, shortages, etc).

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS line_username text;

------------------------

-- customers.has_complete_order dropped: pay-on-pickup is no longer gated on
-- having a prior completed order — it's now always offered at checkout.

ALTER TABLE customers
  DROP COLUMN IF EXISTS has_complete_order;

------------------------

-- order status rework: split the single "received" stage into received_preorder /
-- received_instock (preorder and in-stock orders never mix in one cart, so the type
-- is fixed at checkout time and carried in status itself). Drops the accepted/processing
-- intermediate stages — they had no real business meaning beyond "email sent".
--
-- flows:
--   preorder: received_preorder -> validated / partial_validated / canceled -> complete
--   instock:  received_instock -> complete / canceled
--
-- confirmation_email_sent replaces the old 'received' -> 'accepted' flip, which existed
-- solely to guard against double-sending the Stripe confirmation email.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS confirmation_email_sent boolean NOT NULL DEFAULT false;

-- Constraint must widen to the new values *before* the backfill below writes them —
-- otherwise the UPDATE is checked against the still-active old constraint and rejected.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('received', 'accepted', 'processing', 'received_preorder', 'received_instock', 'validated', 'partial_validated', 'complete', 'canceled'));

-- Backfill: legacy statuses collapse to the closest new equivalent. Pre-launch data,
-- small volume — spot-check/correct any misclassified rows manually in /admin/commandes.
UPDATE orders SET status = 'received_preorder' WHERE status IN ('received', 'accepted', 'processing');

-- Orders already past intake must have had their confirmation email sent.
UPDATE orders SET confirmation_email_sent = true WHERE status IN ('validated', 'partial_validated', 'complete', 'canceled');

-- Now that no row uses the legacy values, narrow the constraint to the final set.
ALTER TABLE orders DROP CONSTRAINT orders_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('received_preorder', 'received_instock', 'validated', 'partial_validated', 'complete', 'canceled'));

ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'received_preorder';
