import pool from '../config/database.js';

// Map status MAL → status OtakuVault
const MAL_ANIME_STATUS_MAP = {
  'watching':     'watching',
  'completed':    'completed',
  'on_hold':      'on_hold',
  'dropped':      'dropped',
  'plan_to_watch': 'plan_to_watch',
};

const MAL_MANGA_STATUS_MAP = {
  'reading':      'watching',   // manhwa/manga pakai watching
  'completed':    'completed',
  'on_hold':      'on_hold',
  'dropped':      'dropped',
  'plan_to_read': 'plan_to_watch',
};

// Helper: fetch semua halaman dari Jikan API
const fetchAllPages = async (url, maxPages = 10) => {
  let allData = [];
  let page    = 1;
  let hasNext = true;

  while (hasNext && page <= maxPages) {
    const res  = await fetch(`${url}&page=${page}`);
    
    if (!res.ok) {
      if (res.status === 404) break; // user tidak ditemukan
      throw new Error(`MAL API error: ${res.status}`);
    }

    const json = await res.json();
    
    if (json.data && json.data.length > 0) {
      allData = [...allData, ...json.data];
      hasNext = json.pagination?.has_next_page || false;
      page++;

      // Rate limit Jikan: 3 req/detik, tunggu 400ms antar halaman
      if (hasNext) await new Promise(r => setTimeout(r, 400));
    } else {
      hasNext = false;
    }
  }

  return allData;
};

// Helper: upsert media ke DB, return media_id
const upsertMedia = async (client, mediaData) => {
  const {
    mal_id, title, type, genre, description,
    cover_url, total_episodes, status, release_year, studio
  } = mediaData;

  // Cek dulu apakah sudah ada berdasarkan title + type
  const existing = await client.query(
    'SELECT id FROM media WHERE title = $1 AND type = $2 LIMIT 1',
    [title, type]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  // Insert baru
  const result = await client.query(
    `INSERT INTO media (title, type, genre, description, cover_url, total_episodes, status, release_year, studio)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [title, type, genre, description, cover_url, total_episodes, status, release_year, studio]
  );

  return result.rows[0].id;
};

// Helper: upsert collection
const upsertCollection = async (client, userId, mediaId, watchStatus, progress, rating) => {
  await client.query(
    `INSERT INTO collections (user_id, media_id, watch_status, progress, rating)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, media_id) DO UPDATE SET
       watch_status = EXCLUDED.watch_status,
       progress     = EXCLUDED.progress,
       rating       = CASE WHEN EXCLUDED.rating IS NOT NULL THEN EXCLUDED.rating ELSE collections.rating END,
       updated_at   = NOW()`,
    [userId, mediaId, watchStatus, progress, rating]
  );
};

// POST /api/sync/mal
export const syncMAL = async (req, res) => {
  const userId      = req.user.id;
  const { username, sync_anime = true, sync_manga = true } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Username MAL wajib diisi' });
  }

  const malUsername = username.trim();

  // Cek apakah user MAL valid dulu
  try {
    const checkRes = await fetch(`https://api.jikan.moe/v4/users/${malUsername}`);
    if (!checkRes.ok) {
      return res.status(404).json({
        success: false,
        message: `Username MAL "${malUsername}" tidak ditemukan. Pastikan username benar dan profil MAL kamu tidak di-private.`
      });
    }
  } catch (err) {
    return res.status(503).json({ success: false, message: 'Tidak bisa terhubung ke MyAnimeList. Coba lagi nanti.' });
  }

  const summary = {
    anime: { synced: 0, skipped: 0, errors: 0 },
    manga: { synced: 0, skipped: 0, errors: 0 },
    total: 0,
  };

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── SYNC ANIME ────────────────────────────────────────────────────────────
    if (sync_anime) {
      let animeList = [];
      try {
        animeList = await fetchAllPages(
          `https://api.jikan.moe/v4/users/${malUsername}/animelist?limit=300`
        );
      } catch (err) {
        console.error('Error fetching anime list:', err);
      }

      for (const entry of animeList) {
        try {
          const anime = entry.anime || entry;
          if (!anime?.title) { summary.anime.skipped++; continue; }

          const genres    = anime.genres?.map(g => g.name).slice(0, 3).join(', ') || null;
          const studio    = anime.studios?.[0]?.name || null;
          const episodes  = anime.episodes || null;
          const year      = anime.year || anime.aired?.prop?.from?.year || null;
          const malStatus = anime.status?.toLowerCase() || 'finished_airing';
          const dbStatus  = malStatus.includes('airing') ? 'ongoing'
                          : malStatus.includes('finished') ? 'completed' : 'ongoing';

          const mediaId = await upsertMedia(client, {
            title:           anime.title,
            type:            'anime',
            genre:           genres,
            description:     anime.synopsis?.slice(0, 500) || null,
            cover_url:       anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
            total_episodes:  episodes,
            status:          dbStatus,
            release_year:    year,
            studio:          studio,
          });

          const watchStatus = MAL_ANIME_STATUS_MAP[entry.watching_status?.toLowerCase()] || 'plan_to_watch';
          const progress    = entry.watched_episodes || 0;
          const rating      = entry.score > 0 ? entry.score : null;

          await upsertCollection(client, userId, mediaId, watchStatus, progress, rating);
          summary.anime.synced++;
        } catch (err) {
          console.error('Error syncing anime entry:', err.message);
          summary.anime.errors++;
        }
      }
    }

    // ── SYNC MANGA/MANHWA ─────────────────────────────────────────────────────
    if (sync_manga) {
      let mangaList = [];
      try {
        mangaList = await fetchAllPages(
          `https://api.jikan.moe/v4/users/${malUsername}/mangalist?limit=300`
        );
      } catch (err) {
        console.error('Error fetching manga list:', err);
      }

      for (const entry of mangaList) {
        try {
          const manga = entry.manga || entry;
          if (!manga?.title) { summary.manga.skipped++; continue; }

          // Deteksi manhwa vs manga berdasarkan type dari MAL
          const malType  = manga.type?.toLowerCase() || 'manga';
          const dbType   = malType === 'manhwa' ? 'manhwa'
                         : malType === 'manhua' ? 'manhwa'  // treat manhua as manhwa
                         : 'manga';

          const genres   = manga.genres?.map(g => g.name).slice(0, 3).join(', ') || null;
          const author   = manga.authors?.[0]?.name || null;
          const chapters = manga.chapters || null;
          const year     = manga.published?.prop?.from?.year || null;
          const malStatus = manga.status?.toLowerCase() || '';
          const dbStatus  = malStatus.includes('publishing') ? 'ongoing'
                          : malStatus.includes('finished') ? 'completed' : 'ongoing';

          const mediaId = await upsertMedia(client, {
            title:          manga.title,
            type:           dbType,
            genre:          genres,
            description:    manga.synopsis?.slice(0, 500) || null,
            cover_url:      manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || null,
            total_episodes: chapters,
            status:         dbStatus,
            release_year:   year,
            studio:         author,
          });

          const watchStatus = MAL_MANGA_STATUS_MAP[entry.reading_status?.toLowerCase()] || 'plan_to_watch';
          const progress    = entry.chapters_read || 0;
          const rating      = entry.score > 0 ? entry.score : null;

          await upsertCollection(client, userId, mediaId, watchStatus, progress, rating);
          summary.manga.synced++;
        } catch (err) {
          console.error('Error syncing manga entry:', err.message);
          summary.manga.errors++;
        }
      }
    }

    await client.query('COMMIT');

    summary.total = summary.anime.synced + summary.manga.synced;

    return res.status(200).json({
      success: true,
      message: `Berhasil sync ${summary.total} item dari MAL!`,
      data: { username: malUsername, summary }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('MAL sync error:', err);
    return res.status(500).json({ success: false, message: 'Sync gagal. Coba lagi nanti.' });
  } finally {
    client.release();
  }
};

// GET /api/sync/mal/preview/:username
// Preview berapa item yang akan di-sync (tanpa benar-benar sync)
export const previewMAL = async (req, res) => {
  const { username } = req.params;
  if (!username) return res.status(400).json({ success: false, message: 'Username diperlukan' });

  try {
    // Cek user valid
    const userRes = await fetch(`https://api.jikan.moe/v4/users/${username}`);
    if (!userRes.ok) {
      return res.status(404).json({
        success: false,
        message: `Username MAL "${username}" tidak ditemukan atau profil di-private`
      });
    }
    const userData = await userRes.json();
    const stats    = userData.data?.statistics;

    return res.status(200).json({
      success: true,
      data: {
        username,
        avatar:      userData.data?.images?.jpg?.image_url || null,
        joined:      userData.data?.joined,
        anime_count: stats?.anime?.total_entries || 0,
        manga_count: stats?.manga?.total_entries || 0,
        total:       (stats?.anime?.total_entries || 0) + (stats?.manga?.total_entries || 0),
      }
    });
  } catch (err) {
    return res.status(503).json({ success: false, message: 'Tidak bisa terhubung ke MAL' });
  }
};