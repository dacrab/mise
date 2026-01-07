import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { recipes, comments, likes, bookmarks } from '../db';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';

// Helper to ensure user is authenticated
const requireAuth = (context: any) => {
  if (!context.locals.user) throw new Error("Unauthorized");
  return { user: context.locals.user, db: context.locals.db };
};

// Recipe input schema (shared between create/update)
const recipeInput = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string().optional(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  coverImage: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const server = {
  getPresignedUrl: defineAction({
    accept: 'json',
    input: z.object({
      fileType: z.string(),
      fileSize: z.number().max(10 * 1024 * 1024),
    }),
    handler: async ({ fileType, fileSize }, context) => {
      const { user } = requireAuth(context);
      const env = context.locals.runtime.env;

      const s3 = new S3Client({
        region: "auto",
        endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID, secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY },
      });

      const key = `recipes/${user.id}/${nanoid()}-${Date.now()}`;
      const url = await getSignedUrl(s3, new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        ContentLength: fileSize,
      }), { expiresIn: 3600 });

      return { uploadUrl: url, fileKey: key, publicUrl: `https://${env.PUBLIC_R2_DOMAIN}/${key}` };
    },
  }),

  createRecipe: defineAction({
    accept: 'json',
    input: recipeInput,
    handler: async (input, context) => {
      const { user, db } = requireAuth(context);
      const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + nanoid(6);

      const [recipe] = await db.insert(recipes).values({
        id: nanoid(),
        slug,
        ...input,
        category: input.category || 'General',
        status: input.status || 'published',
        userId: user.id,
      }).returning();

      return recipe;
    },
  }),

  updateRecipe: defineAction({
    accept: 'json',
    input: recipeInput.extend({ id: z.string() }),
    handler: async ({ id, ...input }, context) => {
      const { user, db } = requireAuth(context);

      const [recipe] = await db.update(recipes)
        .set({ ...input, updatedAt: new Date() })
        .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
        .returning();

      if (!recipe) throw new Error("Recipe not found or unauthorized");
      return recipe;
    },
  }),

  deleteRecipe: defineAction({
    accept: 'json',
    input: z.object({ id: z.string() }),
    handler: async ({ id }, context) => {
      const { user, db } = requireAuth(context);
      const [deleted] = await db.delete(recipes)
        .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
        .returning();

      if (!deleted) throw new Error("Recipe not found or unauthorized");
      return { success: true };
    }
  }),

  toggleLike: defineAction({
    accept: 'json',
    input: z.object({ recipeId: z.string() }),
    handler: async ({ recipeId }, context) => {
      const { user, db } = requireAuth(context);
      const existing = await db.select().from(likes)
        .where(and(eq(likes.recipeId, recipeId), eq(likes.userId, user.id)));

      if (existing.length > 0) {
        await db.delete(likes).where(and(eq(likes.recipeId, recipeId), eq(likes.userId, user.id)));
        return { liked: false };
      }
      await db.insert(likes).values({ id: nanoid(), recipeId, userId: user.id });
      return { liked: true };
    }
  }),

  toggleBookmark: defineAction({
    accept: 'json',
    input: z.object({ recipeId: z.string() }),
    handler: async ({ recipeId }, context) => {
      const { user, db } = requireAuth(context);
      const existing = await db.select().from(bookmarks)
        .where(and(eq(bookmarks.recipeId, recipeId), eq(bookmarks.userId, user.id)));

      if (existing.length > 0) {
        await db.delete(bookmarks).where(and(eq(bookmarks.recipeId, recipeId), eq(bookmarks.userId, user.id)));
        return { bookmarked: false };
      }
      await db.insert(bookmarks).values({ id: nanoid(), recipeId, userId: user.id });
      return { bookmarked: true };
    }
  }),

  addComment: defineAction({
    accept: 'json',
    input: z.object({ recipeId: z.string(), content: z.string().min(1).max(500) }),
    handler: async ({ recipeId, content }, context) => {
      const { user, db } = requireAuth(context);
      const [comment] = await db.insert(comments).values({
        id: nanoid(),
        recipeId,
        userId: user.id,
        content
      }).returning();
      return comment;
    }
  })
};
