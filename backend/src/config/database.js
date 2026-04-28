import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Cek apakah kita di production (Railway) atau di lokal
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool({
  // Pakai connectionString supaya langsung baca satu baris DATABASE_URL dari Railway
  connectionString: process.env.DATABASE_URL,
  // WAJIB: Tambahkan ini supaya bisa konek ke database online
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err);
  // Jangan langsung exit di production supaya server nggak gampang mati
  if (!isProduction) process.exit(-1);
});

export default pool;