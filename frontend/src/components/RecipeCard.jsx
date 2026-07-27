import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import { resolveImageUrl } from '../utils/resolveImageUrl';

const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Ambitious' };

export default function RecipeCard({ recipe }) {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <Link
      to={`/recipes/${recipe._id}`}
      className="card-stitch group flex flex-col overflow-hidden rounded-xl border border-ink/10 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover"
    >
      <div className="relative h-44 w-full overflow-hidden bg-paperDeep pt-[3px]">
        {recipe.imageUrl ? (
          <img
            src={resolveImageUrl(recipe.imageUrl)}
            alt={recipe.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-paperDeep to-sage/40">
            <span className="font-display text-3xl italic text-ink/25">no photo yet</span>
          </div>
        )}
        {recipe.difficulty && (
          <span className="absolute right-3 top-4 rounded-full bg-ink/85 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-paper">
            {difficultyLabel[recipe.difficulty]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-5 pb-5 pt-4">
        <p className="label-eyebrow">{recipe.cuisine || 'Home kitchen'} · {totalTime > 0 ? `${totalTime} min` : 'Quick'}</p>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink group-hover:text-basil-dark">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink/60">{recipe.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <RatingStars value={recipe.averageRating} size={14} />
            <span className="font-mono text-xs text-ink/45">
              {recipe.ratingCount > 0 ? `${recipe.averageRating} (${recipe.ratingCount})` : 'No ratings yet'}
            </span>
          </div>
          <span className="font-mono text-xs text-ink/45">by {recipe.authorName}</span>
        </div>

        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="ingredient-pill !py-1 !text-[0.65rem]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
