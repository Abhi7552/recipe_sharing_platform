/**
 * Seed script — populates the database with sample users and recipes.
 *
 * Usage:
 *   node seed.js            # adds seed data (skips if data already exists, unless --force)
 *   node seed.js --force    # wipes existing users/recipes first, then seeds fresh
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Recipe = require('./models/Recipe');

const FORCE = process.argv.includes('--force');

const users = [
  { name: 'Priya Sharma', email: 'priya@example.com', password: 'password123', bio: 'Home cook obsessed with weeknight dinners.' },
  { name: 'Marco Rossi', email: 'marco@example.com', password: 'password123', bio: 'Third-generation pasta maker.' },
  { name: 'Amara Okafor', email: 'amara@example.com', password: 'password123', bio: 'Baking my way through every cookbook I own.' },
];

// Recipes reference users by index into `users` above.
const recipeSeeds = [
  {
    authorIndex: 0,
    title: 'Weeknight Butter Chicken',
    description: 'A creamy, no-fuss butter chicken that beats takeout and comes together in under an hour.',
    cuisine: 'Indian',
    difficulty: 'medium',
    prepTimeMinutes: 20,
    cookTimeMinutes: 35,
    servings: 4,
    tags: ['weeknight', 'chicken', 'curry', 'comfort-food'],
    ingredients: [
      { name: 'boneless chicken thighs, cubed', quantity: '600g' },
      { name: 'plain yogurt', quantity: '1/2 cup' },
      { name: 'garam masala', quantity: '2 tsp' },
      { name: 'butter', quantity: '4 tbsp' },
      { name: 'garlic cloves, minced', quantity: '4' },
      { name: 'ginger, grated', quantity: '1 tbsp' },
      { name: 'crushed tomatoes', quantity: '400g' },
      { name: 'heavy cream', quantity: '1/2 cup' },
      { name: 'salt', quantity: '1 tsp' },
    ],
    steps: [
      'Marinate the chicken in yogurt and half the garam masala for at least 20 minutes.',
      'Sear the chicken in butter over high heat until browned; set aside.',
      'In the same pan, sauté garlic and ginger until fragrant.',
      'Add crushed tomatoes and remaining garam masala; simmer 10 minutes.',
      'Stir in cream and the seared chicken; simmer until the chicken is cooked through, about 10 minutes.',
      'Season with salt and serve with rice or naan.',
    ],
  },
  {
    authorIndex: 1,
    title: 'Classic Cacio e Pepe',
    description: 'Three ingredients, one pan, and the kind of pasta that proves simple can be spectacular.',
    cuisine: 'Italian',
    difficulty: 'easy',
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    servings: 2,
    tags: ['pasta', 'vegetarian', 'quick', 'italian'],
    ingredients: [
      { name: 'spaghetti', quantity: '200g' },
      { name: 'Pecorino Romano, finely grated', quantity: '100g' },
      { name: 'black pepper, coarsely cracked', quantity: '2 tsp' },
      { name: 'salt', quantity: 'to taste' },
    ],
    steps: [
      'Cook spaghetti in generously salted water until just shy of al dente. Reserve 1 cup pasta water.',
      'Toast the cracked pepper in a dry pan for 30 seconds until fragrant.',
      'Add a splash of pasta water to the pepper, then the drained pasta.',
      'Off heat, toss in the Pecorino a little at a time with more pasta water, tossing constantly, until glossy and emulsified.',
      'Serve immediately with extra pepper on top.',
    ],
  },
  {
    authorIndex: 2,
    title: 'Brown Butter Chocolate Chip Cookies',
    description: 'Nutty brown butter and flaky salt take a classic cookie to another level.',
    cuisine: 'American',
    difficulty: 'medium',
    prepTimeMinutes: 20,
    cookTimeMinutes: 12,
    servings: 18,
    tags: ['dessert', 'baking', 'chocolate', 'vegetarian'],
    ingredients: [
      { name: 'unsalted butter', quantity: '225g' },
      { name: 'brown sugar', quantity: '1 cup' },
      { name: 'granulated sugar', quantity: '1/4 cup' },
      { name: 'large eggs', quantity: '2' },
      { name: 'vanilla extract', quantity: '2 tsp' },
      { name: 'all-purpose flour', quantity: '2 1/4 cups' },
      { name: 'baking soda', quantity: '1 tsp' },
      { name: 'salt', quantity: '1 tsp' },
      { name: 'dark chocolate chips', quantity: '1 1/2 cups' },
      { name: 'flaky sea salt, for topping', quantity: '1/2 tsp' },
    ],
    steps: [
      'Brown the butter in a saucepan over medium heat until nutty and golden; cool slightly.',
      'Whisk brown butter with both sugars until glossy, then beat in eggs and vanilla.',
      'Fold in flour, baking soda, and salt until just combined.',
      'Fold in chocolate chips. Chill dough for at least 30 minutes.',
      'Scoop onto a lined tray, top with flaky salt, and bake at 190°C (375°F) for 10-12 minutes.',
      'Cool on the tray for 5 minutes before transferring to a rack.',
    ],
  },
  {
    authorIndex: 0,
    title: '15-Minute Garlic Ginger Fried Rice',
    description: 'The fastest way to turn leftover rice into dinner — endlessly adaptable to what you have on hand.',
    cuisine: 'Chinese',
    difficulty: 'easy',
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    servings: 3,
    tags: ['quick', 'weeknight', 'rice', 'leftovers'],
    ingredients: [
      { name: 'cold cooked rice', quantity: '3 cups' },
      { name: 'garlic cloves, minced', quantity: '3' },
      { name: 'ginger, minced', quantity: '1 tbsp' },
      { name: 'eggs, beaten', quantity: '2' },
      { name: 'soy sauce', quantity: '3 tbsp' },
      { name: 'sesame oil', quantity: '1 tsp' },
      { name: 'scallions, sliced', quantity: '3' },
      { name: 'frozen peas and carrots', quantity: '1 cup' },
    ],
    steps: [
      'Heat oil in a wok over high heat. Scramble the eggs, then remove and set aside.',
      'Add garlic and ginger to the wok; stir-fry 30 seconds until fragrant.',
      'Add cold rice, breaking up clumps, and stir-fry 3-4 minutes until heated through.',
      'Add peas and carrots, soy sauce, and sesame oil; toss to combine.',
      'Fold the scrambled egg back in, top with scallions, and serve.',
    ],
  },
  {
    authorIndex: 1,
    title: 'Roasted Tomato Basil Soup',
    description: 'Deep, caramelized tomato flavor from roasting instead of simmering — a cozy classic upgraded.',
    cuisine: 'Italian',
    difficulty: 'easy',
    prepTimeMinutes: 10,
    cookTimeMinutes: 40,
    servings: 4,
    tags: ['soup', 'vegetarian', 'comfort-food', 'tomato'],
    ingredients: [
      { name: 'ripe tomatoes, halved', quantity: '1.5kg' },
      { name: 'garlic cloves, unpeeled', quantity: '6' },
      { name: 'olive oil', quantity: '1/4 cup' },
      { name: 'yellow onion, chopped', quantity: '1' },
      { name: 'vegetable stock', quantity: '2 cups' },
      { name: 'fresh basil leaves', quantity: '1 cup' },
      { name: 'heavy cream (optional)', quantity: '1/4 cup' },
      { name: 'salt and pepper', quantity: 'to taste' },
    ],
    steps: [
      'Toss tomatoes and garlic with olive oil; roast at 220°C (425°F) for 30 minutes.',
      'Sauté the onion in a pot until soft, about 5 minutes.',
      'Squeeze the roasted garlic from its skins and add to the pot with the roasted tomatoes and stock.',
      'Simmer 10 minutes, then blend until smooth.',
      'Stir in basil and cream if using; season with salt and pepper.',
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding.');

  if (FORCE) {
    await Promise.all([User.deleteMany({}), Recipe.deleteMany({})]);
    console.log('Cleared existing users and recipes (--force).');
  } else {
    const existing = await Recipe.countDocuments();
    if (existing > 0) {
      console.log(`Database already has ${existing} recipe(s). Run "node seed.js --force" to wipe and reseed.`);
      await mongoose.disconnect();
      return;
    }
  }

  const createdUsers = [];
  for (const u of users) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create(u);
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
    createdUsers.push(user);
  }

  for (const r of recipeSeeds) {
    const author = createdUsers[r.authorIndex];
    const { authorIndex, ...recipeData } = r;
    await Recipe.create({
      ...recipeData,
      author: author._id,
      authorName: author.name,
    });
    console.log(`Created recipe: ${r.title}`);
  }

  console.log('\nSeeding complete.');
  console.log('Sample login — email: priya@example.com, password: password123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
