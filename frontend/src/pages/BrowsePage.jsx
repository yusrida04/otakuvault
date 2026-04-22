import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import MediaCard from '../components/ui/MediaCard';

const TYPES = ['all', 'anime', 'manhwa', 'manga', 'game', 'comic'];
const TYPE_EMOJI = { anime: '🎌', manhwa: '📖', manga: '📚', game: '🎮', comic: '💥', all: '🌐' };

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [collection, setCollection] = useState({});

  const activeType = searchParams.get('type') || 'all';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (activeType !== 'all') params.append('type', activeType);
      if (search) params.append('search', search);

      const res = await api.get(`/media?${params}`);
      setMedia(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search titles..."
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
            {type}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="glass rounded-2xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">😔</p>
          <p className="text-gray-400 text-lg">No media found</p>
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
          <button
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
            className="btn-secondary py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                    p === page ? 'bg-primary-600 text-white' : 'glass-hover text-gray-400'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => changePage(page + 1)}
            disabled={page >= pagination.totalPages}
            className="btn-secondary py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
