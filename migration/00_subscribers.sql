-- subscribers

CREATE TABLE IF NOT EXISTS subscribers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL UNIQUE,
  name        text,
  source      text        NOT NULL DEFAULT 'manual'
                          CHECK (source IN ('prelaunch', 'checkout', 'manual')),
  active      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER subscribers_set_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow unauthenticated inserts from the public form
CREATE POLICY "public_insert" ON subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- campaign (purchase banner content)
-- single-row table: visible controls whether the banner shows at all,
-- display_default shows the computed next-purchase date text,
-- content is shown instead when display_default is false.

CREATE TABLE IF NOT EXISTS campaign (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content         text,
  display_default boolean     NOT NULL DEFAULT true,
  visible         boolean     NOT NULL DEFAULT true
);

-- RLS: public can read, only service role can write
ALTER TABLE campaign ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select" ON campaign
  FOR SELECT TO anon, authenticated
  USING (true);

INSERT INTO campaign (id, content, display_default, visible) VALUES
  ('8eb02d44-41ee-4e12-a166-38af2f0e6962',
   'Bienvue chez jambes courtes ! 歡迎來到短腿之家 🥭 Nous prévoyons d''ouvrir officiellement à la mi-juillet 我們預計於七月中正式營業',
   false,
   true);