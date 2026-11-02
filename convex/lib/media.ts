import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export function storageUrl(ctx: QueryCtx, id: Id<"_storage"> | null | undefined): Promise<string | null> {
  return id ? ctx.storage.getUrl(id) : Promise.resolve(null);
}
