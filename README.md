# 🎮 OtakuVault — Track Your Anime, Manhwa & Games

> Platform tracking koleksi untuk Gen Z yang suka anime, manhwa, manga, game, dan komik.

![OtakuVault Banner](https://picsum.photos/seed/otakuvault/1200/400)

## ✨ Fitur

- 🔐 **Autentikasi** — Register/Login dengan JWT & Bcrypt password hashing
- 🎌 **Browse Media** — Explore anime, manhwa, manga, game, dan comic dengan filter & search
- 📋 **My Collection** — Tambah, edit, dan hapus dari koleksi pribadi
- ⭐ **Rating & Status** — Beri rating 0-10 dan status (Watching, Completed, Dropped, dsb.)
- 📊 **Dashboard Stats** — Statistik koleksi lengkap per type & status
- 👤 **Profile** — Edit bio & avatar, lihat breakdown koleksi

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Express.js |
| Database | PostgreSQL |
| Auth | JWT + Bcrypt |
| HTTP Client | Axios |

## 📁 Struktur Proyek

```
otakuvault/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL connection pool
│   │   │   └── schema.sql        # SQL schema + seed data
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── mediaController.js
│   │   │   └── collectionController.js
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── media.js
│   │   │   └── collections.js
│   │   └── index.js              # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx
    │   │   │   └── Navbar.jsx
    │   │   └── ui/
    │   │       └── MediaCard.jsx  # Reusable card + modal
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── HomePage.jsx       # Landing + stats
    │   │   ├── BrowsePage.jsx     # Browse + filter + search
    │   │   ├── MediaDetailPage.jsx
    │   │   ├── CollectionPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── utils/
    │   │   └── api.js             # Axios instance + interceptors
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🗄️ Database Schema

### Tabel `users`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| username | VARCHAR(50) UNIQUE | Username unik |
| email | VARCHAR(100) UNIQUE | Email unik |
| password_hash | VARCHAR(255) | Hashed dengan bcrypt |
| avatar_url | TEXT | URL foto profil |
| bio | TEXT | Bio singkat |
| created_at | TIMESTAMPTZ | Waktu register |

### Tabel `media`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| title | VARCHAR(255) | Judul media |
| type | VARCHAR(20) | anime/manhwa/manga/game/comic |
| genre | VARCHAR(100) | Genre |
| description | TEXT | Sinopsis |
| cover_url | TEXT | URL cover |
| total_episodes | INTEGER | Jumlah episode/chapter/jam |
| status | VARCHAR(20) | ongoing/completed/cancelled |
| release_year | INTEGER | Tahun rilis |
| studio | VARCHAR(100) | Studio/developer |

### Tabel `collections`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| user_id | INTEGER FK | Relasi ke users |
| media_id | INTEGER FK | Relasi ke media |
| watch_status | VARCHAR(20) | watching/completed/dropped/etc |
| progress | INTEGER | Episode/chapter saat ini |
| rating | DECIMAL(3,1) | Rating 0-10 |
| review | TEXT | Ulasan pribadi |
| is_favorite | BOOLEAN | Tandai favorit |

## 🚀 Instalasi & Menjalankan

### Prerequisites
- Node.js v18+
- PostgreSQL 14+

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/otakuvault.git
cd otakuvault
```

### 2. Setup Database
```bash
# Buat database PostgreSQL
psql -U postgres
CREATE DATABASE otakuvault;
\q

# Jalankan schema
psql -U postgres -d otakuvault -f backend/src/config/schema.sql
```

### 3. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env sesuai konfigurasi database kamu

npm install
npm run dev
# Server berjalan di http://localhost:5000
```

### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
# App berjalan di http://localhost:5173
```

## 📡 REST API Endpoints

### Auth
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Registrasi |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Data user saat ini |
| PATCH | `/api/auth/profile` | ✅ | Update profil |

### Media
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| GET | `/api/media` | ❌ | List semua media (filter, search, paginate) |
| GET | `/api/media/:id` | ❌ | Detail media |
| POST | `/api/media` | ✅ | Tambah media baru |
| PATCH | `/api/media/:id` | ✅ | Update media |
| DELETE | `/api/media/:id` | ✅ | Hapus media |

### Collections
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| GET | `/api/collections` | ✅ | Koleksi user (filter status/type) |
| GET | `/api/collections/stats` | ✅ | Statistik koleksi |
| POST | `/api/collections` | ✅ | Tambah ke koleksi |
| PATCH | `/api/collections/:id` | ✅ | Update koleksi |
| DELETE | `/api/collections/:id` | ✅ | Hapus dari koleksi |

## 📄 Halaman (Pages)

| Halaman | Route | Auth | Keterangan |
|---------|-------|------|-----------|
| Home | `/` | ❌ | Landing + featured + stats |
| Browse | `/browse` | ❌ | Explore semua media |
| Detail | `/media/:id` | ❌ | Detail media |
| Collection | `/collection` | ✅ | Koleksi pribadi |
| Profile | `/profile` | ✅ | Profil & statistik |
| Login | `/login` | ❌ | Halaman login |
| Register | `/register` | ❌ | Halaman registrasi |

## 🔐 Keamanan

- Password di-hash menggunakan **bcrypt** (salt rounds: 12)
- Autentikasi menggunakan **JWT** dengan expiry 7 hari
- Protected routes di frontend dan backend
- Token disimpan di `localStorage` dan dikirim via `Authorization: Bearer <token>`
- Global Axios interceptor untuk handle 401 (auto logout)

## 🌐 Deployment

### Backend (Railway / Render)
1. Push ke GitHub
2. Connect repo ke Railway/Render
3. Set environment variables dari `.env.example`
4. Deploy!

### Frontend (Vercel)
1. Push ke GitHub
2. Import ke Vercel
3. Set `VITE_API_URL` jika backend bukan di localhost
4. Deploy!

---

Made with ❤️ for Otaku by Otaku 🎌
