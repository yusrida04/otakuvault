import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

// ── Constants ──────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { key: 'english',  emoji: '🇬🇧', label: 'Bahasa Inggris' },
  { key: 'japanese', emoji: '🇯🇵', label: 'Bahasa Jepang'  },
  { key: 'math',     emoji: '🔢', label: 'Matematika'      },
];

// ── Create Character Modal ─────────────────────────────────────────────────────

function CreateCharacterModal({ mediaId, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', tagline: '', description: '',
    greeting: '', avatar_url: '', subject: 'english',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Template otomatis berdasarkan nama karakter
  const fillTemplate = () => {
    if (!form.name) return;
    setForm(f => ({
      ...f,
      tagline: `Tutor ${f.name} siap membantu kamu belajar!`,
      description: `Aku adalah ${f.name}, seorang yang kuat dan bijaksana. Aku akan menggunakan pengalamanku untuk membantumu memahami pelajaran dengan cara yang unik dan menyenangkan. Aku percaya bahwa belajar adalah kekuatan terbesar yang bisa dimiliki siapapun.`,
      greeting: `Hei! Aku ${f.name}. Jadi kamu mau belajar bersamaku? Bagus sekali! Aku akan pastikan perjalanan belajarmu tidak membosankan. Siap mulai?`,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.greeting) {
      setError('Nama, deskripsi, dan greeting wajib diisi!');
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await api.post('/characters', { media_id: mediaId, ...form });
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat karakter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-lg border border-white/10 animate-in max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-white">✨ Buat Karakter AI</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm mb-4">{error}</div>}

        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 block">Mau ngajarin apa? 📚</label>
            <div className="grid grid-cols-3 gap-2">
              {SUBJECTS.map(s => (
                <button key={s.key} type="button" onClick={() => setForm(f => ({ ...f, subject: s.key }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${form.subject === s.key ? 'bg-primary-600/30 border-primary-500/60' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-xs text-gray-300 font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name + auto-fill */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Nama Karakter *</label>
            <div className="flex gap-2">
              <input type="text" placeholder="e.g. Luffy, Gojo, Sung Jinwoo" className="input-field flex-1"
                value={form.name} onChange={set('name')} />
              <button type="button" onClick={fillTemplate} title="Auto-isi template"
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-medium transition-all flex-shrink-0">
                ✨ Auto
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-1">Ketik nama lalu klik "Auto" untuk isi template otomatis</p>
          </div>

          {/* Tagline */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Tagline</label>
            <input type="text" placeholder="e.g. Raja Bajak Laut sekaligus tutor terbaik!" className="input-field"
              value={form.tagline} onChange={set('tagline')} />
          </div>

          {/* Avatar */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">🖼️ URL Avatar</label>
            <input type="url" placeholder="URL gambar karakter (opsional)" className="input-field"
              value={form.avatar_url} onChange={set('avatar_url')} />
            {form.avatar_url && (
              <div className="mt-2 w-12 h-12 rounded-full overflow-hidden ring-1 ring-white/20">
                <img src={form.avatar_url} alt="preview" className="w-full h-full object-cover"
                  onError={e => { e.target.parentElement.style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">
              Deskripsi Kepribadian *
            </label>
            <textarea rows={3} className="input-field resize-none text-sm"
              placeholder="Jelaskan kepribadian, cara bicara, dan karakter unik si karakter ini..."
              value={form.description} onChange={set('description')} />
          </div>

          {/* Greeting */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">
              Kalimat Pembuka (Greeting) *
            </label>
            <textarea rows={2} className="input-field resize-none text-sm"
              placeholder="Kalimat pertama yang akan diucapkan karakter saat user membuka chat..."
              value={form.greeting} onChange={set('greeting')} />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5">Batal</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-2.5">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat...
                </span>
              : '✨ Buat Karakter'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Chat Window ────────────────────────────────────────────────────────────────

function ChatWindow({ character, onClose, onDelete }) {
  const { user } = useAuth();
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [greeted, setGreeted]     = useState(false);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  const subjectObj = SUBJECTS.find(s => s.key === character.subject) || SUBJECTS[0];

  // Scroll ke bawah otomatis
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Greeting pertama
  useEffect(() => {
    if (!greeted) {
      setGreeted(true);
      setMessages([{
        role: 'assistant',
        content: character.greeting,
        timestamp: Date.now(),
      }]);
    }
  }, [greeted, character.greeting]);

  // Focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Kirim history (tanpa timestamp, hanya role & content)
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.post(`/characters/${character.id}/chat`, { messages: apiMessages });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.data.reply,
        timestamp: Date.now(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Aduh, ada gangguan nih. Coba lagi ya! (${err.response?.data?.message || 'Network error'})`,
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Quick starter prompts berdasarkan subject
  const STARTERS = {
    english:  ['Ajari aku satu kata baru hari ini!', 'Apa bedanya "will" dan "going to"?', 'Koreksi grammar kalimat ini: "I is happy"', 'Beri aku soal latihan!'],
    japanese: ['Ajari aku cara bilang "Halo" dalam bahasa Jepang!', 'Apa itu hiragana?', 'Cara baca: ありがとう', 'Beri aku 3 kosakata anime!'],
    math:     ['Ajari aku perkalian dengan cara seru!', 'Apa itu bilangan prima?', 'Soal: 15% dari 200 itu berapa?', 'Jelasin pecahan pakai analogi anime!'],
  };
  const starters = STARTERS[character.subject] || STARTERS.english;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:w-[500px] h-[90vh] sm:h-[640px] flex flex-col glass border border-white/10 sm:rounded-2xl overflow-hidden shadow-2xl animate-in">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0 bg-gradient-to-r from-primary-900/50 to-dark-900/50">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {character.avatar_url ? (
              <img src={character.avatar_url} alt={character.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/50"
                onError={e => { e.target.src = ''; e.target.className = 'hidden'; }} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-lg">
                {character.name[0]}
              </div>
            )}
            {/* Online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-white text-sm truncate">{character.name}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{subjectObj.emoji}</span>
              <p className="text-gray-400 text-xs">Tutor {subjectObj.label}</p>
              {character.tagline && <span className="text-gray-600 text-xs">• {character.tagline}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Reset */}
            <button onClick={() => { setMessages([]); setGreeted(false); }}
              className="w-8 h-8 rounded-lg glass-hover text-gray-400 hover:text-white flex items-center justify-center text-sm transition-all"
              title="Reset chat">
              🔄
            </button>
            {/* Hapus karakter (hanya creator) */}
            {user && character.user_id === user.id && (
              <button onClick={() => onDelete(character.id)}
                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-sm transition-all"
                title="Hapus karakter">
                🗑️
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg glass-hover text-gray-400 hover:text-white flex items-center justify-center transition-all">
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar mini */}
              <div className="flex-shrink-0 self-end">
                {msg.role === 'assistant' ? (
                  character.avatar_url ? (
                    <img src={character.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                      {character.name[0]}
                    </div>
                  )
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-300 text-xs font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-white/8 border border-white/10 text-gray-200 rounded-bl-sm'
                    : 'bg-primary-600 text-white rounded-br-sm'
                }`}>
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
                <span className="text-[10px] text-gray-600 mt-1 mx-1">
                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end">
                {character.name[0]}
              </div>
              <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick starters — muncul hanya di awal */}
        {messages.length <= 1 && !loading && (
          <div className="px-4 py-2 flex-shrink-0 border-t border-white/5">
            <p className="text-gray-600 text-[10px] uppercase tracking-wide font-semibold mb-1.5">Mulai dari sini:</p>
            <div className="flex gap-1.5 flex-wrap">
              {starters.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea ref={inputRef} rows={1}
              placeholder={`Ngobrol sama ${character.name}...`}
              className="flex-1 input-field resize-none py-2.5 text-sm max-h-20 leading-relaxed"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              }
            </button>
          </div>
          <p className="text-gray-700 text-[10px] mt-1 text-center">Enter kirim • Shift+Enter baris baru</p>
        </div>
      </div>
    </div>
  );
}

// ── Main CharacterChat ─────────────────────────────────────────────────────────

export default function CharacterChat({ mediaId }) {
  const { user }                        = useAuth();
  const [characters, setCharacters]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showCreate, setShowCreate]     = useState(false);
  const [activeChar, setActiveChar]     = useState(null);

  const fetchCharacters = useCallback(async () => {
    try {
      const res = await api.get(`/characters/${mediaId}`);
      setCharacters(res.data.data);
    } catch {}
    finally { setLoading(false); }
  }, [mediaId]);

  useEffect(() => { fetchCharacters(); }, [fetchCharacters]);

  const handleDelete = async (id) => {
    if (!confirm('Hapus karakter ini?')) return;
    await api.delete(`/characters/${id}`);
    setActiveChar(null);
    fetchCharacters();
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-white text-lg">🤖 AI Tutor Karakter</h3>
            <p className="text-gray-500 text-xs mt-0.5">Belajar bareng karakter favorit kamu</p>
          </div>
          {user && (
            <button onClick={() => setShowCreate(true)} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Karakter
            </button>
          )}
        </div>

        {/* Info banner */}
        <div className="glass rounded-xl px-4 py-3 border border-white/5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <p className="text-gray-400 text-xs leading-relaxed">
            Pilih karakter untuk belajar <span className="text-primary-400 font-semibold">Bahasa Inggris</span>, 
            <span className="text-red-400 font-semibold"> Bahasa Jepang</span>, atau 
            <span className="text-green-400 font-semibold"> Matematika</span> dengan gaya khas karakter anime/game favorit kamu!
          </p>
        </div>

        {/* Character list */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl h-28 animate-pulse" />)}
          </div>
        ) : characters.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center border border-white/5">
            <p className="text-4xl mb-3">🎭</p>
            <p className="text-gray-400 font-semibold">Belum ada karakter AI</p>
            <p className="text-gray-600 text-sm mt-1 mb-4">
              {user ? 'Buat karakter pertama dan mulai belajar!' : 'Login untuk membuat karakter AI tutor!'}
            </p>
            {user
              ? <button onClick={() => setShowCreate(true)} className="btn-primary py-2 px-6">Buat Karakter Pertama</button>
              : <Link to="/login" className="btn-primary py-2 px-6 inline-block">Login dulu</Link>
            }
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {characters.map(char => {
              const subj = SUBJECTS.find(s => s.key === char.subject) || SUBJECTS[0];
              return (
                <button key={char.id} onClick={() => setActiveChar(char)}
                  className="glass rounded-2xl p-4 border border-white/5 hover:border-white/20 transition-all text-left group hover:-translate-y-1 duration-200">
                  {/* Avatar + subject badge */}
                  <div className="flex items-center gap-3 mb-3">
                    {char.avatar_url ? (
                      <img src={char.avatar_url} alt={char.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-primary-500/50 transition-all"
                        onError={e => { e.target.parentElement.innerHTML = `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-xl">${char.name[0]}</div>`; }} />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-xl group-hover:scale-110 transition-transform">
                        {char.name[0]}
                      </div>
                    )}
                    <span className="text-2xl">{subj.emoji}</span>
                  </div>
                  <p className="text-white font-display font-bold text-sm">{char.name}</p>
                  <p className="text-primary-400 text-xs mt-0.5">Tutor {subj.label}</p>
                  {char.tagline && <p className="text-gray-500 text-[10px] mt-1 line-clamp-2">{char.tagline}</p>}
                  <p className="text-gray-600 text-[10px] mt-2">oleh {char.creator_name}</p>

                  {/* Chat button */}
                  <div className="mt-3 w-full py-1.5 rounded-xl bg-primary-600/20 hover:bg-primary-600/40 border border-primary-500/30 text-primary-400 text-xs font-semibold text-center transition-all">
                    💬 Mulai Chat
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateCharacterModal
          mediaId={mediaId}
          onClose={() => setShowCreate(false)}
          onCreated={(newChar) => { fetchCharacters(); setActiveChar(newChar); }}
        />
      )}

      {activeChar && (
        <ChatWindow
          character={activeChar}
          onClose={() => setActiveChar(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}