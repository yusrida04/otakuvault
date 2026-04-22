import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import MediaCard from '../components/ui/MediaCard';

const TYPE_COLORS = {
  anime: 'badge-anime', manhwa: 'badge-manhwa', manga: 'badge-manga',
  game: 'badge-game', comic: 'badge-comic',
};

export default function MediaDetailPage() {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [collection, setCollection] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get(`/media/${id}`);
      setMedia(res.data.data);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const colRes = await api.get('/collections?limit=200');
          const entry = colRes.data.data.find(c => c.media_id === parseInt(id));
          setCollection(entry || null);
        } catch {}
      }

      const relatedRes = await api.get(`/media?type=${res.data.data.type}&limit=6`);
      setRelated(relatedRes.data.data.filter(m => m.id !== parseInt(id)).slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!media) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-gray-400">Media not found</p>
      <Link to="/browse" className="btn-primary mt-4 inline-block">Browse</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/browse" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group">
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cover */}
        <div className="md:col-span-1">
          <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
            <img
              src={media.cover_url || `https://picsum.photos/seed/${media.id}/300/400`}
              alt={media.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
          </div>

          {/* Collection status */}
          {collection && (
            <div className="glass rounded-2xl p-4 mt-4 space-y-2">
              <h4 className="font-display font-semibold text-white text-sm">Your Status</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  collection.watch_status === 'completed' || collection.watch_status === 'played' ? 'bg-green-500/20 text-green-400' :
                  collection.watch_status === 'watching' || collection.watch_status === 'playing' ? 'bg-blue-500/20 text-blue-400' :
                  collection.watch_status === 'dropped' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {collection.watch_status?.replace(/_/g, ' ')}
                </span>
              </div>
              {collection.rating && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Your Rating</span>
                  <span className="text-yellow-400 font-semibold text-sm">⭐ {collection.rating}/10</span>
                </div>
              )}
              {media.total_episodes && (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{collection.progress}/{media.total_episodes}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${Math.min(100, (collection.progress / media.total_episodes) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {collection.review && (
                <p className="text-gray-300 text-xs italic border-t border-white/5 pt-2">"{collection.review}"</p>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${TYPE_COLORS[media.type] || 'badge-anime'}`}>{media.type}</span>
              {media.status && (
                <span className={`badge ${media.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                  {media.status}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">{media.title}</h1>
            {media.genre && <p className="text-primary-400 font-medium">{media.genre}</p>}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {media.release_year && (
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-white font-display font-bold">{media.release_year}</p>
                <p className="text-gray-500 text-xs">Year</p>
              </div>
            )}
            {media.total_episodes && (
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-white font-display font-bold">{media.total_episodes}</p>
                <p className="text-gray-500 text-xs">{media.type === 'game' ? 'Hrs' : 'Episodes'}</p>
              </div>
            )}
            {media.avg_rating && (
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-yellow-400 font-display font-bold">⭐ {media.avg_rating}</p>
                <p className="text-gray-500 text-xs">{media.review_count} Reviews</p>
              </div>
            )}
            {media.studio && (
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-white font-display font-bold text-sm">{media.studio}</p>
                <p className="text-gray-500 text-xs">Studio</p>
              </div>
            )}
          </div>

          {/* Description */}
          {media.description && (
            <div>
              <h3 className="font-display font-semibold text-white mb-2">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed">{media.description}</p>
            </div>
          )}

          {/* Add to collection CTA */}
          <MediaCard media={media} collectionEntry={collection} onCollectionUpdate={fetchData}>
            {({ onClick }) => (
              <button onClick={onClick} className="btn-primary px-8 py-3">
                {collection ? '✏️ Edit in Collection' : '+ Add to My List'}
              </button>
            )}
          </MediaCard>
          <div className="flex gap-3">
            <Link to={`/browse?type=${media.type}`} className="btn-secondary py-2 px-5 text-sm">
              More {media.type}
            </Link>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="section-title mb-4">More {media.type}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {related.map(m => (
              <MediaCard key={m.id} media={m} onCollectionUpdate={fetchData} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
