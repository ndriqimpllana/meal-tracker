export const DAYS = [
  {
    name: 'Monday', short: 'MON', type: 'training',
    cal: 2100, protein: 165, carbs: 175, fats: 70,
    note: null,
    meals: [
      { slot: 'Breakfast', name: '3 scrambled eggs + 100g oats with berries + 150g Greek yogurt (0% fat)', macros: '~48g protein' },
      { slot: 'Snack', name: '1 apple + 25g almonds', macros: '~6g protein' },
      { slot: 'Lunch', name: '200g grilled chicken breast + 150g brown rice + big salad (spinach, cucumber, tomato, olive oil)', macros: '~55g protein' },
      { slot: 'Pre-workout', name: '1 banana + 30g whey shake with water', macros: '~27g protein' },
      { slot: 'Dinner', name: '160g salmon fillet + 200g roasted sweet potato + steamed broccoli + lemon', macros: '~40g protein' },
    ],
  },
  {
    name: 'Tuesday', short: 'TUE', type: 'training',
    cal: 2100, protein: 165, carbs: 175, fats: 70,
    note: null,
    meals: [
      { slot: 'Breakfast', name: 'Overnight oats — 90g oats, 1 scoop whey, 200ml low-fat milk, chia seeds, 1 banana', macros: '~45g protein' },
      { slot: 'Snack', name: '150g cottage cheese + handful of walnuts', macros: '~20g protein' },
      { slot: 'Lunch', name: 'Turkey & quinoa bowl — 200g ground turkey, 130g quinoa, roasted peppers, onion, olive oil', macros: '~52g protein' },
      { slot: 'Pre-workout', name: '3 rice cakes + 30g whey shake', macros: '~27g protein' },
      { slot: 'Dinner', name: '3 egg omelette + 160g shrimp stir-fry with mixed vegetables + small whole wheat pita', macros: '~40g protein' },
    ],
  },
  {
    name: 'Wednesday', short: 'WED', type: 'training',
    cal: 2100, protein: 165, carbs: 175, fats: 70,
    note: null,
    meals: [
      { slot: 'Breakfast', name: 'Protein pancakes — 2 scoops whey, 2 eggs, 50g oats blended, topped with berries and honey', macros: '~52g protein' },
      { slot: 'Snack', name: '1 orange + 25g pistachios', macros: '~6g protein' },
      { slot: 'Lunch', name: '200g lean beef + 130g white rice + grilled zucchini and onions', macros: '~50g protein' },
      { slot: 'Pre-workout', name: '30g whey shake + 1 banana', macros: '~27g protein' },
      { slot: 'Dinner', name: '160g grilled sea bass or tilapia + 160g sweet potato mash + steamed asparagus', macros: '~38g protein' },
    ],
  },
  {
    name: 'Thursday', short: 'THU', type: 'rest',
    cal: 1850, protein: 160, carbs: 125, fats: 65,
    note: 'Rest day — light 20–30 min walk recommended. No pre-workout meal needed.',
    meals: [
      { slot: 'Breakfast', name: '4 egg whites + 2 whole eggs + sautéed spinach + 1 slice whole-grain toast', macros: '~40g protein' },
      { slot: 'Snack', name: '200g Greek yogurt (0% fat) + 1 tbsp flaxseeds + blueberries', macros: '~20g protein' },
      { slot: 'Lunch', name: '200g canned tuna in water + 80g chickpeas + greens, tomato, cucumber + lemon-olive oil dressing', macros: '~55g protein' },
      { slot: 'Snack', name: '1 pear + 2 boiled eggs', macros: '~14g protein' },
      { slot: 'Dinner', name: '160g baked chicken thigh (skinless) + bowl of lentil soup + cucumber-yogurt side salad', macros: '~48g protein' },
    ],
  },
  {
    name: 'Friday', short: 'FRI', type: 'training',
    cal: 2100, protein: 165, carbs: 175, fats: 70,
    note: null,
    meals: [
      { slot: 'Breakfast', name: '3 eggs + 80g smoked salmon + 1 slice rye bread + ½ avocado', macros: '~48g protein' },
      { slot: 'Snack', name: '200g low-fat cottage cheese + 1 tbsp chia seeds', macros: '~24g protein' },
      { slot: 'Lunch', name: 'Chicken wrap — 200g chicken breast, whole wheat tortilla, lettuce, tomato, Greek yogurt sauce', macros: '~52g protein' },
      { slot: 'Pre-workout', name: '30g whey shake + 3 rice cakes', macros: '~27g protein' },
      { slot: 'Dinner', name: '200g turkey meatballs + 130g whole wheat pasta + tomato-basil sauce (no cream)', macros: '~45g protein' },
    ],
  },
  {
    name: 'Saturday', short: 'SAT', type: 'training',
    cal: 2100, protein: 165, carbs: 175, fats: 70,
    note: null,
    meals: [
      { slot: 'Breakfast', name: '250g Greek yogurt + 1 scoop whey + berries + 1 tbsp flaxseed + 40g low-sugar granola', macros: '~55g protein' },
      { slot: 'Snack', name: '2 boiled eggs + raw carrot sticks and celery', macros: '~14g protein' },
      { slot: 'Lunch', name: '160g grilled lamb chops or lean beef + fattoush salad (tomato, cucumber, parsley, lemon, olive oil)', macros: '~44g protein' },
      { slot: 'Pre-workout', name: '1 banana + 30g whey shake', macros: '~27g protein' },
      { slot: 'Dinner', name: '180g baked herb chicken + roasted cauliflower and green beans + 2 tbsp hummus', macros: '~46g protein' },
    ],
  },
  {
    name: 'Sunday', short: 'SUN', type: 'rest',
    cal: 1850, protein: 160, carbs: 125, fats: 65,
    note: 'Meal prep day — cook bulk chicken, brown rice, and lentils for Mon–Wed.',
    meals: [
      { slot: 'Breakfast', name: '2 whole eggs + 3 egg whites omelette with feta and tomatoes + 1 whole-grain toast', macros: '~38g protein' },
      { slot: 'Snack', name: 'Handful of mixed nuts + 1 apple', macros: '~6g protein' },
      { slot: 'Lunch', name: 'Slow-cooked chicken or beef with lentils and vegetables — large portion (prep for the week)', macros: '~55g protein' },
      { slot: 'Snack', name: '30g whey shake + 1 banana (post-walk)', macros: '~27g protein' },
      { slot: 'Dinner', name: '160g tuna or sardines + green salad + 80g cooked lentils + olive oil and lemon dressing', macros: '~42g protein' },
    ],
  },
];

export const TOTAL_MEALS = DAYS.reduce((s, d) => s + d.meals.length, 0);
