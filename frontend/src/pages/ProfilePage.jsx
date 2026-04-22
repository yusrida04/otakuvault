import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ bio: user?.bio || '', avatar_url: user?.avatar_url || '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/collections/stats').then(res => setStats(res.data.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/auth/profile', form);
      updateUser(res.data.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalItems = stats?.by_status?.reduce((sum, s) => sum + parseInt(s.count), 0) || 0;
  const completedCount = stats?.by_status
    ?.filter(s => s.watch_status === 'completed' || s.watch_status === 'played')
    .reduce((sum, s) => sum + parseInt(s.count), 0) || 0;

  const STATUS_COLORS = {
    watching: 'bg-blue-500', playing: 'bg-blue-400',
    completed: 'bg-green-500', played: 'bg-green-400',
    dropped: 'bg-red-500', plan_to_watch: 'bg-gray-500', on_hold: 'bg-yellow-500',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {saved && (
        <div className="glass border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm font-medium animate-in">
          ✅ Profile updated successfully!
        </div>
      )}

      {/* Profile card */}
      <div className="glass rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-24 h-24 rounded-2xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-4xl font-display font-bold text-white">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-display font-bold text-white">{user?.username}</h1>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
            <p className="text-gray-500 text-xs mt-1">
              Joined {new Date(user?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
            {user?.bio && !editing && (
              <p className="text-gray-300 mt-3 text-sm">{user.bio}</p>
            )}
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="btn-secondary py-2 px-4 text-sm"
          >
            {editing ? 'Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="mt-6 space-y-4 border-t border-white/10 pt-6 animate-in">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Avatar URL</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://example.com/avatar.jpg"
                value={form.avatar_url}
                onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Bio</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Tell us about your otaku journey..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-display font-bold text-white">{totalItems}</p>
              <p className="text-gray-400 text-xs mt-1">Total in Vault</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-display font-bold text-green-400">{completedCount}</p>
              <p className="text-gray-400 text-xs mt-1">Completed</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-display font-bold text-yellow-400">
                {stats.avg_rating || 'N/A'}
              </p>
              <p className="text-gray-400 text-xs mt-1">Avg Rating</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-display font-bold text-red-400">{stats.favorite_count || 0}</p>
              <p className="text-gray-400 text-xs mt-1">Favorites</p>
            </div>
          </div>

          {/* Status breakdown */}
          {stats.by_status?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-white mb-4">Status Breakdown</h3>
              <div className="space-y-3">
                {stats.by_status.map(s => (
                  <div key={s.watch_status} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s.watch_status] || 'bg-gray-500'}`} />
                    <span className="text-gray-300 text-sm capitalize flex-1">{s.watch_status?.replace(/_/g, ' ')}</span>
                    <span className="font-display font-bold text-white">{s.count}</span>
                    <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COLORS[s.watch_status] || 'bg-gray-500'}`}
                        style={{ width: `${totalItems > 0 ? (s.count / totalItems) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By type */}
          {stats.by_type?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-white mb-4">Collection by Type</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {stats.by_type.map(t => (
                  <div key={t.type} className="text-center">
                    <p className="text-2xl font-display font-bold text-white">{t.count}</p>
                    <p className="text-gray-400 text-xs capitalize">{t.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
