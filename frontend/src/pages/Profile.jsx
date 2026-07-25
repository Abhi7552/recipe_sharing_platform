import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';

export default function Profile() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    client
      .get('/recipes', { params: { author: user.id, limit: 50, sort: 'newest' } })
      .then((res) => setRecipes(res.data.recipes))
      .finally(() => setLoading(false));
  }, [user]);

  const totalRatings = recipes.reduce((sum, r) => sum + r.ratingCount, 0);
  const avg =
    recipes.length > 0
      ? (recipes.reduce((sum, r) => sum + r.averageRating * r.ratingCount, 0) / (totalRatings || 1)).toFixed(1)
      : '—';

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center gap-6 border-b border-ink/10 pb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-basil font-display text-2xl text-paper">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="label-eyebrow">My kitchen</p>
          <h1 className="font-display text-3xl font-semibold text-ink">{user?.name}</h1>
          <p className="mt-1 font-mono text-xs text-ink/45">{user?.email}</p>
        </div>
        <div className="ml-auto flex gap-8">
          <div className="text-center">
            <p className="font-display text-2xl font-semibold text-basil">{recipes.length}</p>
            <p className="font-mono text-xs text-ink/45">Recipes</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-semibold text-saffron-dark">{avg}</p>
            <p className="font-mono text-xs text-ink/45">Avg. rating</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="label-eyebrow">Loading your recipes…</p>
        ) : recipes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/20 py-16 text-center">
            <p className="font-display text-xl text-ink/60">You haven't shared a recipe yet.</p>
            <p className="mt-1 text-sm text-ink/45">Your first one could be someone else's new favorite.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
