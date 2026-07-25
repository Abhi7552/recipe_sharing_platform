import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-10">
      <p className="label-eyebrow">Welcome back</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Sign in</h1>

      {error && <p className="mt-5 rounded-lg border border-tomato/30 bg-tomato/5 px-4 py-3 text-sm text-tomato-dark">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label-eyebrow mb-2 block">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-eyebrow mb-2 block">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/55">
        New here?{' '}
        <Link to="/register" className="font-semibold text-basil hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
