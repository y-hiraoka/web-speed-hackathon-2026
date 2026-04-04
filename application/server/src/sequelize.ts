import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { Sequelize } from "sequelize";

import { initModels } from "@web-speed-hackathon-2026/server/src/models";
import { DATABASE_PATH } from "@web-speed-hackathon-2026/server/src/paths";

let _sequelize: Sequelize | null = null;

const TEMP_DIR = path.resolve(os.tmpdir(), "wsh-db");
const TEMP_PATH = path.resolve(TEMP_DIR, "database.sqlite");

export async function initializeSequelize() {
  const prevSequelize = _sequelize;
  _sequelize = null;
  await prevSequelize?.close();

  await fs.mkdir(TEMP_DIR, { recursive: true });
  // Remove stale WAL/SHM files before copying to avoid corruption
  await fs.unlink(`${TEMP_PATH}-wal`).catch(() => {});
  await fs.unlink(`${TEMP_PATH}-shm`).catch(() => {});
  await fs.copyFile(DATABASE_PATH, TEMP_PATH);

  const enableLogging = process.env["DEBUG_SQL"] === "true";
  _sequelize = new Sequelize({
    dialect: "sqlite",
    logging: enableLogging ? console.log : false,
    storage: TEMP_PATH,
  });

  await _sequelize.authenticate();

  // Enable SQLite optimizations after connection is established
  await _sequelize.query("PRAGMA journal_mode=WAL;");
  await _sequelize.query("PRAGMA synchronous=NORMAL;");
  await _sequelize.query("PRAGMA cache_size=-64000;");
  await _sequelize.query("PRAGMA temp_store=MEMORY;");

  initModels(_sequelize);

  // Create indexes at runtime instead of storing them in database.sqlite
  // to keep the seed DB file small enough for Git
  await _sequelize.query("CREATE INDEX IF NOT EXISTS idx_posts_user_id ON Posts (userId);");
  await _sequelize.query("CREATE INDEX IF NOT EXISTS idx_posts_created_at ON Posts (createdAt);");
  await _sequelize.query("CREATE INDEX IF NOT EXISTS idx_comments_post_id ON Comments (postId);");
  await _sequelize.query(
    "CREATE INDEX IF NOT EXISTS idx_comments_created_at ON Comments (createdAt);",
  );
  await _sequelize.query(
    "CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_id ON DirectMessages (conversationId);",
  );
  await _sequelize.query(
    "CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_is_read ON DirectMessages (senderId, isRead);",
  );
  await _sequelize.query(
    "CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON DirectMessages (createdAt);",
  );
  await _sequelize.query(
    "CREATE INDEX IF NOT EXISTS idx_dm_conversations_initiator_id ON DirectMessageConversations (initiatorId);",
  );
  await _sequelize.query(
    "CREATE INDEX IF NOT EXISTS idx_dm_conversations_member_id ON DirectMessageConversations (memberId);",
  );
  await _sequelize.query(
    "CREATE INDEX IF NOT EXISTS idx_posts_images_post_id ON PostsImagesRelations (postId);",
  );
  await _sequelize.query(
    "CREATE INDEX IF NOT EXISTS idx_posts_images_image_id ON PostsImagesRelations (imageId);",
  );

  // FTS5 virtual tables for full-text search (avoids leading-wildcard LIKE full scans)
  // Use trigram tokenizer for substring matching (works with CJK text)
  await _sequelize.query("DROP TABLE IF EXISTS posts_fts;");
  await _sequelize.query(
    "CREATE VIRTUAL TABLE posts_fts USING fts5(id UNINDEXED, text, tokenize='trigram');",
  );
  await _sequelize.query("INSERT INTO posts_fts(id, text) SELECT id, text FROM Posts;");

  await _sequelize.query("DROP TABLE IF EXISTS users_fts;");
  await _sequelize.query(
    "CREATE VIRTUAL TABLE users_fts USING fts5(id UNINDEXED, username, name, tokenize='trigram');",
  );
  await _sequelize.query(
    "INSERT INTO users_fts(id, username, name) SELECT id, username, name FROM Users;",
  );
}
