# 🎮 OtakuVault — Track Your Anime, Manhwa & Games

> Platform tracking koleksi untuk Gen Z yang suka anime, manhwa, manga, game, dan komik.  
> Dilengkapi AI Tutor karakter, Game Journal, Chapter Notes, dan Sync dari MyAnimeList!

![Netlify Status](https://img.shields.io/badge/Netlify-Live-00C7B7?style=for-the-badge&logo=netlify)
![Railway Status](https://img.shields.io/badge/Railway-Backend-0B0D0E?style=for-the-badge&logo=railway)

### 🔗 Links
- **Frontend:** [https://otakuvault-id.netlify.app](https://otakuvault-id.netlify.app)
- **Backend API:** [https://otakuvault-production.up.railway.app](https://otakuvault-production.up.railway.app)

---

## ✨ Fitur Lengkap

### 🔐 Autentikasi
- Register & Login dengan JWT + Bcrypt password hashing (salt rounds: 12)
- Protected routes di frontend & backend
- Auto logout jika token expired

### 🎌 Browse & Media
- Explore anime, manhwa, manga, game, comic dengan filter kategori & search
- Preview terbatas (6 item) untuk guest — login untuk akses penuh
- Tambah media baru langsung dari halaman Browse (hanya user login)
- Ganti cover media via URL (hover pada gambar di halaman detail)

### 📋 My Collection
- Tambah, edit, hapus dari koleksi pribadi
- Status tracking: Watching / Completed / Dropped / Plan to Watch / On Hold / Playing / Played
- Progress episode/chapter/jam dengan progress bar
- Rating 0–10 + review pribadi + tandai favorit
- Filter koleksi by status & tipe media

### 📝 Chapter Notes (Anime, Manhwa, Manga, Comic)
- Tulis catatan & tanggapan per chapter/episode
- Pilih mood setelah baca: 🤯 Mind Blown, 🔥 Hype, 😭 Nangis, dll (10 mood)
- Tambah gambar sampul per chapter via URL
- Mood dominan summary — lihat overall feel satu series
- Urutkan catatan dari chapter terbaru atau terlama

### 🎮 Game Journal & Collection (khusus tipe Game)
- **Strategy Journal** — tulis strategi, tips, catatan misi dengan tag difficulty
- **Item Collection** — koleksi skin/hero/weapon/build/achievement
- Sistem rarity: Common → Rare → Epic → Legendary → Mythic (dengan glow effect)
- Power Rating bar per item (0–100)
- Wishlist mode untuk item yang belum dimiliki
- Stats: total journal entries, owned, wishlist, legendary+

### 🤖 AI Tutor Karakter (inspirasi c.ai)
- Buat karakter AI dari anime/game favorit (nama, kepribadian, greeting)
- Pilih mata pelajaran: 🇬🇧 Bahasa Inggris / 🇯🇵 Bahasa Jepang / 🔢 Matematika
- AI berperan sebagai karakter tersebut untuk ngajarin dengan gaya unik
- Quick starter prompts per mata pelajaran
- Ditenagai **Groq API** (llama-3.1-8b-instant) — gratis & cepat
- Chat window real-time dengan typing indicator

### 🔄 Sync dari MyAnimeList
- Import seluruh koleksi anime & manga dari akun MAL kamu
- Cukup masukkan username MAL — tidak perlu API key
- Preview dulu sebelum sync (tampilkan jumlah item)
- Auto-create media yang belum ada di database
- Sync status, progress, dan rating otomatis
- Pilih sync anime saja, manga saja, atau keduanya

### 📊 Dashboard & Profil
- Statistik koleksi: total, completed, avg rating, favorit
- Breakdown by status & by tipe media
- Edit bio & avatar URL
- Progress bar per status

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Express.js |
| Database | PostgreSQL |
| Auth | JWT + Bcrypt |
| HTTP Client | Axios |
| AI Chat | Groq API (llama-3.1-8b-instant) |
| MAL Sync | Jikan API v4 (no key needed) |

---

## 📁 Struktur Proyek

```
otakuvault/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js              # PostgreSQL connection pool
│   │   │   └── schema.sql               # SQL schema + seed data (15 media)
│   │   ├── controllers/
│   │   │   ├── authController.js        # Register, login, profile
│   │   │   ├── mediaController.js       # CRUD media + preview mode
│   │   │   ├── collectionController.js  # CRUD koleksi + stats
│   │   │   ├── chapterController.js     # Chapter notes + mood
│   │   │   ├── gameController.js        # Game journal + item collection
│   │   │   ├── characterController.js   # AI character CRUD + chat
│   │   │   └── malSyncController.js     # MAL sync via Jikan API
│   │   ├── middleware/
│   │   │   └── auth.js                  # JWT authenticate + optionalAuth
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── media.js
│   │   │   ├── collections.js
│   │   │   ├── chapters.js
│   │   │   ├── game.js
│   │   │   ├── characters.js
│   │   │   └── sync.js
│   │   └── index.js                     # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx
    │   │   │   └── Navbar.jsx           # Sticky navbar + dropdown + click outside
    │   │   └── ui/
    │   │       ├── MediaCard.jsx        # Card + add/edit modal inline
    │   │       ├── CharacterChat.jsx    # AI tutor chat UI
    │   │       └── MALSync.jsx          # MAL sync 4-step flow
    │   ├── context/
    │   │   └── AuthContext.jsx          # Global auth state
    │   ├── pages/
    │   │   ├── HomePage.jsx             # Landing + featured + user stats
    │   │   ├── BrowsePage.jsx           # Browse + filter + search + add media
    │   │   ├── MediaDetailPage.jsx      # Detail + chapter notes / game journal / AI tutor
    │   │   ├── CollectionPage.jsx       # Koleksi pribadi + filter
    │   │   ├── ProfilePage.jsx          # Profil + stats + MAL sync
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── utils/
    │   │   └── api.js                   # Axios instance + interceptors
    │   ├── App.jsx                      # Router + protected routes
    │   ├── main.jsx
    │   └── index.css                    # Tailwind + custom components
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🗄️ Database Schema (7 Tabel)

### `users`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| username | VARCHAR(50) UNIQUE | Username unik |
| email | VARCHAR(100) UNIQUE | Email unik |
| password_hash | VARCHAR(255) | Hashed bcrypt |
| avatar_url | TEXT | URL foto profil |
| bio | TEXT | Bio singkat |
| created_at | TIMESTAMPTZ | Waktu register |

### `media`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| title | VARCHAR(255) | Judul media |
| type | VARCHAR(20) | anime / manhwa / manga / game / comic |
| genre | VARCHAR(100) | Genre |
| description | TEXT | Sinopsis |
| cover_url | TEXT | URL cover (bisa diedit) |
| total_episodes | INTEGER | Episode / chapter / estimasi jam |
| status | VARCHAR(20) | ongoing / completed / cancelled |
| release_year | INTEGER | Tahun rilis |
| studio | VARCHAR(100) | Studio / developer / author |

### `collections`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| user_id | INTEGER FK | → users |
| media_id | INTEGER FK | → media |
| watch_status | VARCHAR(20) | watching / completed / dropped / plan_to_watch / on_hold / playing / played |
| progress | INTEGER | Episode/chapter/jam saat ini |
| rating | DECIMAL(3,1) | Rating 0–10 |
| review | TEXT | Ulasan pribadi |
| is_favorite | BOOLEAN | Tandai favorit |
| UNIQUE | (user_id, media_id) | Cegah duplikat |

### `chapter_notes`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| user_id | INTEGER FK | → users |
| media_id | INTEGER FK | → media |
| chapter_number | INTEGER | Nomor chapter |
| chapter_title | VARCHAR(255) | Judul chapter (opsional) |
| note | TEXT | Catatan/tanggapan |
| mood | VARCHAR(30) | mindblown/hype/love/cry/sad/laugh/angry/confused/bored/neutral |
| cover_url | TEXT | Gambar sampul chapter |

### `game_journal`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| user_id | INTEGER FK | → users |
| media_id | INTEGER FK | → media |
| entry_type | VARCHAR(20) | strategy / mission / tip / story |
| title | VARCHAR(255) | Judul entry |
| content | TEXT | Isi strategi/catatan |
| difficulty | VARCHAR(20) | easy / medium / hard / extreme |
| tags | VARCHAR(255) | Tag comma-separated |
| cover_url | TEXT | Screenshot / gambar |

### `game_collection`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| user_id | INTEGER FK | → users |
| media_id | INTEGER FK | → media |
| item_type | VARCHAR(20) | skin / hero / weapon / build / item / achievement |
| name | VARCHAR(255) | Nama item |
| rarity | VARCHAR(20) | common / rare / epic / legendary / mythic |
| image_url | TEXT | Gambar item |
| is_owned | BOOLEAN | Dimiliki atau wishlist |
| power_rating | INTEGER | Kekuatan 0–100 |
| availability | VARCHAR(50) | Event / Shop / Season / dll |

### `ai_characters`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | SERIAL PK | Primary key |
| user_id | INTEGER FK | → users (creator) |
| media_id | INTEGER FK | → media |
| name | VARCHAR(100) | Nama karakter |
| tagline | VARCHAR(255) | Tagline singkat |
| description | TEXT | Kepribadian karakter |
| greeting | TEXT | Kalimat pembuka |
| avatar_url | TEXT | URL avatar |
| subject | VARCHAR(20) | english / japanese / math |

---

## 🚀 Instalasi & Menjalankan

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Groq API key (gratis di [console.groq.com](https://console.groq.com))

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/otakuvault.git
cd otakuvault
```

### 2. Setup Database
```bash
# Buat database
psql -U postgres -c "CREATE DATABASE otakuvault;"

# Jalankan schema (otomatis buat semua tabel + 15 data awal)
psql -U postgres -d otakuvault -f backend/src/config/schema.sql
```

### 3. Setup Backend
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=otakuvault
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx   # dari console.groq.com
```

```bash
npm install
npm run dev
# ✅ Server: http://localhost:5000
```

### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ App: http://localhost:5173
```

---

## 📡 REST API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| POST | `/register` | ❌ | Registrasi akun baru |
| POST | `/login` | ❌ | Login |
| GET | `/me` | ✅ | Data user yang login |
| PATCH | `/profile` | ✅ | Update bio & avatar |

### Media — `/api/media`
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| GET | `/` | ❌* | List media (preview 6 jika guest) |
| GET | `/:id` | ❌ | Detail media + avg rating |
| POST | `/` | ✅ | Tambah media baru |
| PATCH | `/:id` | ✅ | Update media (termasuk cover) |
| DELETE | `/:id` | ✅ | Hapus media |

*Guest hanya dapat 6 item preview

### Collections — `/api/collections`
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| GET | `/` | ✅ | Koleksi user (filter status/type) |
| GET | `/stats` | ✅ | Statistik koleksi |
| POST | `/` | ✅ | Tambah ke koleksi |
| PATCH | `/:id` | ✅ | Update status/progress/rating |
| DELETE | `/:id` | ✅ | Hapus dari koleksi |

### Chapter Notes — `/api/chapters`
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| GET | `/:mediaId` | ✅ | Semua catatan user untuk media ini |
| POST | `/` | ✅ | Tulis catatan baru |
| PATCH | `/:id` | ✅ | Edit catatan |
| DELETE | `/:id` | ✅ | Hapus catatan |

### Game — `/api/game`
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| GET | `/journal/:mediaId` | ✅ | Semua journal entries |
| POST | `/journal` | ✅ | Tulis journal baru |
| PATCH | `/journal/:id` | ✅ | Edit journal |
| DELETE | `/journal/:id` | ✅ | Hapus journal |
| GET | `/collection/:mediaId` | ✅ | Koleksi item game |
| POST | `/collection` | ✅ | Tambah item |
| PATCH | `/collection/:id` | ✅ | Edit item |
| DELETE | `/collection/:id` | ✅ | Hapus item |

### AI Characters — `/api/characters`
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| GET | `/:mediaId` | ❌ | List karakter AI untuk media |
| POST | `/` | ✅ | Buat karakter baru |
| DELETE | `/:id` | ✅ | Hapus karakter (hanya creator) |
| POST | `/:characterId/chat` | ✅ | Chat dengan karakter |

### MAL Sync — `/api/sync`
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|-----------|
| GET | `/mal/preview/:username` | ❌ | Preview koleksi MAL user |
| POST | `/mal` | ✅ | Sync koleksi MAL ke database |

---

## 📄 Halaman (7 Pages)

| Halaman | Route | Auth | Keterangan |
|---------|-------|------|-----------|
| Home | `/` | ❌ | Landing, featured media, user stats |
| Browse | `/browse` | ❌* | Explore, filter, search, tambah media |
| Detail | `/media/:id` | ❌ | Info, chapter notes/game journal, AI tutor |
| Collection | `/collection` | ✅ | Koleksi pribadi + MAL sync |
| Profile | `/profile` | ✅ | Profil, stats, MAL sync |
| Login | `/login` | ❌ | Halaman login |
| Register | `/register` | ❌ | Halaman registrasi |

*Guest hanya lihat 6 item preview di Browse & Home

---

## 🔐 Keamanan

- Password di-hash menggunakan **bcrypt** (salt rounds: 12)
- JWT token dengan expiry **7 hari**
- `authenticate` middleware untuk protected routes
- `optionalAuth` middleware untuk routes yang optional login (Browse preview)
- Token di `localStorage`, dikirim via `Authorization: Bearer <token>`
- Global Axios interceptor: auto logout jika 401
- Unique constraint `(user_id, media_id)` di tabel collections — cegah duplikat

---

## 🤖 Setup Groq API (AI Tutor)

1. Daftar gratis di [console.groq.com](https://console.groq.com)
2. Buat API key baru
3. Isi di `.env` backend: `GROQ_API_KEY=gsk_xxx...`
4. Model yang dipakai: `llama-3.1-8b-instant` (gratis, ~500 token/detik)

---

## 🔄 Cara Pakai MAL Sync

1. Pastikan profil MAL kamu **tidak di-private** (Settings → Privacy → Anime List = Public)
2. Buka halaman **Profile** atau **My Collection**
3. Klik tombol **"Sync dari MAL"**
4. Masukkan username MAL kamu (bukan email)
5. Klik **Preview** — cek jumlah anime & manga yang akan di-sync
6. Pilih mau sync anime, manga, atau keduanya
7. Klik **Mulai Sync** dan tunggu prosesnya selesai

> ⚠️ User dengan koleksi 1000+ item mungkin butuh 5–10 menit karena rate limit Jikan API.

---

## 🌐 Deployment

### Database — [Neon.tech](https://neon.tech) (Free)
1. Buat project baru di neon.tech
2. Copy connection string
3. Buka SQL Editor → paste isi `schema.sql` → Run

### Backend — [Railway](https://railway.app) (Free Trial / Paid)
1. Daftar di railway.app (bisa pakai GitHub)
2. Klik **"New Project"** → **"Deploy from GitHub repo"**
3. Pilih repo `otakuvault` → pilih folder `backend` sebagai root
4. Railway otomatis deteksi Node.js
5. Buka tab **"Variables"** → tambahkan semua env:
```
DB_HOST         = (dari Neon)
DB_PORT         = 5432
DB_NAME         = neondb
DB_USER         = (dari Neon)
DB_PASSWORD     = (dari Neon)
JWT_SECRET      = your_production_secret
GROQ_API_KEY    = gsk_xxxxxxxxxxxxxxxxxxxx
CLIENT_URL      = https://otakuvault.vercel.app
```
6. Tambah **PostgreSQL plugin**: klik **"New"** → **"Database"** → **"PostgreSQL"**
7. Railway otomatis isi `DATABASE_URL` — atau copy credentials dari tab **"Connect"**
8. Buka **"Query"** tab di PostgreSQL plugin → paste isi `schema.sql` → Run
9. Klik **"Deploy"** → tunggu build selesai
10. Copy URL backend: `otakuvault-production.up.railway.app`

### Frontend — [Vercel](https://vercel.com) (Free)
1. Import repo ke Vercel
2. Root Directory: `frontend`
3. Build Command : `npm run build`
4. Output Directory : `dist`
5. Environment Variables:
```
VITE_API_URL = https://otakuvault-production.up.railway.app
```
4. Deploy!

---

## 📋 Checklist Nilai

| Syarat | Status |
|--------|--------|
| Express JS Backend | ✅ |
| PostgreSQL (7 tabel) | ✅ |
| TailwindCSS | ✅ |
| React + Vite | ✅ **Nilai Tambah** |
| Login/Register + Bcrypt | ✅ |
| JWT + Protected Routes | ✅ |
| CRUD lengkap | ✅ |
| REST API (GET/POST/PATCH/DELETE) | ✅ |
| Minimal 5 Pages (7 pages) | ✅ |
| Minimal 3 Tabel (7 tabel) | ✅ |
| README Dokumentasi | ✅ **Nilai Tambah** |
| Fitur AI (Groq API) | ✅ **Bonus** |
| MAL Sync Integration | ✅ **Bonus** |

---

Made with ❤️ for Otaku by Otaku 🎌  
*"Hobi anime & game bukan halangan — justru jadi pintu masuk ke pengetahuan yang lebih luas."*
