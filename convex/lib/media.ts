import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { IMAGE_CONTENT_TYPES, MAX_IMAGE_BYTES } from "./limits";

const ALLOWED_IMAGE_TYPES = new Set<string>(IMAGE_CONTENT_TYPES);

export function storageUrl(ctx: QueryCtx, id: Id<"_storage"> | null | undefined): Promise<string | null> {
  return id ? ctx.storage.getUrl(id) : Promise.resolve(null);
}

export async function assertImageUpload(ctx: MutationCtx, id: Id<"_storage"> | undefined): Promise<void> {
  if (id === undefined) return;

  const metadata = await ctx.db.system.get("_storage", id);
  if (!metadata) throw new ConvexError("Upload not found. Please try again.");
  if (metadata.size > MAX_IMAGE_BYTES) {
    throw new ConvexError(`Image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`);
  }
  if (!(metadata.contentType && ALLOWED_IMAGE_TYPES.has(metadata.contentType))) {
    throw new ConvexError("Images must be JPEG, PNG, WebP, AVIF, or GIF");
  }
}
