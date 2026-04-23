import pool from '../config/database.js';

// ── Game Journal ──────────────────────────────────────────────────────────────

export const getJournal = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { type } = req.query;
    const userId = req.user.id;

    let query = `SELECT * FROM game_journal WHERE user_id = $1 AND media_id = $2`;
    const params = [userId, mediaId];
    if (type) { query += ` AND entry_type = $3`; params.push(type); }
    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createJournalEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { media_id, entry_type, title, content, difficulty, tags, cover_url } = req.body;
    if (!media_id || !title || !content) {
      return res.status(400).json({ success: false, message: 'media_id, title, content wajib diisi' });
    }
    const result = await pool.query(
      `INSERT INTO game_journal (user_id, media_id, entry_type, title, content, difficulty, tags, cover_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, media_id, entry_type || 'strategy', title, content, difficulty || 'medium', tags || null, cover_url || null]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, difficulty, tags, cover_url } = req.body;
    const existing = await pool.query('SELECT id FROM game_journal WHERE id=$1 AND user_id=$2', [id, userId]);
    if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Entry tidak ditemukan' });
    const result = await pool.query(
      `UPDATE game_journal SET title=COALESCE($1,title), content=COALESCE($2,content),
       difficulty=COALESCE($3,difficulty), tags=COALESCE($4,tags), cover_url=COALESCE($5,cover_url),
       updated_at=NOW() WHERE id=$6 AND user_id=$7 RETURNING *`,
      [title, content, difficulty, tags, cover_url, id, userId]
    );
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await pool.query('DELETE FROM game_journal WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Entry tidak ditemukan' });
    return res.status(200).json({ success: true, message: 'Entry dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Game Collection ───────────────────────────────────────────────────────────

export const getGameCollection = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { item_type } = req.query;
    const userId = req.user.id;
    let query = `SELECT * FROM game_collection WHERE user_id=$1 AND media_id=$2`;
    const params = [userId, mediaId];
    if (item_type) { query += ` AND item_type=$3`; params.push(item_type); }
    query += ` ORDER BY rarity DESC, created_at DESC`;
    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addGameItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { media_id, item_type, name, description, rarity, image_url, is_owned, power_rating, availability } = req.body;
    if (!media_id || !name) return res.status(400).json({ success: false, message: 'media_id dan name wajib diisi' });
    const result = await pool.query(
      `INSERT INTO game_collection (user_id,media_id,item_type,name,description,rarity,image_url,is_owned,power_rating,availability)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [userId, media_id, item_type || 'skin', name, description || null, rarity || 'common', image_url || null, is_owned !== false, power_rating || null, availability || null]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateGameItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, rarity, image_url, is_owned, power_rating, availability } = req.body;
    const existing = await pool.query('SELECT id FROM game_collection WHERE id=$1 AND user_id=$2', [id, userId]);
    if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });
    const result = await pool.query(
      `UPDATE game_collection SET name=COALESCE($1,name), description=COALESCE($2,description),
       rarity=COALESCE($3,rarity), image_url=COALESCE($4,image_url), is_owned=COALESCE($5,is_owned),
       power_rating=COALESCE($6,power_rating), availability=COALESCE($7,availability)
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [name, description, rarity, image_url, is_owned, power_rating, availability, id, userId]
    );
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteGameItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await pool.query('DELETE FROM game_collection WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });
    return res.status(200).json({ success: true, message: 'Item dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};