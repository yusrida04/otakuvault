import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const TYPE_COLORS = {
  anime: 'badge-anime',
  manhwa: 'badge-manhwa',
  manga: 'badge-manga',
  game: 'badge-game',
  comic: 'badge-comic',
};

const STATUS_LABELS = {
  watching: 'Watching',
  completed: 'Completed',
  dropped: 'Dropped',
  plan_to_watch: 'Plan to Watch',
  on_hold: 'On Hold',
  playing: 'Playing',
  played: 'Played',
};

export default function MediaCard({ media, collectionEntry, onCollectionUpdate }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    watch_status: collectionEntry?.watch_status || 'plan_to_watch',
    progress: collectionEntry?.progress || 0,
    rating: collectionEntry?.rating || '',
    is_favorite: collectionEntry?.is_favorite || false,
  });

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (collectionEntry) {
        await api.patch(`/collections/${collectionEntry.id}`, form);
      } else {
        await api.post('/collections', { media_id: media.id, ...form });
      }
      onCollectionUpdate?.();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!collectionEntry) return;
    setLoading(true);
    try {
      await api.delete(`/collections/${collectionEntry.id}`);
      onCollectionUpdate?.();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = media.type === 'game'
    ? ['plan_to_watch', 'playing', 'played', 'dropped', 'on_hold']
    : ['plan_to_watch', 'watching', 'completed', 'dropped', 'on_hold'];

  return (
    <>
      <div className="group relative glass rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/30">
        {/* Cover */}
        <Link to={`/media/${media.id}`}>
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={media.cover_url || `https://picsum.photos/seed/${media.id}/300/400`}
              alt={media.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.src = `https://picsum.photos/seed/${media.id}x/300/400`; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-80" />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
              <span className={`badge ${TYPE_COLORS[media.type] || 'badge-anime'}`}>{media.type}</span>
            </div>

            {/* Favorite star */}
            {collectionEntry?.is_favorite && (
              <div className="absolute top-2 right-2 text-yellow-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            )}

            {/* Progress bar */}
            {collectionEntry && media.total_episodes && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                <div
                  className="h-full bg-primary-500 transition-all"
                  style={{ width: `${Math.min(100, (collectionEntry.progress / media.total_episodes) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="p-3">
          <Link to={`/media/${media.id}`} className="block">
            <h3 className="font-display font-semibold text-white text-sm leading-tight line-clamp-2 hover:text-primary-400 transition-colors mb-1">
              {media.title}
            </h3>
          </Link>

          {collectionEntry && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              collectionEntry.watch_status === 'completed' || collectionEntry.watch_status === 'played' ? 'bg-green-500/20 text-green-400' :
              collectionEntry.watch_status === 'watching' || collectionEntry.watch_status === 'playing' ? 'bg-blue-500/20 text-blue-400' :
              collectionEntry.watch_status === 'dropped' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {STATUS_LABELS[collectionEntry.watch_status]}
            </span>
          )}

          {collectionEntry?.rating && (
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs text-yellow-400 font-semibold">{collectionEntry.rating}</span>
            </div>
          )}
        </div>

        {/* Add/Edit button */}
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-primary-600/80 hover:bg-primary-500 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            title={collectionEntry ? 'Edit' : 'Add to List'}
          >
            {collectionEntry ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm border border-white/10 animate-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-white mb-4">{media.title}</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Status</label>
                <select
                  className="input-field bg-dark-850"
                  value={form.watch_status}
                  onChange={e => setForm(f => ({ ...f, watch_status: e.target.value }))}
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {media.total_episodes && (
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">
                    Progress ({form.progress} / {media.total_episodes})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={media.total_episodes}
                    className="input-field bg-dark-850"
                    value={form.progress}
                    onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Rating (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  className="input-field bg-dark-850"
                  placeholder="Leave blank to skip"
                  value={form.rating}
                  onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_favorite}
                  onChange={e => setForm(f => ({ ...f, is_favorite: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/20 text-primary-500 bg-white/5 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-300">Add to Favorites ⭐</span>
              </label>
            </div>

            <div className="flex gap-2 mt-6">
              {collectionEntry && (
                <button onClick={handleRemove} disabled={loading} className="btn-danger flex-1">
                  Remove
                </button>
              )}
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                {loading ? '...' : collectionEntry ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
