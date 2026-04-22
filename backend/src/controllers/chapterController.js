import pool from '../config/database.js';

export const getChapterNotes = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM chapter_notes WHERE user_id = $1 AND media_id = $2 ORDER BY chapter_number ASC`,
      [userId, mediaId]
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createChapterNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { media_id, chapter_number, chapter_title, note, mood, cover_url } = req.body;
    if (!media_id || !chapter_number || !note) {
      return res.status(400).json({ success: false, message: 'media_id, chapter_number, dan note wajib diisi' });
    }
    const result = await pool.query(
      `INSERT INTO chapter_notes (user_id, media_id, chapter_number, chapter_title, note, mood, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, media_id, chapter_number, chapter_title || null, note, mood || 'neutral', cover_url || null]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateChapterNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { chapter_title, note, mood, cover_url } = req.body;
    const existing = await pool.query(
      'SELECT id FROM chapter_notes WHERE id = $1 AND user_id = $2', [id, userId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note tidak ditemukan' });
    }
    const result = await pool.query(
      `UPDATE chapter_notes SET
        chapter_title = COALESCE($1, chapter_title),
        note          = COALESCE($2, note),
        mood          = COALESCE($3, mood),
        cover_url     = COALESCE($4, cover_url),
        updated_at    = NOW()
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [chapter_title, note, mood, cover_url, id, userId]
    );
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteChapterNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await pool.query(
      'DELETE FROM chapter_notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note tidak ditemukan' });
    }
    return res.status(200).json({ success: true, message: 'Note dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};