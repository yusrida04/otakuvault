import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MediaCard from '../components/ui/MediaCard';

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mediaRes = await api.get('/media?limit=6');
        setFeatured(mediaRes.data.data);
        setStats({ total: mediaRes.data.pagination?.total || 0 });

        // Stats hanya kalau login
        if (user) {
          const statsRes = await api.get('/collections/stats');
          setUserStats(statsRes.data.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const totalInCollection = userStats?.by_status?.reduce((sum, s) => sum + parseInt(s.count), 0) || 0;
  const completedCount = userStats?.by_status?.find(s => s.watch_status === 'completed' || s.watch_status === 'played')?.count || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero */}
      <section className="relative text-center py-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="animate-in">
          <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30 text-xs mb-4 inline-block">
            🎮 For Gamers & Otaku
          </span>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-white mb-4 leading-tight">
            Your Ultimate<br />
            <span className="text-gradient">Otaku Vault</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8 font-body">
            Track your anime, manhwa, manga, games, and comics — all in one place. Never lose track of what you're watching or playing again.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {user ? (
              <>
                <Link to="/browse" className="btn-primary text-base px-8 py-3">Browse Now</Link>
                <Link to="/collection" className="btn-secondary text-base px-8 py-3">My Collection</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3">Get Started Free</Link>
                <Link to="/browse" className="btn-secondary text-base px-8 py-3">Browse Media</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* User Stats */}
      {user && userStats && (
        <section>
          <h2 className="section-title mb-4">📊 Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="📚" label="In Collection" value={totalInCollection} color="bg-primary-500/20" />
            <StatCard icon="✅" label="Completed" value={completedCount} color="bg-green-500/20" />
            <StatCard icon="⭐" label="Avg Rating" value={userStats.avg_rating ? `${userStats.avg_rating}/10` : 'N/A'} color="bg-yellow-500/20" />
            <StatCard icon="❤️" label="Favorites" value={userStats.favorite_count || 0} color="bg-red-500/20" />
          </div>
        </section>
      )}

      {/* Featured */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">🔥 Featured Media</h2>
          <Link to="/browse" className="text-sm text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 transition-colors">
            View All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featured.map(media => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        )}
      </section>

      {/* Type pills */}
      <section>
        <h2 className="section-title mb-6">🗂️ Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { type: 'anime', emoji: '🎌', label: 'Anime', color: 'hover:border-pink-500/50 hover:bg-pink-500/10' },
            { type: 'manhwa', emoji: '📖', label: 'Manhwa', color: 'hover:border-blue-500/50 hover:bg-blue-500/10' },
            { type: 'manga', emoji: '📚', label: 'Manga', color: 'hover:border-purple-500/50 hover:bg-purple-500/10' },
            { type: 'game', emoji: '🎮', label: 'Games', color: 'hover:border-green-500/50 hover:bg-green-500/10' },
            { type: 'comic', emoji: '💥', label: 'Comics', color: 'hover:border-yellow-500/50 hover:bg-yellow-500/10' },
          ].map(({ type, emoji, label, color }) => (
            <Link
              key={type}
              to={`/browse?type=${type}`}
              className={`glass rounded-2xl p-4 text-center transition-all duration-200 border border-white/5 ${color} group`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform inline-block">{emoji}</div>
              <p className="font-display font-semibold text-sm text-gray-300">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="glass rounded-3xl p-10 text-center border border-primary-500/20">
          <h2 className="text-3xl font-display font-bold text-white mb-3">Ready to Track Your Journey?</h2>
          <p className="text-gray-400 mb-6">Join OtakuVault and keep tabs on everything you watch, read, and play.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3 inline-block">
            Create Free Account
          </Link>
        </section>
      )}
    </div>
  );
}
