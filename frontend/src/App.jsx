import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-paper bg-grain">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-xl px-5 py-24 text-center">
                <p className="font-display text-3xl text-ink/60">Page not found.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="border-t border-ink/10 py-8">
        <p className="text-center font-mono text-xs text-ink/40">
          The Shared Table — cooked up with React, Express, and MongoDB.
        </p>
      </footer>
    </div>
  );
}
