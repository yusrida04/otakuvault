import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MediaCard from '../components/ui/MediaCard';

const TYPE_COLORS = {
  anime: 'badge-anime', manhwa: 'badge-manhwa', manga: 'badge-manga',
  game: 'badge-game', comic: 'badge-comic',
};

const MOODS = [
  { key: 'mindblown', emoji: '🤯', label: 'Mind Blown' },
  { key: 'hype',      emoji: '🔥', label: 'Hype'       },
  { key: 'love',      emoji: '😍', label: 'Love'        },
  { key: 'cry',       emoji: '😭', label: 'Nangis'      },
  { key: 'sad',       emoji: '😔', label: 'Sedih'       },
  { key: 'laugh',     emoji: '😂', label: 'Ngakak'      },
  { key: 'angry',     emoji: '😡', label: 'Kesel'       },
  { key: 'confused',  emoji: '😵', label: 'Bingung'     },
  { key: 'bored',     emoji: '😑', label: 'Boring'      },
  { key: 'neutral',   emoji: '😐', label: 'Biasa'       },
];

const STATUS_LABELS = {
  watching: 'Watching', completed: 'Completed', dropped: 'Dropped',
  plan_to_watch: 'Plan to Watch', on_hold: 'On Hold',
  playing: 'Playing', played: 'Played',
};

const getMoodObj = (key) => MOODS.find(m => m.key === key) || MOODS[9];

// ── Cover Editor ───────────────────────────────────────────────────────────────
// Komponen untuk edit cover URL media

function CoverEditor({ media, onUpdated }) {
  const [editing, setEditing]   = useState(false);
  const [url, setUrl]           = useState(media.cover_url || '');
  const [preview, setPreview]   = useState(media.cover_url || '');
  const [loading, setLoading]   = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/media/${media.id}`, { cover_url: url });
      onUpdated();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-shrink-0 mx-auto sm:mx-0 group relative">
      {/* Cover image */}
      <div className="w-36 sm:w-40 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <img
          src={preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(media.title)}&size=300&background=4f46e5&color=fff`}
          alt={media.title}
          className="w-full aspect-[3/4] object-cover"
          onError={e => {
            setImgError(true);
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(media.title)}&size=300&background=4f46e5&color=fff`;
          }}
        />
      </div>

      {/* Edit button overlay */}
      <button
        onClick={() => setEditing(true)}
        className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/50 transition-all flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100"
      >
        <span className="text-xs bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg text-white font-semibold flex items-center gap-1">
          🖼️ Ganti Cover
        </span>
      </button>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={() => setEditing(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10 animate-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-white mb-4">🖼️ Ganti Cover</h3>

            {/* Preview */}
            <div className="mb-4 flex justify-center">
              <div className="w-32 rounded-xl overflow-hidden ring-1 ring-white/10">
                <img
                  src={url || `https://ui-avatars.com/api/?name=${encodeURIComponent(media.title)}&size=300&background=4f46e5&color=fff`}
                  alt="preview"
                  className="w-full aspect-[3/4] object-cover"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(media.title)}&size=300&background=4f46e5&color=fff`; }}
                />
              </div>
            </div>

            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">URL Gambar Cover</label>
            <input
              type="url"
              className="input-field mb-1"
              placeholder="https://contoh.com/gambar.jpg"
              value={url}
              onChange={e => { setUrl(e.target.value); setPreview(e.target.value); setImgError(false); }}
            />
            <p className="text-gray-600 text-xs mb-4">Paste URL gambar dari internet. Pastikan URL langsung ke file gambar (.jpg, .png, .webp)</p>

            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1 py-2.5">Batal</button>
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 py-2.5">
                {loading ? 'Menyimpan...' : 'Simpan Cover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ChapterNoteCard ────────────────────────────────────────────────────────────

function ChapterNoteCard({ note, onEdit, onDelete }) {
  const mood = getMoodObj(note.mood);
  return (
    <div className="glass rounded-xl overflow-hidden border border-white/5 hover:border-white/15 transition-all group">
      <div className="flex gap-0">
        {/* Chapter cover image (kalau ada) */}
        {note.cover_url && (
          <div className="flex-shrink-0 w-20 sm:w-24">
            <img
              src={note.cover_url}
              alt={`Ch.${note.chapter_number}`}
              className="w-full h-full object-cover min-h-[100px]"
              onError={e => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                <span className="text-primary-400 font-display font-bold text-xs">{note.chapter_number}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {note.chapter_title ? `Ch.${note.chapter_number} — ${note.chapter_title}` : `Chapter ${note.chapter_number}`}
                </p>
                <p className="text-gray-500 text-xs">
                  {new Date(note.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="text-base leading-none">{mood.emoji}</span>
              <span className="text-xs text-gray-300 hidden sm:block">{mood.label}</span>
            </div>
          </div>

          <p className="mt-2.5 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{note.note}</p>

          <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(note)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">✏️ Edit</button>
            <button onClick={() => onDelete(note.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">🗑️ Hapus</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ChapterNoteModal ───────────────────────────────────────────────────────────

function ChapterNoteModal({ mediaId, editNote, onClose, onSaved }) {
  const [form, setForm] = useState({
    chapter_number: editNote?.chapter_number || '',
    chapter_title:  editNote?.chapter_title  || '',
    note:           editNote?.note           || '',
    mood:           editNote?.mood           || 'neutral',
    cover_url:      editNote?.cover_url      || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.chapter_number || !form.note.trim()) {
      setError('Nomor chapter dan catatan wajib diisi!');
      return;
    }
    setLoading(true); setError('');
    try {
      if (editNote) {
        await api.patch(`/chapters/${editNote.id}`, {
          chapter_title: form.chapter_title,
          note:          form.note,
          mood:          form.mood,
          cover_url:     form.cover_url || null,
        });
      } else {
        await api.post('/chapters', {
          media_id:       mediaId,
          chapter_number: parseInt(form.chapter_number),
          chapter_title:  form.chapter_title || null,
          note:           form.note,
          mood:           form.mood,
          cover_url:      form.cover_url || null,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10 animate-in max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-white">{editNote ? '✏️ Edit Catatan' : '📝 Tulis Catatan'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm mb-4">{error}</div>}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">No. Chapter *</label>
              <input type="number" min="1" placeholder="e.g. 179" className="input-field" value={form.chapter_number} onChange={set('chapter_number')} disabled={!!editNote} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Judul Chapter</label>
              <input type="text" placeholder="opsional" className="input-field" value={form.chapter_title} onChange={set('chapter_title')} />
            </div>
          </div>

          {/* Cover chapter */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">🖼️ Gambar Sampul Chapter</label>
            <input
              type="url"
              placeholder="URL gambar chapter (opsional)"
              className="input-field"
              value={form.cover_url}
              onChange={set('cover_url')}
            />
            {form.cover_url && (
              <div className="mt-2 w-20 rounded-lg overflow-hidden ring-1 ring-white/10">
                <img src={form.cover_url} alt="preview" className="w-full aspect-[3/4] object-cover"
                  onError={e => { e.target.parentElement.style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* Mood grid */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 block">Mood setelah baca 😶</label>
            <div className="grid grid-cols-5 gap-1.5">
              {MOODS.map(m => (
                <button key={m.key} type="button" onClick={() => setForm(f => ({ ...f, mood: m.key }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                    form.mood === m.key ? 'bg-primary-600/30 border-primary-500/60 scale-105' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}>
                  <span className="text-xl leading-none">{m.emoji}</span>
                  <span className="text-gray-400 text-[9px] leading-none font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Catatan / Tanggapan *</label>
            <textarea rows={5} placeholder="Tulis tanggapanmu soal chapter ini..." className="input-field resize-none text-sm leading-relaxed" value={form.note} onChange={set('note')} />
            <p className="text-gray-600 text-xs mt-1 text-right">{form.note.length} karakter</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5">Batal</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-2.5">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</span> : editNote ? 'Simpan' : 'Simpan Catatan 📝'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── StatusPanel ────────────────────────────────────────────────────────────────

function StatusPanel({ collection, media, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    watch_status: collection?.watch_status || 'plan_to_watch',
    progress:     collection?.progress     || 0,
    rating:       collection?.rating       || '',
    review:       collection?.review       || '',
    is_favorite:  collection?.is_favorite  || false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({
      watch_status: collection?.watch_status || 'plan_to_watch',
      progress:     collection?.progress     || 0,
      rating:       collection?.rating       || '',
      review:       collection?.review       || '',
      is_favorite:  collection?.is_favorite  || false,
    });
  }, [collection]);

  const statusOptions = media?.type === 'game'
    ? ['plan_to_watch', 'playing', 'played', 'dropped', 'on_hold']
    : ['plan_to_watch', 'watching', 'completed', 'dropped', 'on_hold'];

  const handleSave = async () => {
    setLoading(true);
    try {
      if (collection) await api.patch(`/collections/${collection.id}`, form);
      else            await api.post('/collections', { media_id: media.id, ...form });
      onUpdate(); setShowModal(false);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleRemove = async () => {
    if (!collection) return;
    setLoading(true);
    try { await api.delete(`/collections/${collection.id}`); onUpdate(); setShowModal(false); } catch {} finally { setLoading(false); }
  };

  const sColor = (s) => {
    if (s === 'completed' || s === 'played') return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (s === 'watching'  || s === 'playing') return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (s === 'dropped')  return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (s === 'on_hold')  return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  return (
    <>
      <div className="glass rounded-2xl p-5 space-y-3 border border-white/5">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-semibold text-white text-sm">📋 Status Kamu</h4>
          <button onClick={() => setShowModal(true)} className="text-xs px-3 py-1.5 rounded-lg bg-primary-600/20 hover:bg-primary-600/40 text-primary-400 border border-primary-500/30 transition-all font-medium">
            {collection ? '✏️ Edit' : '+ Tambah'}
          </button>
        </div>
        {collection ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${sColor(collection.watch_status)}`}>{STATUS_LABELS[collection.watch_status]}</span>
              {collection.is_favorite && <span className="text-xs px-2.5 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-semibold">⭐ Favorit</span>}
            </div>
            {media?.total_episodes && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Progress</span>
                  <span className="font-semibold text-white">{collection.progress} / {media.total_episodes}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (collection.progress / media.total_episodes) * 100)}%` }} />
                </div>
                <p className="text-gray-600 text-xs mt-1 text-right">{Math.round((collection.progress / media.total_episodes) * 100)}%</p>
              </div>
            )}
            {collection.rating && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <svg key={i} className={`w-3.5 h-3.5 fill-current ${i < Math.round(collection.rating / 2) ? 'text-yellow-400' : 'text-gray-700'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>
                <span className="text-yellow-400 font-semibold text-sm">{collection.rating}/10</span>
              </div>
            )}
            {collection.review && <p className="text-gray-400 text-xs italic border-t border-white/5 pt-3 leading-relaxed">"{collection.review}"</p>}
          </>
        ) : <p className="text-gray-500 text-xs">Belum ditambahkan ke koleksi.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm border border-white/10 animate-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-white mb-4">{media?.title}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Status</label>
                <select className="input-field" value={form.watch_status} onChange={e => setForm(f => ({ ...f, watch_status: e.target.value }))}>
                  {statusOptions.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              {media?.total_episodes && (
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Progress ({form.progress}/{media.total_episodes})</label>
                  <input type="number" min="0" max={media.total_episodes} className="input-field" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) || 0 }))} />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Rating (0–10)</label>
                <input type="number" min="0" max="10" step="0.5" placeholder="Kosongkan jika belum" className="input-field" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Review singkat</label>
                <textarea rows={2} placeholder="Pendapat kamu..." className="input-field resize-none text-sm" value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_favorite} onChange={e => setForm(f => ({ ...f, is_favorite: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-300">Tandai sebagai Favorit ⭐</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              {collection && <button onClick={handleRemove} disabled={loading} className="btn-danger flex-1 py-2.5">Hapus</button>}
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2.5">Batal</button>
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 py-2.5">{loading ? '...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── ChapterNotesSection ────────────────────────────────────────────────────────

function ChapterNotesSection({ mediaId, isLoggedIn }) {
  const [notes, setNotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote]   = useState(null);
  const [sortDesc, setSortDesc]   = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!isLoggedIn) { setLoading(false); return; }
    try { const res = await api.get(`/chapters/${mediaId}`); setNotes(res.data.data); } catch {}
    finally { setLoading(false); }
  }, [mediaId, isLoggedIn]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleDelete = async (id) => {
    if (!confirm('Hapus catatan ini?')) return;
    await api.delete(`/chapters/${id}`);
    fetchNotes();
  };

  const sorted = [...notes].sort((a, b) =>
    sortDesc ? b.chapter_number - a.chapter_number : a.chapter_number - b.chapter_number
  );

  const moodStats = notes.reduce((acc, n) => { acc[n.mood] = (acc[n.mood] || 0) + 1; return acc; }, {});
  const topMoods  = Object.entries(moodStats).sort((a, b) => b[1] - a[1]).slice(0, 3);

  if (!isLoggedIn) return (
    <div className="glass rounded-2xl p-8 text-center border border-white/5">
      <p className="text-4xl mb-3">📝</p>
      <p className="text-gray-300 font-semibold mb-1">Tulis Catatan Per Chapter</p>
      <p className="text-gray-500 text-sm mb-4">Login untuk catat tanggapan & mood setiap chapter yang kamu baca</p>
      <Link to="/login" className="btn-primary py-2 px-6 inline-block">Login dulu</Link>
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-white text-lg">Catatan Chapter</h3>
            <p className="text-gray-500 text-xs mt-0.5">{notes.length} catatan tersimpan</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSortDesc(v => !v)} className="text-xs px-3 py-1.5 rounded-lg glass-hover text-gray-400">
              {sortDesc ? '↓ Ch. Terbaru' : '↑ Ch. Terlama'}
            </button>
            <button onClick={() => { setEditNote(null); setShowModal(true); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah
            </button>
          </div>
        </div>

        {topMoods.length > 0 && (
          <div className="glass rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 border border-white/5">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Mood dominan:</p>
            <div className="flex gap-2 flex-wrap">
              {topMoods.map(([key, count]) => {
                const m = getMoodObj(key);
                return (
                  <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="text-base">{m.emoji}</span>
                    <span className="text-xs text-gray-300">{m.label}</span>
                    <span className="text-xs text-gray-500">×{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-28 animate-pulse" />)}</div>
        ) : sorted.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-white/5">
            <p className="text-5xl mb-3">🤔</p>
            <p className="text-gray-400 font-semibold">Belum ada catatan</p>
            <p className="text-gray-600 text-sm mt-1 mb-4">Habis baca chapter? Tulis tanggapan kamu!</p>
            <button onClick={() => { setEditNote(null); setShowModal(true); }} className="btn-primary py-2 px-6">Tulis Catatan Pertama</button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(note => (
              <ChapterNoteCard key={note.id} note={note}
                onEdit={(n) => { setEditNote(n); setShowModal(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ChapterNoteModal mediaId={mediaId} editNote={editNote}
          onClose={() => { setShowModal(false); setEditNote(null); }}
          onSaved={fetchNotes}
        />
      )}
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MediaDetailPage() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const [media, setMedia]           = useState(null);
  const [collection, setCollection] = useState(null);
  const [related, setRelated]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('info');

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/media/${id}`);
      setMedia(res.data.data);
      if (localStorage.getItem('token')) {
        try {
          const colRes = await api.get('/collections?limit=200');
          const entry  = colRes.data.data.find(c => c.media_id === parseInt(id));
          setCollection(entry || null);
        } catch {}
      }
      const relRes = await api.get(`/media?type=${res.data.data.type}&limit=7`);
      setRelated(relRes.data.data.filter(m => m.id !== parseInt(id)).slice(0, 6));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!media) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-gray-400 text-lg">Media tidak ditemukan</p>
      <Link to="/browse" className="btn-primary mt-4 inline-block">Browse</Link>
    </div>
  );

  const isReadable = ['manhwa', 'manga', 'comic'].includes(media.type);
  const tabLabel   = isReadable ? 'Catatan Chapter' : media.type === 'game' ? 'Catatan Gameplay' : 'Catatan Episode';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/browse" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-200 transition-colors mb-6 text-sm group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Browse
      </Link>

      {/* TOP: cover + info + status */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">

        {/* Cover — pakai CoverEditor supaya bisa diganti */}
        <CoverEditor media={media} onUpdated={fetchData} />

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${TYPE_COLORS[media.type] || 'badge-anime'}`}>{media.type}</span>
            {media.status && (
              <span className={`badge ${media.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {media.status}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight">{media.title}</h1>
          {media.genre && <p className="text-primary-400 text-sm font-medium">{media.genre}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            {media.release_year && <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{media.release_year}</span>}
            {media.total_episodes && <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>{media.total_episodes} {isReadable ? 'chapter' : media.type === 'game' ? 'jam' : 'episode'}</span>}
            {media.studio && <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>{media.studio}</span>}
            {media.avg_rating && <span className="flex items-center gap-1.5 text-yellow-400"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg><span className="font-semibold">{media.avg_rating}</span><span className="text-gray-500">({media.review_count})</span></span>}
          </div>

          {media.description && <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{media.description}</p>}
          <div className="pt-1">
            <Link to={`/browse?type=${media.type}`} className="btn-secondary py-2 px-4 text-sm inline-block">Lihat {media.type} lainnya</Link>
          </div>
        </div>

        {user && (
          <div className="w-full sm:w-60 flex-shrink-0">
            <StatusPanel collection={collection} media={media} onUpdate={fetchData} />
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="border-b border-white/10 mb-6">
        <div className="flex -mb-px">
          {[{ key: 'info', label: '📄 Info & Sinopsis' }, { key: 'notes', label: `📝 ${tabLabel}` }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === tab.key ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-8 animate-in">
          {media.description && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-white mb-3">📖 Sinopsis Lengkap</h3>
              <p className="text-gray-300 leading-relaxed">{media.description}</p>
            </div>
          )}
          {related.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-white mb-4">Rekomendasi {media.type} lainnya</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {related.map(m => <MediaCard key={m.id} media={m} onCollectionUpdate={fetchData} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="animate-in">
          <ChapterNotesSection mediaId={parseInt(id)} isLoggedIn={!!user} />
        </div>
      )}
    </div>
  );
}