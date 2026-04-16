-- ============================================================
-- Competitor Intel — Supabase Schema
-- Run this in Supabase SQL Editor to set up your database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Competitors table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitors (
  id          TEXT PRIMARY KEY,          -- slug, e.g. 'hims', 'ro'
  name        TEXT NOT NULL,
  domain      TEXT,
  website     TEXT,
  color       TEXT DEFAULT '#6366f1',
  bg_color    TEXT DEFAULT '#EEF2FF',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Messages table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id   TEXT REFERENCES competitors(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  subject         TEXT,
  preview_text    TEXT,
  sender_name     TEXT,
  sender_email    TEXT,
  body_html       TEXT,
  body_text       TEXT,
  received_at     TIMESTAMPTZ NOT NULL,
  day_of_week     TEXT,
  hour_of_day     INTEGER,
  campaign_type   TEXT CHECK (campaign_type IN (
                    'welcome','promotional','cart_abandon','reengagement',
                    'educational','transactional','nurture'
                  )),
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_messages_competitor ON messages(competitor_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel    ON messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_received   ON messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_dow        ON messages(day_of_week);
CREATE INDEX IF NOT EXISTS idx_messages_type       ON messages(campaign_type);

-- ── Row Level Security (optional — enable if you want auth) ─
-- ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages    ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read" ON competitors FOR SELECT USING (true);
-- CREATE POLICY "Public read" ON messages    FOR SELECT USING (true);

-- ── Seed competitors ─────────────────────────────────────────
INSERT INTO competitors (id, name, domain, website, color) VALUES
  -- Spirits & Liquor Brands
  ('absolut',       'Absolut',               'absolut.com',               'https://www.absolut.com',               '#1E40AF'),
  ('bacardi',       'Bacardí',                'bacardi.com',               'https://www.bacardi.com',               '#DC2626'),
  ('beefeater',     'Beefeater Gin',          'beefeatergin.com',          'https://www.beefeatergin.com',          '#B91C1C'),
  ('captainmorgan', 'Captain Morgan',          'captainmorgan.com',         'https://www.captainmorgan.com',         '#9333EA'),
  ('casamigos',     'Casamigos',               'casamigos.com',             'https://www.casamigos.com',             '#D97706'),
  ('cazadores',     'Cazadores',               'cazadores.com',             'https://www.cazadores.com',             '#059669'),
  ('deepeddy',      'Deep Eddy Vodka',         'deepeddyvodka.com',         'https://deepeddyvodka.com',             '#0891B2'),
  ('donjulio',      'Don Julio',               'donjulio.com',              'https://www.donjulio.com',              '#B45309'),
  ('greenhook',     'Greenhook Gin',           'greenhookgin.com',          'https://greenhookgin.com',              '#15803D'),
  ('hornitos',      'Hornitos Tequila',        'hornitostequila.com',       'https://www.hornitostequila.com',       '#EA580C'),
  ('jackdaniels',   'Jack Daniel''s',          'jackdaniels.com',           'https://www.jackdaniels.com',           '#0F172A'),
  ('jameson',       'Jameson',                 'jamesonwhiskey.com',        'https://jamesonwhiskey.com',            '#166534'),
  ('jeffersons',    'Jefferson''s Bourbon',    'jeffersonsbourbon.com',     'https://jeffersonsbourbon.com',         '#65A30D'),
  ('jimbeam',       'Jim Beam',                'jimbeam.com',               'https://www.jimbeam.com',               '#DC2626'),
  ('josecuervo',    'José Cuervo',             'josecuervo.com',            'https://www.josecuervo.com',            '#D97706'),
  ('ketelone',      'Ketel One',               'ketelone.com',              'https://www.ketelone.com',              '#1D4ED8'),
  ('malibu',        'Malibu',                  'maliburumdrinks.com',       'https://www.maliburumdrinks.com',       '#0284C7'),
  ('smirnoff',      'Smirnoff',                'smirnoff.com',              'https://www.smirnoff.com',              '#4F46E5'),
  ('tanqueray',     'Tanqueray',               'tanqueray.com',             'https://www.tanqueray.com',             '#065F46'),
  -- RTD Cocktail & Canned Drink Brands
  ('austin',        'Austin Cocktails',        'austincocktails.com',       'https://austincocktails.com',           '#7C3AED'),
  ('beatbox',       'BeatBox Beverages',       'beatboxbeverages.com',      'https://beatboxbeverages.com',          '#E11D48'),
  ('bettybooze',    'Betty Booze',             'bettybooze.com',            'https://bettybooze.com',                '#DB2777'),
  ('boozbox',       'Booz Box Cocktails',      'boozboxcocktails.com',      'https://boozboxcocktails.com',          '#0369A1'),
  ('buzzballz',     'BuzzBallz',               'buzzballz.com',             'https://www.buzzballz.com',             '#EA580C'),
  ('canteen',       'Canteen Spirits',         'canteenspirits.com',        'https://www.canteenspirits.com',        '#059669'),
  ('cantina',       'Cantina Cocktails',       'cantinacocktails.com',      'https://www.cantinacocktails.com',      '#B45309'),
  ('caymanjack',    'Cayman Jack',             'caymanjack.com',            'https://www.caymanjack.com',            '#0891B2'),
  ('cocktailsquad', 'Cocktail Squad',          'cocktailsquad.com',         'https://cocktailsquad.com',             '#6D28D9'),
  ('crafthouse',    'Crafthouse Cocktails',    'crafthousecocktails.com',   'https://crafthousecocktails.com',       '#D97706'),
  ('cutwater',      'Cutwater Spirits',        'cutwaterspirits.com',       'https://www.cutwaterspirits.com',       '#0891B2'),
  ('delola',        'Delola',                  'delolalife.com',            'https://www.delolalife.com',            '#BE185D'),
  ('dio',           'Dio Cocktails',           'diococktails.com',          'https://diococktails.com',              '#4F46E5'),
  ('dogfish',       'Dogfish Head',            'dogfish.com',               'https://www.dogfish.com',               '#92400E'),
  ('drifter',       'Drifter Cocktails',       'driftercocktails.com',      'https://driftercocktails.com',          '#0F766E'),
  ('filemonade',    'Filé Monade',             'filemonade.com',            'https://www.filemonade.com',            '#16A34A'),
  ('fivedrinks',    'Five Drinks',             'fivedrinks.co',             'https://fivedrinks.co',                 '#7C3AED'),
  ('handyschiller', 'Handy & Schiller',        'handyandschiller.com',      'https://handyandschiller.com',          '#1E40AF'),
  ('heritage',      'Heritage Distilling',     'heritagedistilling.com',    'https://heritagedistilling.com',        '#166534'),
  ('highnoon',      'High Noon',               'highnoonspirits.com',       'https://www.highnoonspirits.com',       '#DC2626'),
  ('juneshine',     'JuneShine',               'juneshine.com',             'https://juneshine.com',                 '#059669'),
  ('loneriver',     'Lone River',              'loneriverbevco.com',        'https://www.loneriverbevco.com',        '#B45309'),
  ('longdrink',     'The Long Drink',          'thelongdrink.com',          'https://thelongdrink.com',              '#0369A1'),
  ('loverboy',      'Loverboy',                'drinkloverboy.com',         'https://drinkloverboy.com',             '#E11D48'),
  ('loyal9',        'Loyal 9 Cocktails',       'loyal9cocktails.com',       'https://www.loyal9cocktails.com',       '#1D4ED8'),
  ('lyres',         'Lyre''s',                 'lyres.com',                 'https://lyres.com',                     '#0F766E'),
  ('mamitas',       'Mamitas',                 'drinkmamitas.com',          'https://drinkmamitas.com',              '#D97706'),
  ('mericanmule',   '''Merican Mule',          'mericanmule.com',           'https://mericanmule.com',               '#B91C1C'),
  ('mission',       'Mission Cocktails',       'missioncocktails.com',      'https://missioncocktails.com',          '#4F46E5'),
  ('monaco',        'Monaco Cocktails',        'monacococktails.com',       'https://www.monacococktails.com',       '#9333EA'),
  ('moth',          'MOTH Drinks',             'mothdrinks.com',            'https://mothdrinks.com',                '#6D28D9'),
  ('nutrl',         'NUTRL Vodka',             'nutrlvodka.com',            'https://www.nutrlvodka.com',            '#0891B2'),
  ('onda',          'Onda',                    'drinkonda.com',             'https://drinkonda.com',                 '#059669'),
  ('otr',           'OTR Cocktails',           'otrcocktails.com',          'https://www.otrcocktails.com',          '#1E40AF'),
  ('postmeridiem',  'Post Meridiem',           'postmeridiemspirits.com',   'https://postmeridiemspirits.com',       '#B45309'),
  ('saltpoint',     'Salt Point Cocktails',    'saltpointcocktails.com',    'https://www.saltpointcocktails.com',    '#0891B2'),
  ('slowandlow',    'Slow & Low',              'drinkslowandlow.com',       'https://www.drinkslowandlow.com',       '#92400E'),
  ('social',        'Social Sparkling Wine',   'socialsparklingwine.com',   'https://socialsparklingwine.com',       '#DB2777'),
  ('spritzsociety', 'Spritz Society',          'spritzsociety.com',         'https://www.spritzsociety.com',         '#E11D48'),
  ('straightaway',  'Straightaway Cocktails',  'straightawaycocktails.com', 'https://straightawaycocktails.com',     '#065F46'),
  ('sundaysfinest', 'Sunday''s Finest',        'sundaysfinest.com',         'https://sundaysfinest.com',             '#A21CAF'),
  ('superbird',     'Superbird',               'drinksuperbird.com',        'https://drinksuperbird.com',            '#EA580C'),
  ('tails',         'Tails Cocktails',         'tailscocktails.com',        'https://www.tailscocktails.com',        '#0369A1'),
  ('ashbourne',     'Thomas Ashbourne',        'thomasashbourne.com',       'https://thomasashbourne.com',           '#4F46E5'),
  ('tiptop',        'Tip Top Cocktails',       'tiptopcocktails.com',       'https://tiptopcocktails.com',           '#D97706'),
  ('twochicks',     'Two Chicks Cocktails',    'twochickscocktails.com',    'https://www.twochickscocktails.com',    '#BE185D'),
  ('viacarota',     'Via Carota',              'drinkviacarota.com',        'https://www.drinkviacarota.com',        '#B45309'),
  ('vervet',        'Vervet',                  'drinkvervet.com',           'https://drinkvervet.com',               '#16A34A'),
  ('wanderingbarman','Wandering Barman',        'wanderingbarman.com',       'https://wanderingbarman.com',           '#7C3AED'),
  ('whiteclaw',     'White Claw',              'whiteclaw.com',             'https://www.whiteclaw.com',             '#1E40AF'),
  ('youandyours',   'You & Yours',             'youandyours.com',           'https://youandyours.com',               '#DB2777')
ON CONFLICT (id) DO NOTHING;
