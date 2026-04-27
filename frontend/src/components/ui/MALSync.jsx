import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';


// ── Preview Card ───────────────────────────────────────────────────────────────

function MALPreviewCard({ preview, onConfirm, onCancel, loading, options, setOptions }) {
  return (
    <div className="space-y-5">
      {/* MAL Profile */}
      <div className="glass rounded-2xl p-5 border border-green-500/20 flex items-center gap-4">
        {preview.avatar && (
          <img
            src={preview.avatar} alt={preview.username}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-green-500/30"
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <div>
          <p className="text-white font-display font-bold text-lg">{preview.username}</p>
          <p className="text-green-400 text-xs font-medium">✅ Akun MAL ditemukan!</p>
          {preview.joined && (
            <p className="text-gray-500 text-xs">
              Member sejak {new Date(preview.joined).getFullYear()}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Anime',       value: preview.anime_count, emoji: '🎌', color: 'text-pink-400'    },
          { label: 'Manga/Manhwa', value: preview.manga_count, emoji: '📖', color: 'text-blue-400'   },
          { label: 'Total',       value: preview.total,        emoji: '📦', color: 'text-primary-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-4 text-center border border-white/5">
            <p className="text-xl mb-1">{s.emoji}</p>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Warning kalau banyak */}
      {preview.total > 500 && (
        <div className="glass rounded-xl p-3 border border-yellow-500/20 flex items-start gap-2">
          <span className="text-yellow-400 text-lg flex-shrink-0">⚠️</span>
          <p className="text-yellow-300 text-xs leading-relaxed">
            Kamu punya <strong>{preview.total.toLocaleString()} item</strong> — sync mungkin butuh waktu 
            <strong> {Math.ceil(preview.total / 100)} – {Math.ceil(preview.total / 50)} menit</strong> karena 
            rate limit MAL. Jangan tutup halaman ini!
          </p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Pilih yang mau di-sync:</p>
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            options.sync_anime ? 'bg-pink-500/10 border-pink-500/30' : 'glass border-white/10'
          }`}>
            <input
              type="checkbox"
              checked={options.sync_anime}
              onChange={e => setOptions(o => ({ ...o, sync_anime: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <div>
              <p className="text-white text-sm font-semibold">🎌 Anime</p>
              <p className="text-gray-400 text-xs">{preview.anime_count.toLocaleString()} item</p>
            </div>
          </label>
          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            options.sync_manga ? 'bg-blue-500/10 border-blue-500/30' : 'glass border-white/10'
          }`}>
            <input
              type="checkbox"
              checked={options.sync_manga}
              onChange={e => setOptions(o => ({ ...o, sync_manga: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <div>
              <p className="text-white text-sm font-semibold">📖 Manga/Manhwa</p>
              <p className="text-gray-400 text-xs">{preview.manga_count.toLocaleString()} item</p>
            </div>
          </label>
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-3 border border-white/5 space-y-1.5">
        <p className="text-gray-400 text-xs font-semibold">ℹ️ Yang akan di-sync:</p>
        {[
          'Status (watching, completed, dropped, dll)',
          'Progress episode / chapter',
          'Rating yang sudah kamu beri',
          'Cover, genre, dan info media otomatis terisi',
        ].map(info => (
          <p key={info} className="text-gray-500 text-xs flex items-center gap-1.5">
            <span className="text-green-400">✓</span> {info}
          </p>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary flex-1 py-3">Batal</button>
        <button
          onClick={onConfirm}
          disabled={loading || (!options.sync_anime && !options.sync_manga)}
          className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Syncing...
            </>
          ) : (
            <>🔄 Mulai Sync</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Result Card ────────────────────────────────────────────────────────────────

function MALResultCard({ result, onClose, onViewCollection }) {
  return (
    <div className="space-y-5 text-center">
      <div>
        <div className="text-6xl mb-3">🎉</div>
        <h3 className="font-display font-bold text-2xl text-white">Sync Berhasil!</h3>
        <p className="text-gray-400 text-sm mt-1">
          Koleksimu dari MAL sudah masuk ke OtakuVault
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 border border-green-500/20">
          <p className="text-3xl font-display font-bold text-green-400">{result.summary.anime.synced}</p>
          <p className="text-gray-400 text-xs mt-1">🎌 Anime di-sync</p>
          {result.summary.anime.errors > 0 && (
            <p className="text-red-400 text-[10px] mt-0.5">{result.summary.anime.errors} gagal</p>
          )}
        </div>
        <div className="glass rounded-xl p-4 border border-blue-500/20">
          <p className="text-3xl font-display font-bold text-blue-400">{result.summary.manga.synced}</p>
          <p className="text-gray-400 text-xs mt-1">📖 Manga di-sync</p>
          {result.summary.manga.errors > 0 && (
            <p className="text-red-400 text-[10px] mt-0.5">{result.summary.manga.errors} gagal</p>
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-4 border border-primary-500/20">
        <p className="text-4xl font-display font-bold text-gradient">{result.summary.total}</p>
        <p className="text-gray-400 text-sm">Total item berhasil di-sync 🚀</p>
      </div>

      <div className="flex gap-2">
        <button onClick={onClose} className="btn-secondary flex-1 py-3">Tutup</button>
        <button onClick={onViewCollection} className="btn-primary flex-1 py-3">
          Lihat Koleksi →
        </button>
      </div>
    </div>
  );
}

// ── Main MALSync Component ─────────────────────────────────────────────────────

export default function MALSync({ onSyncComplete }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [step, setStep]           = useState('input');   // input | preview | syncing | result
  const [username, setUsername]   = useState('');
  const [preview, setPreview]     = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [options, setOptions]     = useState({ sync_anime: true, sync_manga: true });
  const [syncProgress, setSyncProgress] = useState('');

  const reset = () => {
    setStep('input');
    setPreview(null);
    setResult(null);
    setError('');
    setSyncProgress('');
    setOptions({ sync_anime: true, sync_manga: true });
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(reset, 300);
  };

  // Step 1: Preview
  const handlePreview = async () => {
    if (!username.trim()) { setError('Masukkan username MAL kamu'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.get(`/sync/mal/preview/${username.trim()}`);
      setPreview(res.data.data);
      setStep('preview');
    } catch (err) {
      setError(err.response?.data?.message || 'Username tidak ditemukan atau profil di-private');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Sync
  const handleSync = async () => {
    setLoading(true);
    setStep('syncing');
    setSyncProgress('Menghubungkan ke MyAnimeList...');

    // Progress messages untuk UX
    const progressMessages = [
      'Mengambil daftar anime...',
      'Mengambil daftar manga & manhwa...',
      'Menyimpan ke database...',
      'Hampir selesai...',
    ];
    let msgIdx = 0;
    const progressInterval = setInterval(() => {
      if (msgIdx < progressMessages.length) {
        setSyncProgress(progressMessages[msgIdx++]);
      }
    }, 4000);

    try {
      const res = await api.post('/sync/mal', {
        username: preview.username,
        sync_anime: options.sync_anime,
        sync_manga: options.sync_manga,
      });
      setResult(res.data.data);
      setStep('result');
      onSyncComplete?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Sync gagal. Coba lagi nanti.');
      setStep('preview');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/10 text-blue-300 hover:text-blue-200 font-semibold text-sm transition-all group"
      >
        <img
          src="https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png"
          alt="MAL"
          className="w-5 h-5 rounded group-hover:scale-110 transition-transform"
          onError={e => { e.target.outerHTML = '<span class="text-base">🔵</span>'; }}
        />
        Sync dari MAL
      </button>

{/* Modal */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="glass rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-in overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-900/30 to-dark-900/50">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png"
                  alt="MAL" className="w-8 h-8 rounded-lg"
                  onError={e => { e.target.outerHTML = '<span class="text-2xl">🔵</span>'; }}
                />
                <div>
                  <h3 className="font-display font-bold text-white text-base">Sync dari MyAnimeList</h3>
                  <p className="text-gray-400 text-xs">Import koleksimu otomatis</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <div className="p-6">
              {/* Step: Input Username */}
              {step === 'input' && (
                <div className="space-y-5">
                  <div className="glass rounded-xl p-4 border border-white/5 space-y-2">
                    <p className="text-white font-semibold text-sm">Cara pakai:</p>
                    {[
                      'Pastikan profil MAL kamu tidak di-private',
                      'Masukkan username MAL (bukan email)',
                      'Klik Preview untuk cek dulu sebelum sync',
                    ].map((tip, i) => (
                      <p key={i} className="text-gray-400 text-xs flex items-start gap-2">
                        <span className="text-primary-400 font-bold flex-shrink-0">{i + 1}.</span>
                        {tip}
                      </p>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 block">
                      Username MyAnimeList
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. animelover99"
                        className="input-field flex-1"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handlePreview()}
                        autoFocus
                      />
                      <button
                        onClick={handlePreview}
                        disabled={loading || !username.trim()}
                        className="btn-primary px-4 py-2.5 flex items-center gap-2 flex-shrink-0 disabled:opacity-40"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Preview'}
                      </button>
                    </div>
                    {error && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                        <span>⚠️</span> {error}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step: Preview */}
              {step === 'preview' && preview && (
                <MALPreviewCard
                  preview={preview}
                  onConfirm={handleSync}
                  onCancel={reset}
                  loading={loading}
                  options={options}
                  setOptions={setOptions}
                />
              )}

              {/* Step: Syncing */}
              {step === 'syncing' && (
                <div className="text-center py-8 space-y-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-primary-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin" />
                    <div className="absolute inset-2 flex items-center justify-center">
                      <img
                        src="https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png"
                        alt="MAL" className="w-10 h-10 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-display font-bold text-lg">Sedang Sync...</p>
                    <p className="text-primary-400 text-sm mt-1 animate-pulse">{syncProgress}</p>
                  </div>
                </div>
              )}

              {/* Step: Result */}
              {step === 'result' && result && (
                <MALResultCard
                  result={result}
                  onClose={handleClose}
                  onViewCollection={() => {
                    handleClose();
                    window.location.href = '/collection';
                  }}
                />
              )}
            </div>
          </div>
        </div>,
        document.body // <--- Ini kunci utamanya, memindahkan modal ke body
      )}
    </>
  );
}