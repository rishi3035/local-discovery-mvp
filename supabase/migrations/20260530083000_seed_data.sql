-- Seed Categories
INSERT INTO categories (name, slug, icon) VALUES
  ($$Parks & Nature$$, $$parks-nature$$, $$tree$$),
  ($$Food & Drink$$, $$food-drink$$, $$utensils$$),
  ($$Culture & Art$$, $$culture-art$$, $$palette$$),
  ($$Landmarks$$, $$landmarks$$, $$map-pin$$),
  ($$Shopping$$, $$shopping$$, $$shopping-bag$$)
ON CONFLICT (slug) DO NOTHING;

-- Seed Places in San Francisco
INSERT INTO places (name, description, category_id, address, location, price_range, is_claimed)
SELECT $$Ferry Building$$, $$Historic ferry terminal turned food hall with local vendors.$$, id, $$1 Ferry Building, San Francisco, CA 94105$$, ST_SetSRID(ST_MakePoint($$-122.3937$$::float, $$37.7955$$::float), 4326)::geography, 2, true FROM categories WHERE slug = $$food-drink$$ ON CONFLICT DO NOTHING;

INSERT INTO places (name, description, category_id, address, location, price_range, is_claimed)
SELECT $$Golden Gate Park$$, $$Large urban park with gardens, museums, and trails.$$, id, $$San Francisco, CA$$, ST_SetSRID(ST_MakePoint($$-122.4862$$::float, $$37.7694$$::float), 4326)::geography, 1, true FROM categories WHERE slug = $$parks-nature$$ ON CONFLICT DO NOTHING;

INSERT INTO places (name, description, category_id, address, location, price_range, is_claimed)
SELECT $$SFMOMA$$, $$Modern and contemporary art museum.$$, id, $$151 3rd St, San Francisco, CA 94103$$, ST_SetSRID(ST_MakePoint($$-122.4011$$::float, $$37.7857$$::float), 4326)::geography, 3, true FROM categories WHERE slug = $$culture-art$$ ON CONFLICT DO NOTHING;

INSERT INTO places (name, description, category_id, address, location, price_range, is_claimed)
SELECT $$Tartine Bakery$$, $$Famous bakery known for sourdough bread and pastries.$$, id, $$600 Guerrero St, San Francisco, CA 94110$$, ST_SetSRID(ST_MakePoint($$-122.4243$$::float, $$37.7614$$::float), 4326)::geography, 2, true FROM categories WHERE slug = $$food-drink$$ ON CONFLICT DO NOTHING;

INSERT INTO places (name, description, category_id, address, location, price_range, is_claimed)
SELECT $$Mission Dolores Park$$, $$Popular park for picnics and city views.$$, id, $$Dolores St & 19th St, San Francisco, CA 94114$$, ST_SetSRID(ST_MakePoint($$-122.4270$$::float, $$37.7596$$::float), 4326)::geography, 1, true FROM categories WHERE slug = $$parks-nature$$ ON CONFLICT DO NOTHING;

INSERT INTO places (name, description, category_id, address, location, price_range, is_claimed)
SELECT $$Coit Tower$$, $$Art deco tower with murals and panoramic views.$$, id, $$1 Telegraph Hill Blvd, San Francisco, CA 94133$$, ST_SetSRID(ST_MakePoint($$-122.4059$$::float, $$37.8024$$::float), 4326)::geography, 2, true FROM categories WHERE slug = $$landmarks$$ ON CONFLICT DO NOTHING;

INSERT INTO places (name, description, category_id, address, location, price_range, is_claimed)
SELECT $$Alcatraz Island$$, $$Historic former prison and national park.$$, id, $$San Francisco Bay, CA$$, ST_SetSRID(ST_MakePoint($$-122.4230$$::float, $$37.8270$$::float), 4326)::geography, 3, true FROM categories WHERE slug = $$landmarks$$ ON CONFLICT DO NOTHING;

-- Seed Creator User
INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role)
VALUES ($$00000000-0000-0000-0000-000000000001$$, $$creator@example.com$$, $${"full_name": "SF Explorer"}$$::jsonb, $$authenticated$$, $$authenticated$$)
ON CONFLICT (id) DO NOTHING;

-- Seed Profile
INSERT INTO profiles (id, full_name, bio, role)
VALUES ($$00000000-0000-0000-0000-000000000001$$, $$SF Explorer$$, $$Local guide and coffee lover.$$, $$creator$$::user_role)
ON CONFLICT (id) DO UPDATE SET role = $$creator$$::user_role;

-- Seed Guides
INSERT INTO guides (title, description, creator_id, cover_image, tags, is_editorial)
VALUES 
  ($$A Perfect Day in the Mission$$, $$Explore the best of San Francisco's Mission District, from pastries to parks.$$, $$00000000-0000-0000-0000-000000000001$$, $$https://images.unsplash.com/photo-1541464322988-44b3c29565c2$$, ARRAY[$$mission$$, $$pastries$$, $$park$$, $$sunny$$], true),
  ($$Historic SF Landmarks$$, $$A journey through the most iconic historical sites in the city.$$, $$00000000-0000-0000-0000-000000000001$$, $$https://images.unsplash.com/photo-1449034446853-66c86144b0ad$$, ARRAY[$$history$$, $$landmarks$$, $$icons$$], false)
ON CONFLICT DO NOTHING;

-- Seed Guide Places
INSERT INTO guide_places (guide_id, place_id, "order")
SELECT g.id, p.id, 1 FROM guides g, places p WHERE g.title = $$A Perfect Day in the Mission$$ AND p.name = $$Tartine Bakery$$ ON CONFLICT DO NOTHING;

INSERT INTO guide_places (guide_id, place_id, "order")
SELECT g.id, p.id, 2 FROM guides g, places p WHERE g.title = $$A Perfect Day in the Mission$$ AND p.name = $$Mission Dolores Park$$ ON CONFLICT DO NOTHING;

INSERT INTO guide_places (guide_id, place_id, "order")
SELECT g.id, p.id, 1 FROM guides g, places p WHERE g.title = $$Historic SF Landmarks$$ AND p.name = $$Coit Tower$$ ON CONFLICT DO NOTHING;

INSERT INTO guide_places (guide_id, place_id, "order")
SELECT g.id, p.id, 2 FROM guides g, places p WHERE g.title = $$Historic SF Landmarks$$ AND p.name = $$Alcatraz Island$$ ON CONFLICT DO NOTHING;

-- Seed Tips
INSERT INTO tips (user_id, place_id, content, freshness_confirmed, moderation_status)
SELECT $$00000000-0000-0000-0000-000000000001$$, id, $$Get here early on weekends, the line for bread moves fast but it is long!$$, true, $$approved$$::moderation_status FROM places WHERE name = $$Tartine Bakery$$ ON CONFLICT DO NOTHING;

INSERT INTO tips (user_id, place_id, content, freshness_confirmed, moderation_status)
SELECT $$00000000-0000-0000-0000-000000000001$$, id, $$The view from the top is worth the wait. Go at sunset.$$, true, $$approved$$::moderation_status FROM places WHERE name = $$Coit Tower$$ ON CONFLICT DO NOTHING;
