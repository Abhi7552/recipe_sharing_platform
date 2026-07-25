import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState({});

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await client.get(`/recipes/${id}`);
      setRecipe(res.data.recipe);
      if (user) {
        const mine = res.data.recipe.reviews.find((r) => r.user === user.id || r.user?._id === user.id);
        if (mine) {
          setMyRating(mine.rating);
          setMyComment(mine.comment);
        }
      }
    } catch (err) {
      setError('This recipe could not be found.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
    try {
      await client.delete(`/recipes/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete the recipe.');
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    if (myRating === 0) return;
    setSubmitting(true);
    try {
      const res = await client.post(`/recipes/${id}/reviews`, { rating: myRating, comment: myComment });
      setRecipe(res.data.recipe);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save your review.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <p className="label-eyebrow">Loading recipe…</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <p className="font-display text-2xl text-ink/60">{error}</p>
        <Link to="/" className="btn-secondary mt-6 inline-flex">
          Back to browsing
        </Link>
      </div>
    );
  }

  const isAuthor = user && (user.id === recipe.author || user.id === recipe.author?._id);
  const scale = (amount) => {
    if (servingsMultiplier === 1) return amount;
    const num = parseFloat(amount);
    if (Number.isNaN(num)) return amount;
    const scaled = num * servingsMultiplier;
    return Number.isInteger(scaled) ? scaled : scaled.toFixed(2).replace(/\.00$/, '');
  };

  return (
    <article className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-ink/50 hover:text-ink">
        ← Back to browsing
      </Link>

      <div className="card-stitch overflow-hidden rounded-2xl border border-ink/10 shadow-card">
        <div className="h-72 w-full bg-paperDeep sm:h-96">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-paperDeep to-sage/40">
              <span className="font-display text-4xl italic text-ink/25">no photo yet</span>
            </div>
          )}
        </div>

        <div className="px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label-eyebrow">{recipe.cuisine || 'Home kitchen'} · {recipe.difficulty}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{recipe.title}</h1>
              <p className="mt-1 font-mono text-xs text-ink/45">by {recipe.authorName}</p>
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                <button onClick={handleDelete} className="btn-secondary !border-tomato/40 !text-tomato-dark !px-4 !py-2 text-sm">
                  Delete
                </button>
              </div>
            )}
          </div>

          {recipe.description && <p className="mt-4 max-w-2xl text-ink/70 leading-relaxed">{recipe.description}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-6 border-y border-ink/10 py-4 font-mono text-sm text-ink/60">
            <span><RatingStars value={recipe.averageRating} size={16} /></span>
            <span>{recipe.ratingCount} rating{recipe.ratingCount !== 1 ? 's' : ''}</span>
            <span>Prep {recipe.prepTimeMinutes}m</span>
            <span>Cook {recipe.cookTimeMinutes}m</span>
            <span>Serves {Math.round(recipe.servings * servingsMultiplier)}</span>
          </div>

          {recipe.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span key={tag} className="ingredient-pill">{tag}</span>
              ))}
            </div>
          )}

          <div className="mt-10 grid gap-10 sm:grid-cols-[1fr_1.4fr]">
            {/* Ingredients */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-ink">Ingredients</h2>
                <div className="flex items-center gap-1 rounded-full border border-ink/15 bg-white/60 p-1 font-mono text-xs">
                  {[0.5, 1, 2].map((m) => (
                    <button
                      key={m}
                      onClick={() => setServingsMultiplier(m)}
                      className={`rounded-full px-2.5 py-1 transition-colors ${
                        servingsMultiplier === m ? 'bg-saffron text-ink' : 'text-ink/50 hover:text-ink'
                      }`}
                    >
                      {m}×
                    </button>
                  ))}
                </div>
              </div>
              <ul className="space-y-2.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-baseline gap-2 text-sm text-ink/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-tomato" />
                    <span>
                      {ing.quantity && <span className="font-mono text-basil-dark">{scale(ing.quantity)} </span>}
                      {ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h2 className="mb-4 font-display text-xl font-semibold text-ink">Method</h2>
              <ol className="space-y-4">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <button
                      onClick={() => setCheckedSteps((s) => ({ ...s, [i]: !s[i] }))}
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors ${
                        checkedSteps[i]
                          ? 'border-basil bg-basil text-paper'
                          : 'border-ink/20 text-ink/50 hover:border-basil/50'
                      }`}
                    >
                      {checkedSteps[i] ? '✓' : i + 1}
                    </button>
                    <p className={`pt-0.5 text-sm leading-relaxed ${checkedSteps[i] ? 'text-ink/35 line-through' : 'text-ink/80'}`}>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-12 border-t border-ink/10 pt-8">
            <h2 className="mb-5 font-display text-xl font-semibold text-ink">
              Reviews {recipe.reviews.length > 0 && `(${recipe.reviews.length})`}
            </h2>

            {user ? (
              <form onSubmit={submitReview} className="mb-8 rounded-xl border border-ink/10 bg-white/50 p-5">
                <p className="label-eyebrow mb-2">Your rating</p>
                <RatingStars value={myRating} size={22} interactive onChange={setMyRating} />
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  placeholder="What did you think? Any tweaks you made?"
                  rows={3}
                  className="input-field mt-3"
                />
                <button type="submit" disabled={submitting || myRating === 0} className="btn-primary mt-3 !px-5 !py-2 text-sm disabled:opacity-50">
                  {submitting ? 'Saving…' : 'Save review'}
                </button>
              </form>
            ) : (
              <p className="mb-8 text-sm text-ink/50">
                <Link to="/login" className="font-semibold text-basil underline">Sign in</Link> to rate and review this recipe.
              </p>
            )}

            <div className="space-y-5">
              {recipe.reviews.length === 0 && (
                <p className="text-sm text-ink/45">No reviews yet — be the first to cook this one.</p>
              )}
              {recipe.reviews.map((r) => (
                <div key={r._id} className="border-b border-ink/5 pb-5 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-ink">{r.userName}</span>
                    <RatingStars value={r.rating} size={13} />
                  </div>
                  {r.comment && <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
