import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireAuth } from "./auth";

export async function withCoverUrl<T extends { coverImage?: Id<"_storage"> | null }>(
  ctx: QueryCtx,
  item: T,
): Promise<T & { coverImageUrl: string | null }> {
  return {
    ...item,
    coverImageUrl: item.coverImage ? await ctx.storage.getUrl(item.coverImage) : null,
  };
}

export async function withCoverUrls<T extends { coverImage?: Id<"_storage"> | null }>(
  ctx: QueryCtx,
  items: T[],
): Promise<Array<T & { coverImageUrl: string | null }>> {
  return Promise.all(items.map((item) => withCoverUrl(ctx, item)));
}

export async function withProfileImageUrl<T extends { profileImage?: Id<"_storage"> | null }>(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  user: T,
): Promise<T & { profileImageUrl: string | null }> {
  return {
    ...user,
    profileImageUrl: user.profileImage ? await ctx.storage.getUrl(user.profileImage) : null,
  };
}

export async function generateAuthenticatedUploadUrl(ctx: MutationCtx) {
  await requireAuth(ctx);
  return ctx.storage.generateUploadUrl();
}
