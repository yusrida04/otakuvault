import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database Connected!");

    // Skema inti biar API langsung jalan
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        genre VARCHAR(100),
        cover_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Cek kalau kosong, isi data dummy
    const checkMedia = await client.query('SELECT COUNT(*) FROM media');
    if (parseInt(checkMedia.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO media (title, type, genre, cover_url) VALUES
        ('Attack on Titan', 'anime', 'Action', 'https://picsum.photos/seed/aot/300/400'),
        ('Solo Leveling', 'manhwa', 'Fantasy', 'https://picsum.photos/seed/sl/300/400'),
        ('One Piece', 'anime', 'Adventure', 'https://picsum.photos/seed/op/300/400')
      `);
      console.log("✅ Data dummy seeded!");
    }
    client.release();
  } catch (err) {
    console.error("❌ DB Init Error:", err.message);
  }
};

initDB();
export default pool;