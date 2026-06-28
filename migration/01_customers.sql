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

-- customers

CREATE TABLE IF NOT EXISTS customers (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id        uuid        UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- null = guest
  subscriber_id       uuid        REFERENCES subscribers(id) ON DELETE SET NULL,
  nom                 text        NOT NULL,
  prenom              text        NOT NULL,
  email               text        NOT NULL UNIQUE,
  phone               text,
  address             text,
  has_complete_order  boolean     NOT NULL DEFAULT false, -- true = éligible au paiement en espèces à la livraison
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 訪客結帳時建立 customer 紀錄
CREATE POLICY "anon_insert" ON customers
  FOR INSERT TO anon
  WITH CHECK (true);

-- 登入用戶只能讀／改自己的資料
CREATE POLICY "owner_select" ON customers
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "owner_update" ON customers
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
