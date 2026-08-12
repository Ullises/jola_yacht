-- jola_yacht (PostgreSQL) init schema
-- Requirements:
-- - Postgres
-- - Time slots are per asset (experience or fleet)
-- - Prevent double booking per asset + date + time_slot
-- - Promotions, admin auth, payments similar to jola_yacht server.py

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- Drop tables (reverse FK order)
-- =========================
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS fleet;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS admin_users;

-- =========================
-- Admin Users
-- =========================
CREATE TABLE admin_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         varchar(255) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  name          varchar(255) NOT NULL DEFAULT 'Admin',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- Experiences
-- =========================
CREATE TABLE experiences (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  title_es         varchar(255) NOT NULL,
  title_en         varchar(255) NOT NULL,
  description_es   text NOT NULL,
  description_en   text NOT NULL,

  highlights_es    jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlights_en    jsonb NOT NULL DEFAULT '[]'::jsonb,

  price            numeric(10,2) NOT NULL,
  duration_minutes integer NOT NULL,

  rating           numeric(3,2) NOT NULL DEFAULT 5.0,
  review_count     integer NOT NULL DEFAULT 0,

  images           jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_guests       integer NOT NULL DEFAULT 10,
  includes         jsonb NOT NULL DEFAULT '[]'::jsonb,

  category         varchar(100) NOT NULL DEFAULT 'water_activity',
  is_active        boolean NOT NULL DEFAULT true,

  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_experiences_active ON experiences(is_active);

-- =========================
-- Fleet
-- =========================
CREATE TABLE fleet (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  name            varchar(255) NOT NULL,
  type            varchar(50) NOT NULL, -- yacht, jetski, waverunner

  description_es  text NOT NULL,
  description_en  text NOT NULL,

  capacity        integer NOT NULL,
  price_per_hour  numeric(10,2) NOT NULL,

  amenities_es    jsonb NOT NULL DEFAULT '[]'::jsonb,
  amenities_en    jsonb NOT NULL DEFAULT '[]'::jsonb,
  specs           jsonb NOT NULL DEFAULT '{}'::jsonb,
  images          jsonb NOT NULL DEFAULT '[]'::jsonb,

  is_available    boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fleet_available ON fleet(is_available);
CREATE INDEX idx_fleet_type ON fleet(type);

-- =========================
-- Reviews
-- =========================
CREATE TABLE reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_name varchar(255) NOT NULL,
  rating        integer NOT NULL CHECK (rating >= 1 AND rating <= 5),

  comment_es    text NOT NULL,
  comment_en    text NOT NULL,

  avatar        text NULL,
  experience_id uuid NULL REFERENCES experiences(id) ON DELETE SET NULL,

  is_featured   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_featured ON reviews(is_featured);
CREATE INDEX idx_reviews_experience_id ON reviews(experience_id);

-- =========================
-- Trigger: auto-update rating & review_count on experiences
-- =========================
CREATE OR REPLACE FUNCTION update_experience_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_id uuid;
BEGIN
  -- Works for INSERT, UPDATE, and DELETE
  IF TG_OP = 'DELETE' THEN
    target_id := OLD.experience_id;
  ELSE
    target_id := NEW.experience_id;
  END IF;

  IF target_id IS NOT NULL THEN
    UPDATE experiences SET
      rating       = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE experience_id = target_id), 5.0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE experience_id = target_id)
    WHERE id = target_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_experience_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_experience_rating();

-- =========================
-- FAQs
-- =========================
CREATE TABLE faqs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  question_es  text NOT NULL,
  question_en  text NOT NULL,
  answer_es    text NOT NULL,
  answer_en    text NOT NULL,

  "order"      integer NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true
);

CREATE INDEX idx_faqs_active_order ON faqs(is_active, "order");

-- =========================
-- Promotions
-- =========================
CREATE TABLE promotions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  name_es         varchar(255) NOT NULL,
  name_en         varchar(255) NOT NULL,
  description_es  text NOT NULL,
  description_en  text NOT NULL,

  discount_type   varchar(30) NOT NULL DEFAULT 'percentage', -- percentage, fixed_amount
  discount_value  numeric(10,2) NOT NULL,

  promo_code      varchar(50) NULL, -- optional code (you uppercase in app)

  season_type     varchar(30) NOT NULL DEFAULT 'custom', -- holiday, seasonal, weekend, custom
  holiday_name    varchar(50) NULL,

  start_date      date NOT NULL,
  end_date        date NOT NULL,

  applies_to      varchar(30) NOT NULL DEFAULT 'all', -- all, experiences, fleet, specific
  -- For "specific", store UUID strings in a JSON array (fast + flexible; can normalize later)
  specific_items  jsonb NOT NULL DEFAULT '[]'::jsonb,

  min_guests      integer NOT NULL DEFAULT 1,
  min_purchase    numeric(10,2) NOT NULL DEFAULT 0,

  max_uses        integer NULL,
  current_uses    integer NOT NULL DEFAULT 0,

  is_active       boolean NOT NULL DEFAULT true,

  banner_image    text NULL,
  badge_color     varchar(20) NOT NULL DEFAULT '#FF7F50',

  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ck_promotions_date_range CHECK (end_date >= start_date),
  CONSTRAINT ck_promotions_discount_type CHECK (discount_type IN ('percentage','fixed_amount')),
  CONSTRAINT ck_promotions_applies_to CHECK (applies_to IN ('all','experiences','fleet','specific')),
  CONSTRAINT ck_promotions_season_type CHECK (season_type IN ('holiday','seasonal','weekend','custom'))
);

-- Unique promo code when present
CREATE UNIQUE INDEX uq_promotions_promo_code
  ON promotions(promo_code)
  WHERE promo_code IS NOT NULL;

CREATE INDEX idx_promotions_active_dates
  ON promotions(is_active, start_date, end_date);

-- =========================
-- Reservations
-- =========================
CREATE TABLE reservations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  experience_id    uuid NULL REFERENCES experiences(id) ON DELETE SET NULL,
  fleet_id         uuid NULL REFERENCES fleet(id) ON DELETE SET NULL,

  customer_name    varchar(255) NOT NULL,
  customer_email   varchar(255) NOT NULL,
  customer_phone   varchar(50) NOT NULL,

  date             date NOT NULL,
  time_slot        time NOT NULL, -- fixed slot like 09:00, 10:00, etc.
  guests           integer NOT NULL CHECK (guests > 0),

  original_price   numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount  numeric(10,2) NOT NULL DEFAULT 0,
  total_price      numeric(10,2) NOT NULL CHECK (total_price >= 0),

  promo_code       varchar(50) NULL,
  promotion_id     uuid NULL REFERENCES promotions(id) ON DELETE SET NULL,

  add_ons          jsonb NOT NULL DEFAULT '[]'::jsonb,

  status           varchar(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  payment_status   varchar(20) NOT NULL DEFAULT 'pending', -- pending, paid, refunded

  payment_session_id varchar(255) NULL, -- stripe session id / paypal order id
  notes            text NULL,

  created_at       timestamptz NOT NULL DEFAULT now(),

  -- Reservation must reference exactly one asset (experience OR fleet)
  CONSTRAINT ck_reservation_one_item CHECK (
    (experience_id IS NOT NULL AND fleet_id IS NULL) OR
    (experience_id IS NULL AND fleet_id IS NOT NULL)
  ),
  CONSTRAINT ck_reservation_status CHECK (status IN ('pending','confirmed','cancelled','completed')),
  CONSTRAINT ck_reservation_payment_status CHECK (payment_status IN ('pending','paid','refunded'))
);

CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_experience_date ON reservations(experience_id, date);
CREATE INDEX idx_reservations_fleet_date ON reservations(fleet_id, date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_payment_status ON reservations(payment_status);

-- Prevent double booking PER ASSET + date + time_slot
-- Ignore cancelled reservations so cancel frees the slot.
CREATE UNIQUE INDEX uq_reservation_experience_slot
ON reservations(experience_id, date, time_slot)
WHERE experience_id IS NOT NULL AND status <> 'cancelled';

CREATE UNIQUE INDEX uq_reservation_fleet_slot
ON reservations(fleet_id, date, time_slot)
WHERE fleet_id IS NOT NULL AND status <> 'cancelled';

-- Helpful for lookups by payment session id
CREATE INDEX idx_reservations_payment_session_id
ON reservations(payment_session_id);

-- =========================
-- Payment Transactions
-- =========================
CREATE TABLE payment_transactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  session_id     varchar(255) NOT NULL UNIQUE, -- stripe session id / paypal order id
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,

  amount         numeric(10,2) NOT NULL,
  currency       varchar(10) NOT NULL DEFAULT 'mxn',

  status         varchar(30) NOT NULL DEFAULT 'initiated', -- initiated, completed, failed, refunded
  payment_status varchar(20) NOT NULL DEFAULT 'pending',   -- pending, paid, refunded

  metadata       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ck_payment_status CHECK (payment_status IN ('pending','paid','refunded'))
);

CREATE INDEX idx_payment_transactions_reservation_id
ON payment_transactions(reservation_id);

-- =========================
-- Optional seed placeholders
-- =========================
-- You can insert initial experiences/fleet/reviews/faqs/promotions here
-- (mirroring your /seed endpoint), but it's often easier to keep seeding in Python.