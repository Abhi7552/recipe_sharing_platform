import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `font-body text-sm font-semibold transition-colors ${
      isActive ? 'text-basil' : 'text-ink/70 hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="shrink-0">
            <circle cx="15" cy="15" r="13.5" stroke="#2F4B33" strokeWidth="1.5" />
            <path d="M9 12c0-3 2.5-5.5 6-5.5S21 9 21 12" stroke="#2F4B33" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 15.5h14M8 18.5h14M8 21.5h10" stroke="#E4A628" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            The Shared Table
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" end className={linkClass}>
            Browse
          </NavLink>
          {user && (
            <NavLink to="/create" className={linkClass}>
              Share a recipe
            </NavLink>
          )}
          {user && (
            <NavLink to="/profile" className={linkClass}>
              My kitchen
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden font-mono text-xs text-ink/50 sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn-secondary !px-4 !py-2 text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-body text-sm font-semibold text-ink/70 hover:text-ink">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary !px-5 !py-2.5 text-sm">
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
