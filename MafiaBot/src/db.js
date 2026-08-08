import pg from 'pg';
import { config } from './config.js';
const { Pool } = pg;

export const db = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
});

export async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS discord_users (
      discord_user_id TEXT PRIMARY KEY,
      discord_username TEXT NOT NULL,
      youtube_channel_id TEXT,
      youtube_channel_name TEXT,
      linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_verified_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS creators (
      id BIGSERIAL PRIMARY KEY,
      youtube_channel_id TEXT NOT NULL UNIQUE,
      youtube_channel_name TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT NOT NULL,
      token_expiry BIGINT,
      connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      grace_period_days INTEGER NOT NULL DEFAULT 3
    );
    CREATE TABLE IF NOT EXISTS role_mappings (
      id BIGSERIAL PRIMARY KEY,
      creator_channel_id TEXT NOT NULL,
      youtube_level_id TEXT NOT NULL,
      youtube_level_name TEXT NOT NULL,
      discord_role_id TEXT NOT NULL,
      UNIQUE (creator_channel_id, youtube_level_id)
    );
    CREATE TABLE IF NOT EXISTS oauth_states (
      state TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      context TEXT,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS membership_status (
      discord_user_id TEXT NOT NULL,
      creator_channel_id TEXT NOT NULL,
      youtube_level_id TEXT,
      discord_role_id TEXT,
      is_active BOOLEAN NOT NULL DEFAULT FALSE,
      last_active_at TIMESTAMPTZ,
      grace_expires_at TIMESTAMPTZ,
      last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (discord_user_id, creator_channel_id)
    );

    CREATE TABLE IF NOT EXISTS creator_invites (
      token TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      used_channel_id TEXT
    );

    CREATE TABLE IF NOT EXISTS site_streams (
      youtube_video_id TEXT PRIMARY KEY,
      discord_message_id TEXT NOT NULL UNIQUE,
      youtube_url TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      title TEXT NOT NULL,
      thumbnail_url TEXT,
      status TEXT NOT NULL DEFAULT 'live',
      detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS discord_users_youtube_idx ON discord_users (youtube_channel_id);
    CREATE INDEX IF NOT EXISTS site_streams_active_idx ON site_streams (expires_at, detected_at DESC);
  `);

  // Migrate older Safetybot schemas in-place. Older versions required
  // creators.discord_user_id, but MafiaBot connects creators by YouTube channel
  // and does not need a Discord user ID for creator records.
  await db.query(`ALTER TABLE creators ALTER COLUMN discord_user_id DROP NOT NULL`).catch(error => {
    // PostgreSQL error 42703 means the column does not exist, which is expected
    // for fresh MafiaBot databases. Re-throw anything else.
    if (error?.code !== '42703') throw error;
  });

  await db.query(`ALTER TABLE creators ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE`);
  await db.query(`ALTER TABLE creators ADD COLUMN IF NOT EXISTS grace_period_days INTEGER NOT NULL DEFAULT 3`);
  await db.query(`ALTER TABLE discord_users ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ`);
  await db.query(`ALTER TABLE oauth_states ADD COLUMN IF NOT EXISTS context TEXT`);
}
