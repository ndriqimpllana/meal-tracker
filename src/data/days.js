export const DAYS = [
  {
    name: 'Monday', short: 'MON', type: 'training',
    cal: 2400, protein: 183, carbs: 218, fat: 70, fiber: 37,
    note: null,
    meals: [
      {
        slot: '6:45am · Pre-workout',
        name: 'Banana & espresso',
        desc: '1 medium banana + black coffee or espresso. Quick glycogen top-up, caffeine boost. Skip if training fasted.',
        kcal: 90, protein: 1, carbs: 23, fat: 0, fiber: 3,
      },
      {
        slot: '9:00am · Post-workout',
        name: 'Protein power bowl',
        desc: '4 whole eggs scrambled + 3 egg whites, 80g rolled oats in oat milk, 1 tbsp chia seeds, 100g mixed berries, drizzle of honey.',
        kcal: 680, protein: 52, carbs: 72, fat: 20, fiber: 10,
      },
      {
        slot: '12:30pm · Lunch',
        name: 'Grilled chicken & quinoa bowl',
        desc: '180g grilled chicken breast, 80g dry quinoa cooked, half avocado, spinach, tomato, cucumber, lemon-olive oil dressing.',
        kcal: 620, protein: 50, carbs: 52, fat: 20, fiber: 10,
      },
      {
        slot: '4:00pm · Snack',
        name: 'Cottage cheese & walnuts',
        desc: '200g low-fat cottage cheese, 20g walnuts, 1 apple.',
        kcal: 300, protein: 26, carbs: 22, fat: 12, fiber: 4,
      },
      {
        slot: '7:00pm · Dinner',
        name: 'Salmon with sweet potato & broccoli',
        desc: '200g baked salmon, 200g roasted sweet potato, 200g steamed broccoli, 1 tbsp olive oil, garlic, paprika. Higher carb dinner to fuel Tuesday.',
        kcal: 620, protein: 42, carbs: 52, fat: 18, fiber: 9,
      },
      {
        slot: '9:30pm · Night prep',
        name: 'Casein shake + oat cakes',
        desc: '1 scoop casein (200ml oat milk), 2 oat cakes. Slow-release protein overnight — pre-loads tomorrow\'s session.',
        kcal: 280, protein: 32, carbs: 28, fat: 6, fiber: 3,
      },
    ],
  },
  {
    name: 'Tuesday', short: 'TUE', type: 'training',
    cal: 2400, protein: 181, carbs: 220, fat: 69, fiber: 38,
    note: null,
    meals: [
      {
        slot: '6:45am · Pre-workout',
        name: 'Rice cake & peanut butter',
        desc: '1 rice cake, 1 tbsp natural peanut butter. Optional — only if you feel low energy. Skip if not hungry.',
        kcal: 120, protein: 4, carbs: 14, fat: 6, fiber: 1,
      },
      {
        slot: '9:00am · Post-workout',
        name: 'Greek yogurt protein bowl',
        desc: '250g full-fat Greek yogurt, 1 scoop vanilla whey mixed in, 50g granola, 100g berries, 1 tbsp honey, 1 tbsp flaxseed.',
        kcal: 650, protein: 52, carbs: 70, fat: 16, fiber: 8,
      },
      {
        slot: '12:30pm · Lunch',
        name: 'Lentil & chicken soup',
        desc: '150g chicken breast, 100g red lentils, diced carrots, celery, tomato, cumin, coriander, 1 tsp olive oil. Very high fiber and protein.',
        kcal: 560, protein: 48, carbs: 58, fat: 10, fiber: 14,
      },
      {
        slot: '4:00pm · Snack',
        name: 'Tuna rice cakes',
        desc: '2 rice cakes, 120g canned tuna, lemon juice, herbs, mustard.',
        kcal: 230, protein: 30, carbs: 18, fat: 3, fiber: 2,
      },
      {
        slot: '7:00pm · Dinner',
        name: 'Turkey & chickpea stir-fry',
        desc: '200g lean turkey mince, 150g cooked chickpeas, bell peppers, zucchini, garlic, soy sauce, sesame oil, 80g dry brown rice.',
        kcal: 640, protein: 50, carbs: 60, fat: 16, fiber: 12,
      },
      {
        slot: '9:30pm · Night prep',
        name: 'Casein & banana',
        desc: '1 scoop casein in 200ml milk, 1 small banana. Carbs + slow protein — perfect overnight pre-load for Thursday\'s session.',
        kcal: 280, protein: 30, carbs: 32, fat: 4, fiber: 3,
      },
    ],
  },
  {
    name: 'Wednesday', short: 'WED', type: 'rest',
    cal: 2000, protein: 177, carbs: 152, fat: 66, fiber: 40,
    note: 'Rest day — lower carbs today. Focus on recovery, hydration, and high-fiber foods.',
    meals: [
      {
        slot: '8:00am · Breakfast',
        name: 'Veggie omelette',
        desc: '4 whole eggs, mushrooms, spinach, red pepper, onion, 40g feta. Lower carb start — no glycogen loading needed today.',
        kcal: 460, protein: 36, carbs: 14, fat: 28, fiber: 4,
      },
      {
        slot: '12:30pm · Lunch',
        name: 'Tuna & white bean salad',
        desc: '160g canned tuna, 150g white beans, cucumber, red onion, olive oil, capers, lemon. High fiber and protein, very filling.',
        kcal: 460, protein: 48, carbs: 40, fat: 12, fiber: 12,
      },
      {
        slot: '3:30pm · Snack',
        name: 'Cottage cheese & veggie plate',
        desc: '200g low-fat cottage cheese, carrot sticks, celery, cucumber, 1 tbsp hummus.',
        kcal: 240, protein: 26, carbs: 18, fat: 6, fiber: 6,
      },
      {
        slot: '7:00pm · Dinner',
        name: 'Baked cod & quinoa',
        desc: '220g baked cod, roasted courgette, red pepper, cherry tomatoes, 150g cooked quinoa, 1 tbsp olive oil, herbs.',
        kcal: 540, protein: 50, carbs: 45, fat: 14, fiber: 10,
      },
      {
        slot: '9:30pm · Night',
        name: 'Casein shake',
        desc: '1 scoop casein in water. Rest day — no carb top-up, just slow protein to protect muscle overnight.',
        kcal: 160, protein: 28, carbs: 8, fat: 3, fiber: 0,
      },
    ],
  },
  {
    name: 'Thursday', short: 'THU', type: 'training',
    cal: 2400, protein: 182, carbs: 218, fat: 70, fiber: 36,
    note: null,
    meals: [
      {
        slot: '6:45am · Pre-workout',
        name: 'Banana',
        desc: '1 ripe banana. Fast carbs, easy to digest. Optional if not hungry.',
        kcal: 90, protein: 1, carbs: 23, fat: 0, fiber: 3,
      },
      {
        slot: '9:00am · Post-workout',
        name: 'Protein pancakes',
        desc: '2 scoops whey, 2 whole eggs, 1 banana mashed, 40g oats — blended and pan-fried. Top with Greek yogurt and berries.',
        kcal: 660, protein: 56, carbs: 68, fat: 14, fiber: 7,
      },
      {
        slot: '12:30pm · Lunch',
        name: 'Chicken wrap with hummus',
        desc: '180g grilled chicken, 1 whole-grain wrap, 3 tbsp hummus, spinach, tomato, cucumber, grilled peppers.',
        kcal: 580, protein: 50, carbs: 52, fat: 16, fiber: 9,
      },
      {
        slot: '4:00pm · Snack',
        name: 'Hard-boiled eggs & fruit',
        desc: '3 hard-boiled eggs, 1 orange, 15g almonds.',
        kcal: 280, protein: 22, carbs: 18, fat: 14, fiber: 4,
      },
      {
        slot: '7:00pm · Dinner',
        name: 'Beef & vegetable stir-fry with brown rice',
        desc: '180g lean beef strips, 80g brown rice dry, broccoli, snap peas, carrots, soy sauce, ginger, garlic. High carb dinner to fuel Friday.',
        kcal: 620, protein: 44, carbs: 64, fat: 16, fiber: 10,
      },
      {
        slot: '9:30pm · Night prep',
        name: 'Casein + oat cakes',
        desc: '1 scoop casein, 200ml oat milk, 2 oat cakes. Pre-loading Friday morning\'s session.',
        kcal: 280, protein: 32, carbs: 28, fat: 6, fiber: 3,
      },
    ],
  },
  {
    name: 'Friday', short: 'FRI', type: 'training',
    cal: 2400, protein: 180, carbs: 220, fat: 68, fiber: 37,
    note: null,
    meals: [
      {
        slot: '6:45am · Pre-workout',
        name: 'Espresso + small banana',
        desc: 'Black coffee + half a banana. Caffeine sharpens focus. Keep minimal — 45 mins before training.',
        kcal: 55, protein: 1, carbs: 14, fat: 0, fiber: 1,
      },
      {
        slot: '9:00am · Post-workout',
        name: 'Smoked salmon & egg toast',
        desc: '3 whole eggs scrambled, 80g smoked salmon, 2 slices whole-grain toast, half avocado, capers, lemon. Great omega-3 hit for inflammation recovery.',
        kcal: 660, protein: 52, carbs: 42, fat: 30, fiber: 8,
      },
      {
        slot: '12:30pm · Lunch',
        name: 'Mediterranean chicken bowl',
        desc: '180g grilled chicken, 100g bulgur wheat, roasted aubergine, tomatoes, olives, parsley, lemon-olive oil dressing.',
        kcal: 580, protein: 48, carbs: 55, fat: 16, fiber: 10,
      },
      {
        slot: '4:00pm · Snack',
        name: 'Edamame & cottage cheese',
        desc: '150g edamame (shelled), 150g cottage cheese. Excellent plant + dairy protein combo.',
        kcal: 280, protein: 30, carbs: 14, fat: 10, fiber: 6,
      },
      {
        slot: '7:00pm · Dinner',
        name: 'Prawn & black bean tacos',
        desc: '250g king prawns, 150g black beans, 3 corn tortillas, lime slaw, salsa. High carb dinner to fuel Saturday.',
        kcal: 580, protein: 48, carbs: 64, fat: 10, fiber: 12,
      },
      {
        slot: '9:30pm · Night prep',
        name: 'Casein & banana',
        desc: '1 scoop casein, 200ml milk, 1 small banana. Saturday is a training day — pre-load tonight.',
        kcal: 280, protein: 30, carbs: 32, fat: 4, fiber: 3,
      },
    ],
  },
  {
    name: 'Saturday', short: 'SAT', type: 'training',
    cal: 2400, protein: 181, carbs: 222, fat: 69, fiber: 38,
    note: null,
    meals: [
      {
        slot: '6:45am · Pre-workout',
        name: 'Rice cake & almond butter',
        desc: '1 rice cake, 1 tbsp almond butter, drizzle of honey. Light fuel — easy on the stomach before lifting.',
        kcal: 130, protein: 3, carbs: 16, fat: 7, fiber: 2,
      },
      {
        slot: '9:00am · Post-workout',
        name: 'Full protein plate',
        desc: '3 whole eggs + 3 egg whites, 100g lean turkey bacon or ham, 1 slice whole-grain toast, grilled tomatoes, sautéed spinach. Weekend recovery breakfast.',
        kcal: 620, protein: 58, carbs: 30, fat: 26, fiber: 6,
      },
      {
        slot: '1:00pm · Lunch',
        name: 'Lamb kofta & tabbouleh',
        desc: '200g lean lamb kofta grilled, 100g bulgur tabbouleh, hummus dip, cucumber tzatziki.',
        kcal: 640, protein: 48, carbs: 56, fat: 22, fiber: 10,
      },
      {
        slot: '4:00pm · Snack',
        name: 'Protein smoothie',
        desc: '1 scoop whey, 150g frozen mango, 200ml coconut water, 1 tbsp chia seeds, handful of spinach.',
        kcal: 310, protein: 32, carbs: 38, fat: 5, fiber: 7,
      },
      {
        slot: '7:00pm · Dinner',
        name: 'Baked chicken thighs & lentils',
        desc: '200g skinless chicken thighs, 100g green lentils cooked, roasted sweet potato, kale, garlic, turmeric, olive oil.',
        kcal: 620, protein: 50, carbs: 60, fat: 16, fiber: 14,
      },
      {
        slot: '9:30pm · Night',
        name: 'Greek yogurt & seeds',
        desc: '200g Greek yogurt, 1 tbsp mixed seeds, cinnamon. Sunday is rest — no carb top-up needed.',
        kcal: 220, protein: 20, carbs: 14, fat: 10, fiber: 3,
      },
    ],
  },
  {
    name: 'Sunday', short: 'SUN', type: 'rest',
    cal: 2000, protein: 176, carbs: 150, fat: 66, fiber: 40,
    note: 'Rest day — meal prep day. Cook bulk chicken, lentils, and quinoa for Mon–Wed.',
    meals: [
      {
        slot: '9:00am · Breakfast',
        name: 'Overnight oats',
        desc: '70g oats soaked overnight in oat milk, 1 scoop vanilla whey mixed in, 1 tbsp chia seeds, 80g blueberries. Relaxed start.',
        kcal: 480, protein: 38, carbs: 54, fat: 10, fiber: 10,
      },
      {
        slot: '1:00pm · Lunch',
        name: 'Grilled sea bass & green salad',
        desc: '200g sea bass fillet, large green salad with fresh herbs, 2 tbsp olive oil dressing, 100g cooked quinoa.',
        kcal: 520, protein: 46, carbs: 38, fat: 18, fiber: 10,
      },
      {
        slot: '4:00pm · Snack',
        name: 'Hummus & veggie plate',
        desc: '100g hummus, carrot, cucumber, celery, bell pepper strips. Very high fiber — great for keeping full on a lower-calorie rest day.',
        kcal: 230, protein: 10, carbs: 28, fat: 10, fiber: 10,
      },
      {
        slot: '7:00pm · Dinner',
        name: 'Chickpea & chicken stew',
        desc: '200g chickpeas, 150g chicken breast, crushed tomatoes, spinach, paprika, cumin, garlic, lemon. High fiber powerhouse.',
        kcal: 520, protein: 50, carbs: 52, fat: 10, fiber: 14,
      },
      {
        slot: '9:30pm · Night prep',
        name: 'Casein + oat cakes',
        desc: '1 scoop casein, 2 oat cakes. Monday is a training day — tonight\'s casein + carbs pre-loads your first session of the week.',
        kcal: 260, protein: 30, carbs: 26, fat: 5, fiber: 3,
      },
    ],
  },
];

export const TOTAL_MEALS = DAYS.reduce((s, d) => s + d.meals.length, 0);
