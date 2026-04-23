CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media (anime/manhwa/manga/game) table
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('anime', 'manhwa', 'manga', 'game', 'comic')),
  genre VARCHAR(100),
  description TEXT,
  cover_url TEXT,
  total_episodes INTEGER DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
  release_year INTEGER,
  studio VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections (user's personal tracking list)
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  watch_status VARCHAR(20) NOT NULL DEFAULT 'plan_to_watch' 
    CHECK (watch_status IN ('watching', 'completed', 'dropped', 'plan_to_watch', 'on_hold', 'playing', 'played')),
  progress INTEGER DEFAULT 0,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  review TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, media_id)
);

-- Indexes for performance
-- Game journal entries (strategi, catatan misi)
CREATE TABLE IF NOT EXISTS game_journal (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  entry_type VARCHAR(20) NOT NULL DEFAULT 'strategy'
    CHECK (entry_type IN ('strategy', 'mission', 'tip', 'story')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  tags VARCHAR(255),
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game collection (skin, hero, item, build)
CREATE TABLE IF NOT EXISTS game_collection (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL DEFAULT 'skin'
    CHECK (item_type IN ('skin', 'hero', 'weapon', 'build', 'item', 'achievement')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rarity VARCHAR(20) DEFAULT 'common'
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'mythic')),
  image_url TEXT,
  is_owned BOOLEAN DEFAULT TRUE,
  power_rating INTEGER CHECK (power_rating >= 0 AND power_rating <= 100),
  availability VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_journal_user_media ON game_journal(user_id, media_id);
CREATE INDEX IF NOT EXISTS idx_game_collection_user_media ON game_collection(user_id, media_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_media_id ON collections(media_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);

-- Sample media data
INSERT INTO media (title, type, genre, description, cover_url, total_episodes, status, release_year, studio) VALUES
('Attack on Titan', 'anime', 'Action, Dark Fantasy', 'Humanity fights for survival against giant Titans behind massive walls.', 'https://picsum.photos/seed/aot/300/400', 87, 'completed', 2013, 'MAPPA'),
('Solo Leveling', 'manhwa', 'Action, Fantasy', 'The weakest hunter awakens a hidden power and levels up alone.', 'https://picsum.photos/seed/sl/300/400', 179, 'completed', 2018, 'D&C Media'),
('One Piece', 'anime', 'Adventure, Fantasy', 'A boy with rubber powers seeks the legendary One Piece treasure.', 'https://picsum.photos/seed/op/300/400', 1100, 'ongoing', 1999, 'Toei Animation'),
('Elden Ring', 'game', 'Action RPG, Dark Fantasy', 'An open-world action RPG set in the Lands Between.', 'https://picsum.photos/seed/er/300/400', NULL, 'completed', 2022, 'FromSoftware'),
('Jujutsu Kaisen', 'anime', 'Action, Supernatural', 'A high school student becomes a jujutsu sorcerer to fight cursed spirits.', 'https://picsum.photos/seed/jjk/300/400', 48, 'ongoing', 2020, 'MAPPA'),
('Tower of God', 'manhwa', 'Action, Fantasy', 'A boy climbs a mysterious tower to find his missing friend.', 'https://picsum.photos/seed/tog/300/400', 600, 'ongoing', 2010, 'SIU'),
('Demon Slayer', 'anime', 'Action, Historical', 'A boy becomes a demon slayer to avenge his family and cure his sister.', 'https://picsum.photos/seed/ds/300/400', 55, 'ongoing', 2019, 'ufotable'),
('Cyberpunk 2077', 'game', 'RPG, Sci-Fi', 'An open-world RPG set in the dystopian Night City.', 'https://picsum.photos/seed/cp/300/400', NULL, 'completed', 2020, 'CD Projekt Red'),
('Vinland Saga', 'anime', 'Historical, Action', 'A young Viking seeks revenge for his father''s death.', 'https://picsum.photos/seed/vs/300/400', 48, 'completed', 2019, 'MAPPA'),
('Omniscient Reader', 'manhwa', 'Action, Fantasy', 'A man who read a novel finds himself living inside it.', 'https://picsum.photos/seed/or/300/400', 180, 'ongoing', 2020, 'Redice Studio'),
('Bleach', 'anime', 'Action, Supernatural', 'A teenager gains the powers of a Soul Reaper to protect the living world.', 'https://picsum.photos/seed/bl/300/400', 366, 'completed', 2004, 'Pierrot'),
('The Legend of Zelda: Breath of the Wild', 'game', 'Action Adventure', 'Link awakens to reclaim Hyrule from Calamity Ganon.', 'https://picsum.photos/seed/botw/300/400', NULL, 'completed', 2017, 'Nintendo'),
('Chainsaw Man', 'anime', 'Action, Dark Fantasy', 'A boy merges with his devil dog to hunt other devils for the government.', 'https://picsum.photos/seed/csm/300/400', 12, 'ongoing', 2022, 'MAPPA'),
('Lookism', 'manhwa', 'Slice of Life, Action', 'An unattractive boy switches bodies with a handsome one while sleeping.', 'https://picsum.photos/seed/lk/300/400', 450, 'ongoing', 2014, 'Taejun Pak'),
('Hollow Knight', 'game', 'Metroidvania, Action', 'Explore a vast underground kingdom of insects and heroes.', 'https://picsum.photos/seed/hk/300/400', NULL, 'completed', 2017, 'Team Cherry')
ON CONFLICT DO NOTHING;

-- Chapter Notes table (tanggapan per chapter)
CREATE TABLE IF NOT EXISTS chapter_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  chapter_title VARCHAR(255),
  note TEXT NOT NULL,
  mood VARCHAR(30) DEFAULT 'neutral' CHECK (mood IN ('mindblown', 'hype', 'sad', 'angry', 'cry', 'laugh', 'love', 'confused', 'bored', 'neutral')),
  cover_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chapter_notes_user_media ON chapter_notes(user_id, media_id);
