import { PhotoIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import type { Id } from "convex/_generated/dataModel";

export function RecipeListRow({
  recipe,
  showActions = false,
  pendingDeleteId,
  onDelete,
}: {
  recipe: {
    _id: Id<"recipes">;
    slug: string;
    title: string;
    coverImageUrl?: string | null;
    status?: "draft" | "published";
  };
  showActions?: boolean;
  pendingDeleteId?: Id<"recipes"> | null;
  onDelete?: (id: Id<"recipes">) => void;
}) {
  return (
    <div className="card-hover flex items-center gap-4 p-4 group">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden surface-raised shrink-0">
        {recipe.coverImageUrl ? (
          <img src={recipe.coverImageUrl} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="w-6 h-6 text-stone-light" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-serif text-lg font-medium truncate group-hover:text-sage">{recipe.title}</h3>
          {recipe.status === "draft" && <span className="tag text-[10px] bg-honey/20 text-honey">Draft</span>}
        </div>
        <Link to="/recipe/$slug" params={{ slug: recipe.slug }} className="text-xs text-stone hover:text-sage">
          View →
        </Link>
      </div>
      {showActions && onDelete && (
        <div className="flex gap-2">
          <Link to="/dashboard/edit/$id" params={{ id: recipe._id }} className="btn-ghost text-xs py-1.5 px-3">
            Edit
          </Link>
          <button
            onClick={() => onDelete(recipe._id)}
            className={`btn-ghost text-xs py-1.5 px-3 text-terracotta ${pendingDeleteId === recipe._id ? "font-semibold" : ""}`}
          >
            {pendingDeleteId === recipe._id ? "Confirm?" : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
