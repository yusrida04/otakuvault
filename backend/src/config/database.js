import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// FUNGSI OTOMATIS JALANKAN SCHEMA.SQL
const initDB = async () => {
  try {
    // Sesuaikan path ini dengan lokasi file schema.sql kamu
    const sqlPath = path.join(__dirname, '../../schema.sql'); 
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    console.log("✅ Database Schema & Sample Data Berhasil Dimasukkan!");
  } catch (err) {
    console.error("❌ Gagal Inisialisasi Database:", err.message);
  }
};

initDB();

export default pool;