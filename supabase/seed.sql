-- =============================================================================
-- The Pit Stop — SAMPLE data for development and a first deploy.
-- Prices, address, hours and descriptions are placeholders: edit freely.
-- Safe to re-run (upserts on slugs / natural keys).
-- Apply: npm run db:seed   (or automatically on `supabase db reset` locally)
-- =============================================================================

insert into public.locations (slug, name, address_line1, city, region, postal_code, phone, email, is_primary)
values ('main', 'The Pit Stop', '123 Main Street', 'Your City', 'ST', '00000', '(555) 555-0123', 'hello@thepitstop.example', true)
on conflict (slug) do update
  set name = excluded.name, address_line1 = excluded.address_line1, city = excluded.city,
      region = excluded.region, postal_code = excluded.postal_code, phone = excluded.phone,
      email = excluded.email, is_primary = excluded.is_primary;

insert into public.business_hours (location_id, day_of_week, opens_at, closes_at, is_closed)
select l.id, d.dow, d.opens, d.closes, false
from public.locations l
cross join (values
  (0, time '12:00', time '20:00'),  -- Sunday
  (1, time '11:00', time '21:00'),
  (2, time '11:00', time '21:00'),
  (3, time '11:00', time '21:00'),
  (4, time '11:00', time '21:00'),
  (5, time '11:00', time '22:00'),
  (6, time '11:00', time '22:00')   -- Saturday
) as d(dow, opens, closes)
where l.slug = 'main'
on conflict (location_id, day_of_week) do update
  set opens_at = excluded.opens_at, closes_at = excluded.closes_at, is_closed = excluded.is_closed;

insert into public.menu_categories (slug, name, description, sort_order) values
  ('smash-burgers', 'Smash Burgers',   'Fresh beef smashed on a screaming-hot griddle for crispy, caramelized edges.', 1),
  ('chicken',       'Chicken',         'Crispy, juicy, and built like a burger.', 2),
  ('sides',         'Sides',           'Crinkle fries, rings, and loaded extras.', 3),
  ('shakes',        'Shakes & Treats', 'Hand-spun shakes made with real ice cream.', 4),
  ('drinks',        'Drinks',          'Fountain favorites and more.', 5),
  ('kids',          'Kids',            'Smaller portions for pit crew in training.', 6)
on conflict (slug) do update
  set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.menu_items
  (category_id, slug, name, description, price_cents, calories, tags, allergens, is_featured, sort_order)
select c.id, i.slug, i.name, i.description, i.price_cents, i.calories, i.tags, i.allergens, i.is_featured, i.sort_order
from (values
  ('smash-burgers', 'classic-smash',        'Classic Smash',          'Single smashed patty, American cheese, pickles, grilled onions and Pit Stop sauce on a toasted potato bun.', 849, 620, '{bestseller}'::text[], '{gluten,dairy,egg}'::text[], true,  1),
  ('smash-burgers', 'double-smash',         'Double Smash',           'Two smashed patties, double American cheese, pickles, grilled onions and Pit Stop sauce.',                 1099, 890, '{bestseller}', '{gluten,dairy,egg}', true,  2),
  ('smash-burgers', 'bacon-smash',          'Bacon Smash',            'Double patty with crispy bacon, American cheese, lettuce, tomato and smoky BBQ mayo.',                    1199, 980, '{}',           '{gluten,dairy,egg}', false, 3),
  ('smash-burgers', 'pit-stop-stacker',     'Pit Stop Stacker',       'Three patties, three slices of cheese, bacon, caramelized onions and Pit Stop sauce. Bring a napkin.',    1399, 1320, '{signature}',  '{gluten,dairy,egg}', false, 4),
  ('smash-burgers', 'mushroom-swiss-smash', 'Mushroom Swiss Smash',   'Double patty, Swiss cheese, sauteed mushrooms and garlic aioli.',                                         1149, 910, '{}',           '{gluten,dairy,egg}', false, 5),
  ('smash-burgers', 'jalapeno-fire-smash',  'Jalapeno Fire Smash',    'Double patty, pepper jack, fresh and crispy jalapenos, chipotle mayo.',                                   1149, 920, '{spicy}',      '{gluten,dairy,egg}', false, 6),
  ('smash-burgers', 'garden-smash',         'Garden Smash',           'Crispy black bean patty, American cheese, lettuce, tomato, pickles and Pit Stop sauce.',                  999,  640, '{vegetarian}', '{gluten,dairy,egg,soy}', false, 7),
  ('chicken',       'crispy-chicken-sandwich', 'Crispy Chicken Sandwich', 'Buttermilk-fried chicken breast, pickles and mayo on a toasted bun.',                                 999,  720, '{}',           '{gluten,dairy,egg}', false, 1),
  ('chicken',       'nashville-hot-chicken',   'Nashville Hot Chicken',   'Crispy chicken breast dipped in hot oil, slaw, pickles and comeback sauce.',                          1049, 790, '{spicy}',      '{gluten,dairy,egg}', false, 2),
  ('chicken',       'chicken-tenders',         'Chicken Tenders (4 pc)',  'Hand-breaded tenders with your choice of dipping sauce.',                                             899,  560, '{}',           '{gluten,egg}',       false, 3),
  ('sides',         'crinkle-fries',    'Crinkle Fries',     'Golden crinkle-cut fries with sea salt.',                                                   399, 380, '{vegetarian}',            '{}',                 false, 1),
  ('sides',         'cheese-fries',     'Cheese Fries',      'Crinkle fries smothered in warm cheese sauce.',                                             549, 560, '{vegetarian}',            '{dairy}',            false, 2),
  ('sides',         'loaded-pit-fries', 'Loaded Pit Fries',  'Fries topped with cheese sauce, bacon, grilled onions, pickles and Pit Stop sauce.',        749, 820, '{bestseller}',            '{dairy,egg,gluten}', true,  3),
  ('sides',         'onion-rings',      'Onion Rings',       'Thick-cut beer-battered rings.',                                                            499, 450, '{vegetarian}',            '{gluten}',           false, 4),
  ('shakes',        'vanilla-shake',           'Vanilla Shake',         'Hand-spun with real vanilla bean ice cream.',                599, 650, '{vegetarian}',            '{dairy}',        false, 1),
  ('shakes',        'chocolate-shake',         'Chocolate Shake',       'Rich chocolate shake topped with whipped cream.',            599, 690, '{vegetarian}',            '{dairy}',        false, 2),
  ('shakes',        'strawberry-shake',        'Strawberry Shake',      'Made with real strawberries.',                               599, 640, '{vegetarian}',            '{dairy}',        false, 3),
  ('shakes',        'cookies-and-cream-shake', 'Cookies & Cream Shake', 'Vanilla shake loaded with crushed chocolate cookies.',       649, 760, '{bestseller,vegetarian}', '{dairy,gluten}', true,  4),
  ('drinks',        'fountain-drink',  'Fountain Drink',          'Coke, Diet Coke, Sprite, Dr Pepper or iced tea. Free refills in store.', 279, 0,   '{}',      '{}', false, 1),
  ('drinks',        'fresh-lemonade',  'Fresh-Squeezed Lemonade', 'Made daily.',                                                          349, 180, '{vegan}', '{}', false, 2),
  ('drinks',        'bottled-water',   'Bottled Water',           null,                                                                   199, 0,   '{vegan}', '{}', false, 3),
  ('kids',          'kids-smash',      'Kids Smash Meal',   'Single smash burger with fries and a kids drink.', 699, 640, '{}', '{gluten,dairy,egg}', false, 1),
  ('kids',          'kids-tenders',    'Kids Tenders Meal', 'Two tenders with fries and a kids drink.',         699, 560, '{}', '{gluten,egg}',       false, 2)
) as i(category_slug, slug, name, description, price_cents, calories, tags, allergens, is_featured, sort_order)
join public.menu_categories c on c.slug = i.category_slug
on conflict (slug) do update
  set category_id = excluded.category_id, name = excluded.name, description = excluded.description,
      price_cents = excluded.price_cents, calories = excluded.calories, tags = excluded.tags,
      allergens = excluded.allergens, is_featured = excluded.is_featured, sort_order = excluded.sort_order;

-- An "Add-ons" modifier group on every burger, with the same add-on list.
insert into public.menu_modifier_groups (item_id, name, min_select, max_select, sort_order)
select mi.id, 'Add-ons', 0, 6, 1
from public.menu_items mi
join public.menu_categories c on c.id = mi.category_id
where c.slug = 'smash-burgers'
on conflict (item_id, name) do nothing;

insert into public.menu_modifiers (group_id, name, price_delta_cents, sort_order)
select g.id, m.name, m.price_delta_cents, m.sort_order
from public.menu_modifier_groups g
cross join (values
  ('Extra Patty',   300, 1),
  ('Extra Cheese',  100, 2),
  ('Bacon',         200, 3),
  ('Fried Egg',     150, 4),
  ('Jalapenos',      75, 5),
  ('Avocado',       175, 6)
) as m(name, price_delta_cents, sort_order)
where g.name = 'Add-ons'
on conflict (group_id, name) do nothing;

insert into public.promotions (title, body, cta_label, cta_url, is_active, sort_order)
select 'Smash Tuesdays', '$2 off every Double Smash, all day Tuesday. Dine-in or pickup.', 'See the menu', '/menu', true, 1
where not exists (select 1 from public.promotions where title = 'Smash Tuesdays');
