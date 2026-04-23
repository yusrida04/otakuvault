import pool from '../config/database.js';

// ── CRUD Characters ────────────────────────────────────────────────────────────

export const getCharacters = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.username as creator_name 
       FROM ai_characters c 
       JOIN users u ON c.user_id = u.id
       WHERE c.media_id = $1 
       ORDER BY c.created_at DESC`,
      [mediaId]
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createCharacter = async (req, res) => {
  try {
    const userId = req.user.id;
    const { media_id, name, tagline, description, greeting, avatar_url, subject } = req.body;

    if (!media_id || !name || !description || !greeting) {
      return res.status(400).json({ success: false, message: 'media_id, name, description, greeting wajib diisi' });
    }

    const result = await pool.query(
      `INSERT INTO ai_characters (user_id, media_id, name, tagline, description, greeting, avatar_url, subject)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, media_id, name, tagline || null, description, greeting, avatar_url || null, subject || 'english']
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await pool.query(
      'DELETE FROM ai_characters WHERE id=$1 AND user_id=$2 RETURNING id',
      [id, userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Karakter tidak ditemukan' });
    return res.status(200).json({ success: true, message: 'Karakter dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Chat dengan karakter ───────────────────────────────────────────────────────

const SUBJECT_PROMPTS = {
  english: `
Kamu mengajar Bahasa Inggris dasar kepada user. 
Cara mengajar:
- Gunakan kepribadian karaktermu saat menjelaskan
- Setiap 2-3 respons, selipkan 1 vocab atau grammar baru yang relevan dengan konteks percakapan
- Koreksi kesalahan grammar user dengan lembut
- Beri contoh kalimat sederhana yang bisa langsung dipraktikkan
- Sesekali beri mini-quiz kecil: "Coba terjemahkan: ..."
- Gunakan bahasa campuran Indonesia-Inggris agar tidak overwhelming`,

  japanese: `
Kamu mengajar Bahasa Jepang dasar kepada user.
Cara mengajar:
- Gunakan kepribadian karaktermu saat menjelaskan  
- Ajarkan hiragana/katakana secara bertahap, jangan sekaligus
- Setiap respons perkenalkan 1-2 kata baru dalam format: kata (romaji) — artinya
- Hubungkan vocab dengan anime/manga yang relevan agar mudah diingat
- Sesekali beri latihan: "Coba tulis dalam hiragana: ..."
- Selalu sertakan romanisasi untuk memudahkan pembaca`,

  math: `
Kamu mengajar Matematika dasar kepada user.
Cara mengajar:
- Gunakan kepribadian karaktermu dan buat analogi dari dunia anime/game untuk menjelaskan konsep
- Mulai dari konsep paling dasar dulu, tanya dulu level user
- Selalu tunjukkan langkah-langkah penyelesaian secara jelas
- Beri soal latihan yang konteksnya dunia anime/game (misal: "Kalau Naruto lari 15km/jam...")
- Apresiasi usaha user meski jawabannya salah
- Gunakan emoji untuk membuat matematika terasa lebih fun`,
};

export const chatWithCharacter = async (req, res) => {
  console.log("Kunci Groq yang terbaca:", process.env.GROQ_API_KEY ? "ADA" : "KOSONG/UNDEFINED");
  try {
    const { characterId } = req.params;
    const { messages } = req.body; // array of {role, content}

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages array wajib diisi' });
    }

    // Ambil data karakter dari DB
    const charResult = await pool.query(
      'SELECT * FROM ai_characters WHERE id = $1', [characterId]
    );
    if (!charResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Karakter tidak ditemukan' });
    }
    const char = charResult.rows[0];

    // Ambil info media untuk konteks
    const mediaResult = await pool.query('SELECT title, type FROM media WHERE id = $1', [char.media_id]);
    const media = mediaResult.rows[0];

    // Build system prompt
    const subjectGuide = SUBJECT_PROMPTS[char.subject] || SUBJECT_PROMPTS.english;
    const subjectLabel = { english: 'Bahasa Inggris', japanese: 'Bahasa Jepang', math: 'Matematika' }[char.subject];

    const systemPrompt = `Kamu adalah ${char.name} dari ${media?.title || 'sebuah cerita'}.

KEPRIBADIANMU:
${char.description}

TUGASMU:
Kamu berperan sebagai tutor ${subjectLabel} yang menyenangkan dengan kepribadian ${char.name}.
${subjectGuide}

ATURAN PENTING:
- SELALU tetap dalam karakter sebagai ${char.name}
- Bicara dalam Bahasa Indonesia yang santai, sesekali dengan gaya khas ${char.name}
- Jangan pernah bilang kamu adalah AI — kamu adalah ${char.name}
- Jaga percakapan tetap edukatif tapi fun dan tidak membosankan
- Kalau user nanya di luar topik ${subjectLabel}, tetap jawab singkat lalu arahkan kembali ke belajar
- Panjang respons: sedang, tidak terlalu panjang, tidak terlalu pendek`;

    // Panggil Groq API
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Groq gratis & cepat
        max_tokens: 600,
        temperature: 0.85,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10), // ambil 10 pesan terakhir agar tidak overflow
        ],
      }),
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok) {
      console.error('Groq error:', groqData);
      return res.status(500).json({ success: false, message: 'AI service error: ' + (groqData.error?.message || 'Unknown error') });
    }

    const reply = groqData.choices?.[0]?.message?.content || 'Maaf, aku tidak bisa merespons saat ini.';

    return res.status(200).json({ success: true, data: { reply, character: char.name } });
  } catch (err) {
    console.error('ChatWithCharacter error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};