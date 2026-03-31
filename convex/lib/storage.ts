import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function withProfileImageUrl<T extends { profileImage?: string | null }>(
  ctx: { storage: { getUrl: (id: string) => Promise<string | null> } },
  user: T
): Promise<T & { profileImageUrl: string | null }> {
  return {
    ...user,
    profileImageUrl: user.profileImage ? await ctx.storage.getUrl(user.profileImage) : null,
  };
}

export async function withCoverUrl<T extends { coverImage?: Id<"_storage"> | null }>(
  ctx: QueryCtx,
  item: T
): Promise<T & { coverImageUrl: string | null }> {
  return {
    ...item,
    coverImageUrl: item.coverImage ? await ctx.storage.getUrl(item.coverImage) : null,
  };
}

export async function withCoverUrls<T extends { coverImage?: Id<"_storage"> | null }>(
  ctx: QueryCtx,
  items: T[]
): Promise<Array<T & { coverImageUrl: string | null }>> {
  return Promise.all(items.map((item) => withCoverUrl(ctx, item)));
}
