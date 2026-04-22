import pool from '../config/database.js';

// GET /api/collections - Get user's collection
export const getUserCollection = async (req, res) => {
  try {
    const { watch_status, type, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = `
      SELECT c.*, m.title, m.type, m.genre, m.cover_url, m.total_episodes, m.studio, m.release_year
      FROM collections c
      JOIN media m ON c.media_id = m.id
      WHERE c.user_id = $1
    `;
    const params = [userId];
    let paramIdx = 2;

    if (watch_status) {
      query += ` AND c.watch_status = $${paramIdx++}`;
      params.push(watch_status);
    }
    if (type) {
      query += ` AND m.type = $${paramIdx++}`;
      params.push(type);
    }

    const countQuery = query.replace(/SELECT c\.\*.*FROM/, 'SELECT COUNT(*) FROM').split('ORDER')[0];
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM collections c JOIN media m ON c.media_id = m.id WHERE c.user_id = $1 ${watch_status ? `AND c.watch_status = '${watch_status}'` : ''} ${type ? `AND m.type = '${type}'` : ''}`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY c.updated_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('GetUserCollection error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/collections/stats - Get user stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const statusStats = await pool.query(
      `SELECT watch_status, COUNT(*) as count FROM collections WHERE user_id = $1 GROUP BY watch_status`,
      [userId]
    );

    const typeStats = await pool.query(
      `SELECT m.type, COUNT(*) as count FROM collections c JOIN media m ON c.media_id = m.id WHERE c.user_id = $1 GROUP BY m.type`,
      [userId]
    );

    const ratingStats = await pool.query(
      `SELECT AVG(rating)::DECIMAL(3,1) as avg_rating, COUNT(*) as rated_count FROM collections WHERE user_id = $1 AND rating IS NOT NULL`,
      [userId]
    );

    const favoriteCount = await pool.query(
      `SELECT COUNT(*) FROM collections WHERE user_id = $1 AND is_favorite = TRUE`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        by_status: statusStats.rows,
        by_type: typeStats.rows,
        avg_rating: ratingStats.rows[0].avg_rating,
        rated_count: parseInt(ratingStats.rows[0].rated_count),
        favorite_count: parseInt(favoriteCount.rows[0].count)
      }
    });
  } catch (err) {
    console.error('GetUserStats error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/collections
export const addToCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { media_id, watch_status, progress, rating, review, is_favorite } = req.body;

    if (!media_id) {
      return res.status(400).json({ success: false, message: 'media_id is required' });
    }

    // Check media exists
    const mediaCheck = await pool.query('SELECT id FROM media WHERE id = $1', [media_id]);
    if (mediaCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    const result = await pool.query(
      `INSERT INTO collections (user_id, media_id, watch_status, progress, rating, review, is_favorite)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, media_id) DO UPDATE SET
         watch_status = EXCLUDED.watch_status,
         progress = EXCLUDED.progress,
         rating = EXCLUDED.rating,
         review = EXCLUDED.review,
         is_favorite = EXCLUDED.is_favorite,
         updated_at = NOW()
       RETURNING *`,
      [userId, media_id, watch_status || 'plan_to_watch', progress || 0, rating, review, is_favorite || false]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('AddToCollection error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /api/collections/:id
export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { watch_status, progress, rating, review, is_favorite } = req.body;

    const existing = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Collection entry not found' });
    }

    const result = await pool.query(
      `UPDATE collections SET
        watch_status = COALESCE($1, watch_status),
        progress = COALESCE($2, progress),
        rating = COALESCE($3, rating),
        review = COALESCE($4, review),
        is_favorite = COALESCE($5, is_favorite),
        updated_at = NOW()
      WHERE id = $6 AND user_id = $7 RETURNING *`,
      [watch_status, progress, rating, review, is_favorite, id, userId]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('UpdateCollection error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/collections/:id
export const removeFromCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Collection entry not found' });
    }

    return res.status(200).json({ success: true, message: 'Removed from collection' });
  } catch (err) {
    console.error('RemoveFromCollection error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
