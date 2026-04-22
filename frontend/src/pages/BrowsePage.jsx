import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MediaCard from '../components/ui/MediaCard';

const TYPES = ['all', 'anime', 'manhwa', 'manga', 'game', 'comic'];
const TYPE_EMOJI = { anime: '🎌', manhwa: '📖', manga: '📚', game: '🎮', comic: '💥', all: '🌐' };

// ── AddMediaModal ──────────────────────────────────────────────────────────────

function AddMediaModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '', type: 'anime', genre: '', description: '',
    cover_url: '', total_episodes: '', status: 'ongoing',
    release_year: new Date().getFullYear(), studio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Judul wajib diisi!'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/media', {
        ...form,
        total_episodes: form.total_episodes ? parseInt(form.total_episodes) : null,
        release_year:   form.release_year   ? parseInt(form.release_year)   : null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-lg border border-white/10 animate-in max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-white">➕ Tambah Media Baru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm mb-4">{error}</div>}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Judul *</label>
            <input type="text" placeholder="e.g. Solo Leveling" className="input-field" value={form.title} onChange={set('title')} />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Tipe *</label>
              <select className="input-field" value={form.type} onChange={set('type')}>
                {TYPES.filter(t => t !== 'all').map(t => (
                  <option key={t} value={t}>{TYPE_EMOJI[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Status</label>
              <select className="input-field" value={form.status} onChange={set('status')}>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Genre + Studio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Genre</label>
              <input type="text" placeholder="Action, Fantasy" className="input-field" value={form.genre} onChange={set('genre')} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Studio / Dev</label>
              <input type="text" placeholder="MAPPA, FromSoftware" className="input-field" value={form.studio} onChange={set('studio')} />
            </div>
          </div>

          {/* Episodes + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">
                {form.type === 'game' ? 'Estimasi Jam' : form.type === 'manhwa' || form.type === 'manga' || form.type === 'comic' ? 'Jumlah Chapter' : 'Jumlah Episode'}
              </label>
              <input type="number" min="1" placeholder="opsional" className="input-field" value={form.total_episodes} onChange={set('total_episodes')} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Tahun Rilis</label>
              <input type="number" min="1900" max={new Date().getFullYear() + 2} className="input-field" value={form.release_year} onChange={set('release_year')} />
            </div>
          </div>

          {/* Cover URL + preview */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">🖼️ URL Cover</label>
            <input type="url" placeholder="https://contoh.com/cover.jpg" className="input-field" value={form.cover_url} onChange={set('cover_url')} />
            {form.cover_url && (
              <div className="mt-2 w-16 rounded-lg overflow-hidden ring-1 ring-white/10">
                <img src={form.cover_url} alt="preview" className="w-full aspect-[3/4] object-cover"
                  onError={e => { e.target.parentElement.style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Sinopsis</label>
            <textarea rows={3} placeholder="Ceritakan singkat tentang media ini..." className="input-field resize-none text-sm" value={form.description} onChange={set('description')} />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5">Batal</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-2.5">
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</span>
              : '➕ Tambah Media'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main BrowsePage ────────────────────────────────────────────────────────────

export default function BrowsePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [media, setMedia]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch]       = useState('');
  const [collection, setCollection] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  const activeType = searchParams.get('type') || 'all';
  const page       = parseInt(searchParams.get('page') || '1');

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (activeType !== 'all') params.append('type', activeType);
      if (search) params.append('search', search);
      const res = await api.get(`/media?${params}`);
      setMedia(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [activeType, page, search]);

  const fetchCollection = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/collections?limit=100');
      const map = {};
      res.data.data.forEach(item => { map[item.media_id] = item; });
      setCollection(map);
    } catch {}
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);
  useEffect(() => { fetchCollection(); }, [fetchCollection]);

  const handleTypeChange = (type) => {
    const p = new URLSearchParams();
    if (type !== 'all') p.set('type', type);
    p.set('page', '1');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    p.set('page', '1');
    if (search) p.set('search', search); else p.delete('search');
    setSearchParams(p);
  };

  const changePage = (newPage) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', newPage);
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Browse</h1>
          <p className="text-gray-400 mt-1">{pagination.total} titles available</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Cari judul..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field max-w-xs py-2"
            />
            <button type="submit" className="btn-primary py-2 px-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Tombol tambah — hanya kalau login */}
          {user && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-accent py-2 px-4 flex items-center gap-2 text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah
            </button>
          )}
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(type => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 capitalize flex items-center gap-1.5 ${
              activeType === type
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                : 'glass-hover text-gray-400'
            }`}
          >
            <span>{TYPE_EMOJI[type]}</span>
            {type === 'all' ? 'Semua' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="glass rounded-2xl aspect-[3/4] animate-pulse" />)}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">😔</p>
          <p className="text-gray-400 text-lg">Tidak ada media ditemukan</p>
          {user && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary mt-4 inline-block">
              ➕ Tambah Media Baru
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map(m => (
            <MediaCard
              key={m.id}
              media={m}
              collectionEntry={collection[m.id]}
              onCollectionUpdate={fetchCollection}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button onClick={() => changePage(page - 1)} disabled={page <= 1} className="btn-secondary py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => changePage(p)}
                  className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${p === page ? 'bg-primary-600 text-white' : 'glass-hover text-gray-400'}`}>
                  {p}
                </button>
              );
            })}
          </div>
          <button onClick={() => changePage(page + 1)} disabled={page >= pagination.totalPages} className="btn-secondary py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
        </div>
      )}

      {/* Add Media Modal */}
      {showAddModal && (
        <AddMediaModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { fetchMedia(); setShowAddModal(false); }}
        />
      )}
    </div>
  );
}