import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'rating', label: 'Top rated' },
  { key: 'quickest', label: 'Quickest' },
];

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('newest');
  const [query, setQuery] = useState({ q: '', ingredient: '', tag: '' });
  const [tags, setTags] = useState([]);

  const fetchRecipes = useCallback(async (params, page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/recipes', { params: { ...params, sort, page } });
      setRecipes(res.data.recipes);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('The kitchen is quiet — recipes could not load. Is the API server running?');
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchRecipes(query);
  }, [sort]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    client
      .get('/recipes/tags')
      .then((res) => setTags(res.data.tags.slice(0, 10)))
      .catch(() => {});
  }, []);

  function handleSearch(term) {
    const next = { q: term, ingredient: '', tag: '' };
    setQuery(next);
    fetchRecipes(next);
  }

  function handleIngredientSearch(term) {
    const next = { q: '', ingredient: term, tag: '' };
    setQuery(next);
    fetchRecipes(next);
  }

  function handleTagClick(tag) {
    const isActive = query.tag === tag;
    const next = { q: '', ingredient: '', tag: isActive ? '' : tag };
    setQuery(next);
    fetchRecipes(next);
  }

  function handlePage(newPage) {
    fetchRecipes(query, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/10 bg-grain">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="label-eyebrow mb-4">A recipe box, reimagined</p>
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
                Cook with what's{' '}
                <span className="relative inline-block italic text-basil">
                  already in your kitchen
                </span>
                .
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/65">
                Search recipes by the ingredients you have on hand, rate the ones you love, and
                share your own with a community that cooks the way you do.
              </p>
              <div className="mt-8">
                <SearchBar onSearch={handleSearch} onIngredientSearch={handleIngredientSearch} />
              </div>
              {tags.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-ink/40">Popular:</span>
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`ingredient-pill transition-colors ${
                        query.tag === tag ? '!bg-basil !text-paper !border-basil' : 'hover:!border-basil/50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Signature illustration: a simmering pot, hand-drawn line style */}
            <div className="relative mx-auto hidden max-w-xs lg:block">
              <svg viewBox="0 0 320 320" className="w-full">
                <ellipse cx="160" cy="270" rx="90" ry="10" fill="#2B2420" opacity="0.06" />
                <path d="M75 150h170l-14 90a26 26 0 01-26 22H115a26 26 0 01-26-22z" fill="#3E6244" stroke="#1F3323" strokeWidth="3" />
                <rect x="70" y="138" width="180" height="18" rx="9" fill="#2F4B33" stroke="#1F3323" strokeWidth="3" />
                <path d="M60 147h20M240 147h20" stroke="#1F3323" strokeWidth="6" strokeLinecap="round" />
                <circle cx="120" cy="200" r="4" fill="#E4A628" />
                <circle cx="160" cy="215" r="4" fill="#E4A628" />
                <circle cx="200" cy="198" r="4" fill="#C2461F" />
                <g className="animate-steam" style={{ transformOrigin: '135px 130px' }}>
                  <path d="M135 130c-10-14 10-20 0-34" stroke="#A9BBA0" strokeWidth="4" strokeLinecap="round" fill="none" />
                </g>
                <g className="animate-steam" style={{ transformOrigin: '165px 122px', animationDelay: '0.6s' }}>
                  <path d="M165 122c-10-16 12-22 0-38" stroke="#A9BBA0" strokeWidth="4" strokeLinecap="round" fill="none" />
                </g>
                <g className="animate-steam" style={{ transformOrigin: '195px 130px', animationDelay: '1.1s' }}>
                  <path d="M195 130c-10-14 10-20 0-34" stroke="#A9BBA0" strokeWidth="4" strokeLinecap="round" fill="none" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Browse grid */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {query.tag ? `Tagged “${query.tag}”` : query.ingredient ? `Made with “${query.ingredient}”` : query.q ? `Results for “${query.q}”` : 'From the community'}
          </h2>
          <div className="flex gap-1 rounded-full border border-ink/15 bg-white/60 p-1 font-mono text-xs">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  sort === s.key ? 'bg-saffron text-ink' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-paperDeep" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="rounded-lg border border-tomato/30 bg-tomato/5 px-4 py-3 text-sm text-tomato-dark">{error}</p>
        )}

        {!loading && !error && recipes.length === 0 && (
          <div className="rounded-xl border border-dashed border-ink/20 py-16 text-center">
            <p className="font-display text-xl text-ink/60">Nothing here yet.</p>
            <p className="mt-1 text-sm text-ink/45">Be the first to share a recipe in this category.</p>
          </div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePage(i + 1)}
                    className={`h-9 w-9 rounded-full font-mono text-sm transition-colors ${
                      pagination.page === i + 1
                        ? 'bg-basil text-paper'
                        : 'border border-ink/15 text-ink/60 hover:border-basil/50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
