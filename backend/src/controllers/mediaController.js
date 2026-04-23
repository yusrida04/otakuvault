import pool from '../config/database.js';

// GET /api/media - Get all media with optional filters
export const getAllMedia = async (req, res) => {
  try {
    const { type, genre, search, page = 1, limit = 12 } = req.query;
    const isLoggedIn = !!req.user;

    // Kalau belum login, batasi hanya 6 item sebagai preview
    const effectiveLimit = isLoggedIn ? parseInt(limit) : 6;
    const effectivePage  = isLoggedIn ? parseInt(page)  : 1;
    const offset         = (effectivePage - 1) * effectiveLimit;

    let query = 'SELECT * FROM media WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (type)   { query += ` AND type = $${paramIdx++}`;                            params.push(type); }
    if (genre)  { query += ` AND genre ILIKE $${paramIdx++}`;                       params.push(`%${genre}%`); }
    if (search && isLoggedIn) {
      query += ` AND (title ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`; 
      params.push(`%${search}%`); paramIdx++;
    }

    const countResult = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*)'), params
    );
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(effectiveLimit, offset);

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
      isPreview: !isLoggedIn,   // ← flag untuk frontend
      pagination: {
        total: isLoggedIn ? total : Math.min(total, 6),
        page: effectivePage,
        limit: effectiveLimit,
        totalPages: isLoggedIn ? Math.ceil(total / effectiveLimit) : 1,
      }
    });
  } catch (err) {
    console.error('GetAllMedia error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/media/:id
export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM media WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    
    // Get average rating from collections
    const ratingResult = await pool.query(
      'SELECT AVG(rating)::DECIMAL(3,1) as avg_rating, COUNT(*) as review_count FROM collections WHERE media_id = $1 AND rating IS NOT NULL',
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...result.rows[0],
        avg_rating: ratingResult.rows[0].avg_rating,
        review_count: parseInt(ratingResult.rows[0].review_count)
      }
    });
  } catch (err) {
    console.error('GetMediaById error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/media
export const createMedia = async (req, res) => {
  try {
    const { title, type, genre, description, cover_url, total_episodes, status, release_year, studio } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, message: 'Title and type are required' });
    }

    const validTypes = ['anime', 'manhwa', 'manga', 'game', 'comic'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Type must be one of: ${validTypes.join(', ')}` });
    }

    const result = await pool.query(
      'INSERT INTO media (title, type, genre, description, cover_url, total_episodes, status, release_year, studio) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [title, type, genre, description, cover_url, total_episodes, status || 'ongoing', release_year, studio]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('CreateMedia error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /api/media/:id
export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, genre, description, cover_url, total_episodes, status, release_year, studio } = req.body;

    const existing = await pool.query('SELECT id FROM media WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    const result = await pool.query(
      `UPDATE media SET 
        title = COALESCE($1, title),
        type = COALESCE($2, type),
        genre = COALESCE($3, genre),
        description = COALESCE($4, description),
        cover_url = COALESCE($5, cover_url),
        total_episodes = COALESCE($6, total_episodes),
        status = COALESCE($7, status),
        release_year = COALESCE($8, release_year),
        studio = COALESCE($9, studio)
      WHERE id = $10 RETURNING *`,
      [title, type, genre, description, cover_url, total_episodes, status, release_year, studio, id]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('UpdateMedia error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/media/:id
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM media WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    return res.status(200).json({ success: true, message: 'Media deleted successfully' });
  } catch (err) {
    console.error('DeleteMedia error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
