const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Escapes RegExp special characters in user-supplied search terms before building
// a $regex filter, preventing regex-injection and ReDoS via crafted query params.
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/recipes - list + search + filter
// Query params: q (text search), ingredient, tag, cuisine, difficulty, sort, page, limit
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q, ingredient, tag, cuisine, difficulty, author, sort = 'newest', page = 1, limit = 12 } = req.query;
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (ingredient) filter['ingredients.name'] = { $regex: escapeRegex(ingredient), $options: 'i' };
    if (tag) filter.tags = String(tag).toLowerCase();
    if (cuisine) filter.cuisine = { $regex: `^${escapeRegex(cuisine)}$`, $options: 'i' };
    if (difficulty) filter.difficulty = difficulty;
    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return res.status(400).json({ message: 'Invalid author id.' });
      }
      filter.author = author;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      rating: { averageRating: -1, ratingCount: -1 },
      quickest: { prepTimeMinutes: 1, cookTimeMinutes: 1 },
    };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-reviews'),
      Recipe.countDocuments(filter),
    ]);

    res.json({
      recipes,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) || 1 },
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load recipes right now.' });
  }
});

// GET /api/recipes/tags - distinct tag list, for filter chips
router.get('/tags', async (_req, res) => {
  try {
    const tags = await Recipe.distinct('tags');
    res.json({ tags: tags.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ message: 'Could not load tags.' });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    res.json({ recipe });
  } catch (err) {
    res.status(404).json({ message: 'Recipe not found.' });
  }
});

const recipeValidators = [
  body('title').trim().notEmpty().withMessage('Give the recipe a title.'),
  body('ingredients').custom((v) => {
    const list = typeof v === 'string' ? JSON.parse(v) : v;
    if (!Array.isArray(list) || list.length === 0) throw new Error('Add at least one ingredient.');
    return true;
  }),
  body('steps').custom((v) => {
    const list = typeof v === 'string' ? JSON.parse(v) : v;
    if (!Array.isArray(list) || list.length === 0) throw new Error('Add at least one step.');
    return true;
  }),
];

// POST /api/recipes - create (with optional image upload)
router.post('/', requireAuth, upload.single('image'), recipeValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const {
      title,
      description,
      ingredients,
      steps,
      tags,
      cuisine,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      difficulty,
    } = req.body;

    const recipe = await Recipe.create({
      title,
      description,
      author: req.user._id,
      authorName: req.user.name,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      ingredients: typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients,
      steps: typeof steps === 'string' ? JSON.parse(steps) : steps,
      tags: (typeof tags === 'string' ? JSON.parse(tags) : tags || []).map((t) => t.toLowerCase()),
      cuisine,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      difficulty,
    });

    res.status(201).json({ recipe });
  } catch (err) {
    res.status(500).json({ message: 'Could not save the recipe. Please try again.' });
  }
});

// PUT /api/recipes/:id - update (author only)
router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    if (String(recipe.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the recipe author can edit this recipe.' });
    }

    const fields = [
      'title',
      'description',
      'cuisine',
      'prepTimeMinutes',
      'cookTimeMinutes',
      'servings',
      'difficulty',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) recipe[f] = req.body[f];
    });
    if (req.body.ingredients) {
      recipe.ingredients = typeof req.body.ingredients === 'string' ? JSON.parse(req.body.ingredients) : req.body.ingredients;
    }
    if (req.body.steps) {
      recipe.steps = typeof req.body.steps === 'string' ? JSON.parse(req.body.steps) : req.body.steps;
    }
    if (req.body.tags) {
      const tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      recipe.tags = tags.map((t) => t.toLowerCase());
    }
    if (req.file) recipe.imageUrl = `/uploads/${req.file.filename}`;

    await recipe.save();
    res.json({ recipe });
  } catch (err) {
    res.status(500).json({ message: 'Could not update the recipe. Please try again.' });
  }
});

// DELETE /api/recipes/:id - author only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    if (String(recipe.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the recipe author can delete this recipe.' });
    }
    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete the recipe.' });
  }
});

// POST /api/recipes/:id/reviews - add or update a rating/review
router.post(
  '/:id/reviews',
  requireAuth,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
    body('comment').optional().isLength({ max: 500 }).withMessage('Keep comments under 500 characters.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });

      const existing = recipe.reviews.find((r) => String(r.user) === String(req.user._id));
      if (existing) {
        existing.rating = req.body.rating;
        existing.comment = req.body.comment || '';
      } else {
        recipe.reviews.push({
          user: req.user._id,
          userName: req.user.name,
          rating: req.body.rating,
          comment: req.body.comment || '',
        });
      }
      recipe.recalculateRating();
      await recipe.save();
      res.status(201).json({ recipe });
    } catch (err) {
      res.status(500).json({ message: 'Could not save your review.' });
    }
  }
);

module.exports = router;
