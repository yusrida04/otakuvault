import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// FUNGSI STANDAR UNTUK CEK KONEKSI & BUAT TABEL
const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Berhasil konek ke PostgreSQL Railway!");
    
    // Kita buat dua tabel utama dulu supaya webnya bisa jalan
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        genre VARCHAR(100),
        cover_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Masukkan data dummy kalau tabel media masih kosong
    const res = await client.query('SELECT COUNT(*) FROM media');
    if (parseInt(res.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO media (title, type, genre, cover_url) VALUES
        ('Attack on Titan', 'anime', 'Action', 'https://picsum.photos/seed/aot/300/400'),
        ('One Piece', 'anime', 'Adventure', 'https://picsum.photos/seed/op/300/400'),
        ('Solo Leveling', 'manhwa', 'Fantasy', 'https://picsum.photos/seed/sl/300/400');
      `);
      console.log("✅ Data dummy berhasil dimasukkan!");
    }
    
    client.release();
  } catch (err) {
    console.error("❌ Database Error:", err.message);
  }
};

initDB();

export default pool;