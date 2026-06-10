-- subscribers table
-- source: 0 = prelaunch, 1 = checkout, 2 = manual

CREATE TABLE IF NOT EXISTS subscribers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL UNIQUE,
  name        text,
  source      integer     NOT NULL DEFAULT 0,
  active      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow unauthenticated inserts from the public form
CREATE POLICY "public_insert" ON subscribers
  FOR INSERT TO anon
  WITH CHECK (true);
