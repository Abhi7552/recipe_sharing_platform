import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const emptyIngredient = () => ({ name: '', quantity: '' });

export default function CreateRecipe() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('');
  const [cookTimeMinutes, setCookTimeMinutes] = useState('');
  const [servings, setServings] = useState('4');
  const [tagsInput, setTagsInput] = useState('');
  const [ingredients, setIngredients] = useState([emptyIngredient()]);
  const [steps, setSteps] = useState(['']);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateIngredient(index, field, value) {
    setIngredients((list) => list.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  }

  function updateStep(index, value) {
    setSteps((list) => list.map((s, i) => (i === index ? value : s)));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const cleanIngredients = ingredients.filter((i) => i.name.trim());
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);

    if (!title.trim()) return setError('Give the recipe a title.');
    if (cleanIngredients.length === 0) return setError('Add at least one ingredient.');
    if (cleanSteps.length === 0) return setError('Add at least one step.');

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('cuisine', cuisine);
      formData.append('difficulty', difficulty);
      formData.append('prepTimeMinutes', prepTimeMinutes || 0);
      formData.append('cookTimeMinutes', cookTimeMinutes || 0);
      formData.append('servings', servings || 1);
      formData.append('ingredients', JSON.stringify(cleanIngredients));
      formData.append('steps', JSON.stringify(cleanSteps));
      formData.append(
        'tags',
        JSON.stringify(
          tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        )
      );
      if (imageFile) formData.append('image', imageFile);

      const res = await client.post('/recipes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/recipes/${res.data.recipe._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the recipe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="label-eyebrow">Share a recipe</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Write it down, pass it on</h1>
      <p className="mt-2 text-sm text-ink/55">
        The details you add here — ingredients, tags, cuisine — are what make your recipe easy to find.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-tomato/30 bg-tomato/5 px-4 py-3 text-sm text-tomato-dark">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Photo */}
        <div>
          <label className="label-eyebrow mb-2 block">Photo</label>
          <label className="flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-ink/20 bg-white/40 transition-colors hover:border-basil/50">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm text-ink/45">Click to upload a photo (JPEG, PNG, WEBP — max 5MB)</span>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* Basics */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-eyebrow mb-2 block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Grandma's Sunday ragù" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-eyebrow mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input-field"
              placeholder="A short, mouth-watering summary"
            />
          </div>
          <div>
            <label className="label-eyebrow mb-2 block">Cuisine</label>
            <input value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="input-field" placeholder="Italian" />
          </div>
          <div>
            <label className="label-eyebrow mb-2 block">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Ambitious</option>
            </select>
          </div>
          <div>
            <label className="label-eyebrow mb-2 block">Prep time (min)</label>
            <input type="number" min="0" value={prepTimeMinutes} onChange={(e) => setPrepTimeMinutes(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-eyebrow mb-2 block">Cook time (min)</label>
            <input type="number" min="0" value={cookTimeMinutes} onChange={(e) => setCookTimeMinutes(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-eyebrow mb-2 block">Servings</label>
            <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-eyebrow mb-2 block">Tags (comma-separated)</label>
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input-field" placeholder="weeknight, vegetarian" />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="label-eyebrow block">Ingredients</label>
            <button type="button" onClick={() => setIngredients((l) => [...l, emptyIngredient()])} className="font-mono text-xs text-basil hover:underline">
              + Add ingredient
            </button>
          </div>
          <div className="space-y-2.5">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(i, 'quantity', e.target.value)}
                  placeholder="200g"
                  className="input-field !w-28 font-mono text-sm"
                />
                <input
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                  placeholder="ingredient name"
                  className="input-field flex-1"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIngredients((l) => l.filter((_, idx) => idx !== i))}
                    className="rounded-lg px-3 text-ink/40 hover:text-tomato"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="label-eyebrow block">Method</label>
            <button type="button" onClick={() => setSteps((l) => [...l, ''])} className="font-mono text-xs text-basil hover:underline">
              + Add step
            </button>
          </div>
          <div className="space-y-2.5">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="mt-2.5 shrink-0 font-mono text-xs text-ink/40">{i + 1}</span>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                  placeholder="Describe this step"
                  rows={2}
                  className="input-field flex-1"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSteps((l) => l.filter((_, idx) => idx !== i))}
                    className="rounded-lg px-3 text-ink/40 hover:text-tomato"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto disabled:opacity-50">
          {submitting ? 'Publishing…' : 'Publish recipe'}
        </button>
      </form>
    </div>
  );
}
