// @ts-nocheck
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  Comment,
  DirectMessage,
  DirectMessageConversation,
  Image,
  Movie,
  Post,
  PostsImagesRelation,
  ProfileImage,
  QaSuggestion,
  Sound,
  User,
} from "@web-speed-hackathon-2026/server/src/models";
import type {
  CommentSeed,
  DirectMessageConversationSeed,
  DirectMessageSeed,
  ImageSeed,
  MovieSeed,
  PostSeed,
  PostsImagesRelationSeed,
  ProfileImageSeed,
  QaSuggestionSeed,
  SoundSeed,
  UserSeed,
} from "@web-speed-hackathon-2026/server/src/types/seed";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedsDir = path.resolve(__dirname, "../seeds");

const DEFAULT_BATCH_SIZE = 1000;

async function readJsonlFileBatched<T>(
  filename: string,
  callback: (batch: T[]) => Promise<void>,
  batchSize: number = DEFAULT_BATCH_SIZE,
): Promise<void> {
  const filePath = path.join(seedsDir, filename);

  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split("\n");

  let batch: T[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i]!.trim();
    if (!trimmedLine) continue;

    try {
      batch.push(JSON.parse(trimmedLine));

      if (batch.length >= batchSize) {
        await callback(batch);
        batch = [];
      }
    } catch {
      console.error(`Error parsing JSON in ${filename} at line ${i + 1}`);
      throw new Error(`Invalid JSONL format in ${filename} at line ${i + 1}`);
    }
  }

  if (batch.length > 0) {
    await callback(batch);
  }
}

export async function insertSeeds(sequelize: Sequelize) {
  await sequelize.transaction(async (transaction) => {
    await readJsonlFileBatched<ProfileImageSeed>("profileImages.jsonl", async (batch) => {
      await ProfileImage.bulkCreate(batch, { transaction });
    });
    await readJsonlFileBatched<ImageSeed>("images.jsonl", async (batch) => {
      await Image.bulkCreate(batch, { transaction });
    });
    await readJsonlFileBatched<MovieSeed>("movies.jsonl", async (batch) => {
      await Movie.bulkCreate(batch, { transaction });
    });
    await readJsonlFileBatched<SoundSeed>("sounds.jsonl", async (batch) => {
      await Sound.bulkCreate(batch, { transaction });
    });
    await readJsonlFileBatched<UserSeed>("users.jsonl", async (batch) => {
      await User.bulkCreate(batch, { transaction });
    });
    await readJsonlFileBatched<PostSeed>("posts.jsonl", async (batch) => {
      await Post.bulkCreate(batch, { transaction });
    });
    await readJsonlFileBatched<PostsImagesRelationSeed>(
      "postsImagesRelation.jsonl",
      async (batch) => {
        await PostsImagesRelation.bulkCreate(batch, { transaction });
      },
    );
    await readJsonlFileBatched<CommentSeed>("comments.jsonl", async (batch) => {
      await Comment.bulkCreate(batch, { transaction });
    });
    await readJsonlFileBatched<DirectMessageConversationSeed>(
      "directMessageConversations.jsonl",
      async (batch) => {
        await DirectMessageConversation.bulkCreate(batch, { transaction });
      },
    );
    await readJsonlFileBatched<DirectMessageSeed>("directMessages.jsonl", async (batch) => {
      await DirectMessage.bulkCreate(batch, { transaction });
    });
    await readJsonlFileBatched<QaSuggestionSeed>("qaSuggestions.jsonl", async (batch) => {
      await QaSuggestion.bulkCreate(batch, { transaction });
    });
  });
}
