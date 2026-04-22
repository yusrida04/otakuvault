import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl mx-auto mb-4 shadow-xl shadow-primary-900/30">
            OV
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Join OtakuVault</h1>
          <p className="text-gray-400 mt-2">Start tracking your anime, manhwa & games</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 block">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                className="input-field"
                placeholder="coolotaku99"
                value={form.username}
                onChange={set('username')}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 block">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="input-field"
                placeholder="your@email.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 block">Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set('password')}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 block">Confirm Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input-field"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set('confirm')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account 🚀'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Login
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          <Link to="/" className="hover:text-gray-400 transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
