import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { recipes, comments, likes, bookmarks } from '../db/schema';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';

export const server = {
  getPresignedUrl: defineAction({
    accept: 'json',
    input: z.object({
      fileType: z.string(),
      fileSize: z.number().max(10 * 1024 * 1024), // Max 10MB
    }),
    handler: async ({ fileType, fileSize }, context) => {
      if (!context.locals.user) throw new Error("Unauthorized");
      
      const env = context.locals.runtime.env;
      
      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
          secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
        },
      });

      const fileId = nanoid();
      const key = `recipes/${context.locals.user.id}/${fileId}-${Date.now()}`;
      
      const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        ContentLength: fileSize,
      });

      const url = await getSignedUrl(S3, command, { expiresIn: 3600 });

      return {
        uploadUrl: url,
        fileKey: key,
        publicUrl: `https://${env.PUBLIC_R2_DOMAIN}/${key}`
      };
    },
  }),

  createRecipe: defineAction({
    accept: 'json',
    input: z.object({
      title: z.string().min(3),
      description: z.string().optional(),
      category: z.string().optional(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
      coverImage: z.string().url().optional(),
      videoUrl: z.string().url().optional(),
      status: z.enum(['draft', 'published']).optional(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) throw new Error("Unauthorized");
      const db = context.locals.db;

      const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + nanoid(6);

      const [newRecipe] = await db.insert(recipes).values({
        id: nanoid(),
        slug,
        title: input.title,
        description: input.description,
        category: input.category || 'General',
        ingredients: input.ingredients,
        steps: input.steps,
        coverImage: input.coverImage,
        videoUrl: input.videoUrl,
        status: input.status || 'published',
        userId: context.locals.user.id,
      }).returning();

      return newRecipe;
    },
  }),

  updateRecipe: defineAction({
    accept: 'json',
    input: z.object({
      id: z.string(),
      title: z.string().min(3),
      description: z.string().optional(),
      category: z.string().optional(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
      coverImage: z.string().url().optional(),
      videoUrl: z.string().url().optional(),
      status: z.enum(['draft', 'published']).optional(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) throw new Error("Unauthorized");
      const db = context.locals.db;

      const [updatedRecipe] = await db.update(recipes)
        .set({
          title: input.title,
          description: input.description,
          category: input.category,
          ingredients: input.ingredients,
          steps: input.steps,
          coverImage: input.coverImage,
          videoUrl: input.videoUrl,
          status: input.status,
          updatedAt: new Date(),
        })
        .where(and(eq(recipes.id, input.id), eq(recipes.userId, context.locals.user.id)))
        .returning();

      if (!updatedRecipe) throw new Error("Recipe not found or you are not the owner");
      return updatedRecipe;
    },
  }),

  deleteRecipe: defineAction({
    accept: 'json',
    input: z.object({ id: z.string() }),
    handler: async ({ id }, context) => {
        if (!context.locals.user) throw new Error("Unauthorized");
        const db = context.locals.db;
        const [deleted] = await db.delete(recipes).where(and(eq(recipes.id, id), eq(recipes.userId, context.locals.user.id))).returning();
        if (!deleted) throw new Error("Recipe not found or you are not the owner");
        return { success: true };
    }
  }),

  toggleLike: defineAction({
    accept: 'json',
    input: z.object({ recipeId: z.string() }),
    handler: async ({ recipeId }, context) => {
      if (!context.locals.user) throw new Error("Unauthorized");
      const userId = context.locals.user.id;
      const db = context.locals.db;

      const existing = await db.select().from(likes).where(and(eq(likes.recipeId, recipeId), eq(likes.userId, userId)));
      if (existing.length > 0) {
        await db.delete(likes).where(and(eq(likes.recipeId, recipeId), eq(likes.userId, userId)));
        return { liked: false };
      } else {
        await db.insert(likes).values({ id: nanoid(), recipeId, userId });
        return { liked: true };
      }
    }
  }),

  toggleBookmark: defineAction({
    accept: 'json',
    input: z.object({ recipeId: z.string() }),
    handler: async ({ recipeId }, context) => {
      if (!context.locals.user) throw new Error("Unauthorized");
      const userId = context.locals.user.id;
      const db = context.locals.db;

      const existing = await db.select().from(bookmarks).where(and(eq(bookmarks.recipeId, recipeId), eq(bookmarks.userId, userId)));
      if (existing.length > 0) {
        await db.delete(bookmarks).where(and(eq(bookmarks.recipeId, recipeId), eq(bookmarks.userId, userId)));
        return { bookmarked: false };
      } else {
        await db.insert(bookmarks).values({ id: nanoid(), recipeId, userId });
        return { bookmarked: true };
      }
    }
  }),

  addComment: defineAction({
    accept: 'json',
    input: z.object({ recipeId: z.string(), content: z.string().min(1).max(500) }),
    handler: async ({ recipeId, content }, context) => {
      if (!context.locals.user) throw new Error("Unauthorized");
      const db = context.locals.db;
      const [comment] = await db.insert(comments).values({
        id: nanoid(),
        recipeId,
        userId: context.locals.user.id,
        content
      }).returning();
      return comment;
    }
  })
};