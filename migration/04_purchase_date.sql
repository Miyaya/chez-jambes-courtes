-- purchase_trips: 記錄每次去 Rungis 採購的行程，可關聯多個 pickup_slots

-- ── Purchase trips ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS purchase_trips (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_date   date        NOT NULL,
  note            text,                    -- 例如「跟王老闆訂的晴王葡萄那批」
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER purchase_trips_set_updated_at
  BEFORE UPDATE ON purchase_trips
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Admin-only table: deny all to anon/authenticated; service_role bypasses RLS.
ALTER TABLE purchase_trips ENABLE ROW LEVEL SECURITY;

-- ── pickup_slots: 關聯採購行程 ────────────────────────────────────────────────

ALTER TABLE pickup_slots
  ADD COLUMN IF NOT EXISTS purchase_trip_id uuid REFERENCES purchase_trips(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS pickup_slots_purchase_trip_idx ON pickup_slots (purchase_trip_id);

-- ── View: pickup_slots with purchase date ─────────────────────────────────────

CREATE OR REPLACE VIEW pickup_slots_with_purchase AS
SELECT
  ps.*,
  pt.purchase_date,
  pt.note AS purchase_note
FROM pickup_slots ps
LEFT JOIN purchase_trips pt ON ps.purchase_trip_id = pt.id;

-- Revoke public access; only service_role (admin) should query this view.
REVOKE ALL ON pickup_slots_with_purchase FROM anon, authenticated;
