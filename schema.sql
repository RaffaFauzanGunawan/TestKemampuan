-- Run in Neon SQL Editor. App account + durable progress storage.
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nama_key VARCHAR(120) NOT NULL UNIQUE,
  kelas VARCHAR(50) NOT NULL,
  jurusan VARCHAR(50) NOT NULL,
  password_hash TEXT NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
  theme VARCHAR(10) NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light')),
  completed_games JSONB NOT NULL DEFAULT '[]'::jsonb,
  equipped JSONB NOT NULL DEFAULT '{"body":"body-default","head":"head-default"}'::jsonb,
  owned_outfits JSONB NOT NULL DEFAULT '["body-default","head-default"]'::jsonb,
  asked_history JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);
