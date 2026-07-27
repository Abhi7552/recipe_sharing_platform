const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, maxlength: 500, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    ingredients: {
      type: [ingredientSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    steps: {
      type: [String],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    cuisine: { type: String, trim: true, default: '' },
    prepTimeMinutes: { type: Number, min: 0, default: 0 },
    cookTimeMinutes: { type: Number, min: 0, default: 0 },
    servings: { type: Number, min: 1, default: 1 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

recipeSchema.index({ title: 'text', description: 'text', tags: 'text', 'ingredients.name': 'text' });
recipeSchema.index({ author: 1, createdAt: -1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ averageRating: -1, ratingCount: -1 });

recipeSchema.methods.recalculateRating = function recalculateRating() {
  if (!this.reviews.length) {
    this.averageRating = 0;
    this.ratingCount = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.ratingCount = this.reviews.length;
  this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
};

module.exports = mongoose.model('Recipe', recipeSchema);
