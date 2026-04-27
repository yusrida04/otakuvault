import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import MediaCard from '../components/ui/MediaCard';
import MALSync from '../components/ui/MALSync';

const STATUS_TABS = [
  { key: 'all', label: '🌐 All', },
  { key: 'watching', label: '▶️ Watching' },
  { key: 'playing', label: '🎮 Playing' },
  { key: 'completed', label: '✅ Completed' },
  { key: 'played', label: '🏆 Played' },
  { key: 'plan_to_watch', label: '📋 Planned' },
  { key: 'dropped', label: '❌ Dropped' },
  { key: 'on_hold', label: '⏸️ On Hold' },
];

export default function CollectionPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (activeStatus !== 'all') params.set('watch_status', activeStatus);
      if (activeType !== 'all') params.set('type', activeType);
      const res = await api.get(`/collections?${params}`);
      setItems(res.data.data);

      const statsRes = await api.get('/collections/stats');
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeStatus, activeType]);

  useEffect(() => { fetchCollection(); }, [fetchCollection]);

  const filtered = search
    ? items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()))
    : items;

  const totalItems = stats?.by_status?.reduce((sum, s) => sum + parseInt(s.count), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">My Collection</h1>
        <p className="text-gray-400 mt-1">{totalItems} items in your vault</p>
      </div>
      {/* ← TAMBAH INI */}
      <div className="ml-auto">
        <MALSync onSyncComplete={fetchCollection} />
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stats.by_type?.map(t => (
            <div key={t.type} className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-display font-bold text-white">{t.count}</p>
              <p className="text-xs text-gray-400 capitalize">{t.type}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeStatus === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'glass-hover text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {/* Type filter */}
          <div className="flex gap-1">
            {['all', 'anime', 'manhwa', 'manga', 'game', 'comic'].map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  activeType === type ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search collection..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field max-w-xs py-1.5 text-sm ml-auto"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-xl font-display text-gray-400 mb-2">Your vault is empty!</p>
          <p className="text-gray-500 text-sm mb-6">Browse media and add them to your collection.</p>
          <a href="/browse" className="btn-primary inline-block">Browse Media</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map(item => (
            <MediaCard
              key={item.id}
              media={{
                id: item.media_id,
                title: item.title,
                type: item.type,
                cover_url: item.cover_url,
                genre: item.genre,
                total_episodes: item.total_episodes,
                studio: item.studio,
                release_year: item.release_year,
              }}
              collectionEntry={item}
              onCollectionUpdate={fetchCollection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
