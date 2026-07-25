import { useState } from 'react';

export default function SearchBar({ onSearch, onIngredientSearch }) {
  const [mode, setMode] = useState('recipe'); // 'recipe' | 'ingredient'
  const [term, setTerm] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!term.trim()) return;
    if (mode === 'recipe') onSearch(term.trim());
    else onIngredientSearch(term.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
      <div className="flex items-center gap-1 rounded-full border border-ink/15 bg-white/60 p-1 font-mono text-xs">
        <button
          type="button"
          onClick={() => setMode('recipe')}
          className={`rounded-full px-3 py-2 transition-colors ${
            mode === 'recipe' ? 'bg-basil text-paper' : 'text-ink/60 hover:text-ink'
          }`}
        >
          By recipe
        </button>
        <button
          type="button"
          onClick={() => setMode('ingredient')}
          className={`rounded-full px-3 py-2 transition-colors ${
            mode === 'ingredient' ? 'bg-basil text-paper' : 'text-ink/60 hover:text-ink'
          }`}
        >
          By ingredient
        </button>
      </div>
      <div className="flex flex-1 gap-2">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={mode === 'recipe' ? 'Search recipes, tags, cuisines…' : "What's in your fridge? e.g. basil"}
          className="input-field !rounded-full !bg-white"
        />
        <button type="submit" className="btn-primary !px-5 !py-2.5 shrink-0">
          Search
        </button>
      </div>
    </form>
  );
}
