-- =============================================================================
-- The Pit Stop — seed data. GENERATED from src/data/menu.json by scripts/build-seed.mjs.
-- Do not edit by hand: change the JSON and run `npm run db:seed:gen`.
-- Safe to re-run (upserts on slugs / natural keys). Prices are CAD cents.
-- =============================================================================

insert into public.locations
  (slug, name, address_line1, address_line2, city, region, postal_code, country, phone, email, timezone, landmark,
   google_maps_url, doordash_url, skipthedishes_url, online_order_url, instagram_url, tiktok_url, facebook_url, is_primary)
values ('fort-mcmurray', 'The Pit Stop', '530 MacKenzie Blvd', null, 'Fort McMurray', 'AB', '', 'CA',
        '(780) 000-0000', 'hello@thepitstopymm.ca', 'America/Edmonton', 'Across from the Oil Sands Discovery Centre', 'https://www.google.com/maps/search/?api=1&query=530+MacKenzie+Blvd+Fort+McMurray+AB', null, null,
        null, null, null, null, true)
on conflict (slug) do update set
  name = excluded.name, address_line1 = excluded.address_line1, address_line2 = excluded.address_line2, city = excluded.city,
  region = excluded.region, postal_code = excluded.postal_code, country = excluded.country, phone = excluded.phone, email = excluded.email,
  timezone = excluded.timezone, landmark = excluded.landmark, google_maps_url = excluded.google_maps_url, doordash_url = excluded.doordash_url,
  skipthedishes_url = excluded.skipthedishes_url, online_order_url = excluded.online_order_url, instagram_url = excluded.instagram_url,
  tiktok_url = excluded.tiktok_url, facebook_url = excluded.facebook_url, is_primary = excluded.is_primary;

insert into public.business_hours (location_id, day_of_week, opens_at, closes_at, is_closed)
select l.id, d.dow, d.opens::time, d.closes::time, d.closed
from public.locations l
cross join (values
  (0, null, null, true),
  (1, '07:00', '18:00', false),
  (2, '07:00', '18:00', false),
  (3, '07:00', '18:00', false),
  (4, '07:00', '18:00', false),
  (5, '07:00', '18:00', false),
  (6, '08:00', '17:00', false)
) as d(dow, opens, closes, closed)
where l.slug = 'fort-mcmurray'
on conflict (location_id, day_of_week) do update
  set opens_at = excluded.opens_at, closes_at = excluded.closes_at, is_closed = excluded.is_closed;

insert into public.menu_categories (slug, name, description, sort_order) values
  ('smash-burgers', 'Smash Burgers', 'Fresh beef smashed thin on a ripping-hot griddle. Pick your engine size: 1500, 2500 or 3500.', 1),
  ('chicken', 'Chicken', 'Crispy, juicy and built like a burger.', 2),
  ('breakfast', 'Breakfast Sandwiches', 'Served from open until 11 AM. Fuel up before the day gets going.', 3),
  ('sides', 'Sides', 'Fries, rings and the loaded stuff.', 4),
  ('shakes', 'Shakes', 'Hand-spun with real ice cream.', 5),
  ('drinks', 'Drinks', 'Coffee for the morning shift, cold drinks for the rest of it.', 6),
  ('kids', 'Kids', 'For the pit crew in training.', 7)
on conflict (slug) do update
  set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.menu_items
  (category_id, slug, name, description, price_cents, image_url, calories, tags, allergens, badge, is_featured, sort_order)
select c.id, i.slug, i.name, i.description, i.price_cents, i.image_url, i.calories, i.tags, i.allergens, i.badge, i.is_featured, i.sort_order
from (values
  ('smash-burgers', 'sierra', 'The Sierra', 'The work truck. Smashed patty, American cheese, pickles, grilled onions and Pit Stop sauce on a toasted potato bun.', 1150, '/media/menu/sierra.jpg'::text, 640::integer, '{"bestseller"}'::text[], '{"gluten","dairy","egg"}'::text[], 'Fan favourite'::text, true, 1),
  ('smash-burgers', 'denali', 'The Denali', 'Top trim. Smoked bacon, caramelized onions, aged cheddar, garlic aioli and a drizzle of maple on a brioche bun.', 1350, '/media/menu/denali.jpg', 790, '{"signature"}'::text[], '{"gluten","dairy","egg"}'::text[], 'Signature', true, 2),
  ('smash-burgers', 'at4', 'The AT4', 'Built for rough roads. Pepper jack, fresh and crispy jalapeños, chipotle mayo and a hit of hot honey.', 1300, '/media/menu/at4.jpg', 760, '{"spicy"}'::text[], '{"gluten","dairy","egg"}'::text[], 'Spicy', true, 3),
  ('smash-burgers', 'mushroom-swiss', 'The Backroad', 'Sautéed mushrooms, Swiss cheese, garlic aioli and crispy shallots. Quiet, smooth, no surprises.', 1300, null, 720, '{}'::text[], '{"gluten","dairy","egg"}'::text[], null, false, 4),
  ('smash-burgers', 'hybrid', 'The Hybrid', 'Plant-based patty smashed the same way, American cheese, lettuce, tomato, pickles and Pit Stop sauce.', 1250, null, 610, '{"vegetarian"}'::text[], '{"gluten","dairy","egg","soy"}'::text[], 'Veggie', false, 5),
  ('chicken', 'hauler', 'The Hauler', 'Buttermilk-fried chicken breast, shredded lettuce, pickles and garlic mayo on a toasted bun.', 1300, null, 720, '{}'::text[], '{"gluten","dairy","egg"}'::text[], null, false, 1),
  ('chicken', 'redline-chicken', 'The Redline', 'Our fried chicken tossed in Nashville-style hot oil, slaw, pickles and comeback sauce.', 1350, null, 790, '{"spicy"}'::text[], '{"gluten","dairy","egg"}'::text[], 'Spicy', false, 2),
  ('breakfast', 'jump-start', 'The Jump Start', 'Folded egg and American cheese on a toasted English muffin. Simple, quick, gets you going.', 650, null, 380, '{"vegetarian"}'::text[], '{"gluten","dairy","egg"}'::text[], null, false, 1),
  ('breakfast', 'turbo', 'The Turbo', 'Smoked bacon, folded egg and cheddar on a toasted brioche bun with chipotle mayo.', 850, '/media/menu/turbo.jpg', 560, '{"bestseller"}'::text[], '{"gluten","dairy","egg"}'::text[], 'Morning favourite', true, 2),
  ('breakfast', 'diesel', 'The Diesel', 'Sausage patty, folded egg, cheddar and a crispy hash brown on a brioche bun. Built to last till lunch.', 950, null, 690, '{}'::text[], '{"gluten","dairy","egg"}'::text[], null, false, 3),
  ('breakfast', 'breakfast-smash', 'The Breakfast Smash', 'A smashed beef patty, folded egg, American cheese, hash brown and maple aioli. Breakfast meets the griddle.', 1100, null, 740, '{"signature"}'::text[], '{"gluten","dairy","egg"}'::text[], 'Signature', false, 4),
  ('breakfast', 'hash-brown', 'Hash Brown', 'Crispy hash brown patty. Add one to any breakfast sandwich.', 250, null, 150, '{"vegetarian"}'::text[], '{}'::text[], null, false, 5),
  ('sides', 'pit-fries', 'Pit Fries', 'Crinkle-cut fries with sea salt. Add Pit Stop sauce for dipping.', 450, null, 380, '{"vegetarian"}'::text[], '{}'::text[], null, false, 1),
  ('sides', 'loaded-pit-fries', 'Loaded Pit Fries', 'Fries buried under chopped smash patty, cheese sauce, grilled onions, pickles and Pit Stop sauce.', 950, '/media/menu/loaded-pit-fries.jpg', 860, '{"bestseller"}'::text[], '{"gluten","dairy","egg"}'::text[], 'Fan favourite', true, 2),
  ('sides', 'spare-tires', 'Spare Tires', 'Thick-cut beer-battered onion rings.', 550, null, 450, '{"vegetarian"}'::text[], '{"gluten"}'::text[], null, false, 3),
  ('sides', 'lug-nuts', 'Lug Nuts', 'Crispy potato tots with your choice of dipping sauce.', 500, null, 420, '{"vegetarian"}'::text[], '{}'::text[], null, false, 4),
  ('shakes', 'motor-oil-shake', 'Motor Oil', 'Thick chocolate shake with whipped cream. Looks the part, tastes way better.', 700, '/media/menu/motor-oil-shake.jpg', 690, '{"vegetarian","bestseller"}'::text[], '{"dairy"}'::text[], 'Fan favourite', false, 1),
  ('shakes', 'chrome-shake', 'Chrome', 'Classic vanilla bean shake.', 650, null, 650, '{"vegetarian"}'::text[], '{"dairy"}'::text[], null, false, 2),
  ('shakes', 'tail-light-shake', 'Tail Light', 'Strawberry shake made with real berries.', 650, null, 640, '{"vegetarian"}'::text[], '{"dairy"}'::text[], null, false, 3),
  ('drinks', 'high-octane-coffee', 'High Octane Coffee', 'Fresh-brewed drip coffee. Free refill with any breakfast sandwich before 11.', 275, null, 5, '{"vegan"}'::text[], '{}'::text[], null, false, 1),
  ('drinks', 'fountain-drink', 'Fountain Drink', 'Coke, Diet Coke, Sprite, Canada Dry, iced tea or lemonade.', 300, null, 0, '{}'::text[], '{}'::text[], null, false, 2),
  ('drinks', 'bottled-water', 'Bottled Water', null, 225, null, 0, '{"vegan"}'::text[], '{}'::text[], null, false, 3),
  ('kids', 'dipstick-meal', 'Dipstick Meal', 'Single smash burger or two chicken tenders with fries and a kids drink.', 850, null, 620, '{}'::text[], '{"gluten","dairy","egg"}'::text[], null, false, 1)
) as i(category_slug, slug, name, description, price_cents, image_url, calories, tags, allergens, badge, is_featured, sort_order)
join public.menu_categories c on c.slug = i.category_slug
on conflict (slug) do update
  set category_id = excluded.category_id, name = excluded.name, description = excluded.description, price_cents = excluded.price_cents,
      image_url = coalesce(excluded.image_url, public.menu_items.image_url), calories = excluded.calories, tags = excluded.tags,
      allergens = excluded.allergens, badge = excluded.badge, is_featured = excluded.is_featured, sort_order = excluded.sort_order;

insert into public.menu_item_tiers (item_id, code, label, price_cents, sort_order)
select mi.id, t.code, t.label, t.price_cents, t.sort_order
from (values
  ('sierra', '1500', 'Single', 1150, 1),
  ('sierra', '2500', 'Double', 1500, 2),
  ('sierra', '3500', 'Triple', 1850, 3),
  ('denali', '1500', 'Single', 1350, 1),
  ('denali', '2500', 'Double', 1700, 2),
  ('denali', '3500', 'Triple', 2050, 3),
  ('at4', '1500', 'Single', 1300, 1),
  ('at4', '2500', 'Double', 1650, 2),
  ('at4', '3500', 'Triple', 2000, 3),
  ('mushroom-swiss', '1500', 'Single', 1300, 1),
  ('mushroom-swiss', '2500', 'Double', 1650, 2),
  ('mushroom-swiss', '3500', 'Triple', 2000, 3),
  ('hybrid', '1500', 'Single', 1250, 1),
  ('hybrid', '2500', 'Double', 1600, 2),
  ('hybrid', '3500', 'Triple', 1950, 3)
) as t(item_slug, code, label, price_cents, sort_order)
join public.menu_items mi on mi.slug = t.item_slug
on conflict (item_id, code) do update
  set label = excluded.label, price_cents = excluded.price_cents, sort_order = excluded.sort_order;

insert into public.menu_modifier_groups (item_id, name, min_select, max_select, sort_order)
select mi.id, 'Add-ons', 0, 6, 1
from public.menu_items mi
join public.menu_categories c on c.id = mi.category_id
where c.slug in ('smash-burgers')
on conflict (item_id, name) do nothing;

insert into public.menu_modifiers (group_id, name, price_delta_cents, sort_order)
select g.id, m.name, m.price_delta_cents, m.sort_order
from public.menu_modifier_groups g
cross join (values
  ('Extra Patty', 350, 1),
  ('Smoked Bacon', 250, 2),
  ('Extra Cheese', 125, 3),
  ('Fried Egg', 175, 4),
  ('Jalapeños', 100, 5),
  ('Make it a Full Service (fries + drink)', 550, 6)
) as m(name, price_delta_cents, sort_order)
where g.name = 'Add-ons'
on conflict (group_id, name) do update set price_delta_cents = excluded.price_delta_cents, sort_order = excluded.sort_order;

insert into public.promotions (title, body, cta_label, cta_url, is_active, sort_order)
select 'Breakfast till 11', 'Egg sandwiches, hash browns and High Octane coffee from open until 11 AM, Monday to Saturday.', 'See breakfast', '#menu', true, 1
where not exists (select 1 from public.promotions where title = 'Breakfast till 11');
