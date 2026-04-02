import { CheckIcon, FolderPlusIcon, ShareIcon } from "@heroicons/react/24/outline";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useState } from "react";
import { RecipeMenuItem } from "@/components/recipe/RecipeMenuItem";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { useToast } from "@/components/ui/Toast";
import { useBookmarkToggle } from "@/hooks/useBookmarkToggle";
import { useDismissableLayer } from "@/hooks/useDismissableLayer";

interface AddToCollectionButtonProps {
  recipeId: Id<"recipes">;
}

export function AddToCollectionButton({ recipeId }: AddToCollectionButtonProps) {
  const { toast } = useToast();
  const collections = useQuery(api.collections.list);
  const { currentUser, isBookmarked, toggleBookmark } = useBookmarkToggle(recipeId, {
    errorMessage: "Could not save recipe",
  });
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const containerRef = useDismissableLayer<HTMLDivElement>(open, () => setOpen(false), { closeOnEscape: false });

  if (!currentUser) return null;

  const handleToggle = async (collectionId?: Id<"collections">) => {
    setPending(collectionId ?? "none");
    try {
      const result = await toggleBookmark(collectionId);
      if (!result) return;
      toast(collectionId ? "Collection updated!" : "Saved to bookmarks!", "success");
      setOpen(false);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-stone hover:text-sage transition-colors"
        aria-label="Save to collection"
      >
        <FolderPlusIcon className="w-4 h-4" />
        {isBookmarked ? "Saved" : "Save"}
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-56 bg-warm-white rounded-xl shadow-hover border border-cream-dark py-1 z-20 animate-scale-in origin-bottom-right">
          <p className="px-3 py-2 text-xs font-medium text-stone uppercase tracking-wide">Save to…</p>
          <RecipeMenuItem
            onClick={() => void handleToggle(undefined)}
            disabled={!!pending}
            leading={isBookmarked ? <CheckIcon className="w-4 h-4 text-sage shrink-0" /> : undefined}
          >
            Bookmarks
          </RecipeMenuItem>
          {collections?.map((col) => (
            <RecipeMenuItem
              key={col._id}
              onClick={() => void handleToggle(col._id)}
              disabled={!!pending}
              trailing={<span className="ml-auto text-xs text-stone">{col.count}</span>}
            >
              {col.name}
            </RecipeMenuItem>
          ))}
          {collections?.length === 0 && (
            <p className="px-3 py-2 text-xs text-stone">No collections yet. Create one in your dashboard.</p>
          )}
        </div>
      )}
    </div>
  );
}

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const { toast } = useToast();
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Link copied!", "success");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") toast("Could not share", "error");
    }
  };
  return (
    <button
      onClick={() => void handleShare()}
      className="flex items-center gap-1.5 text-sm text-stone hover:text-sage transition-colors"
      aria-label="Share"
    >
      <ShareIcon className="w-4 h-4" />
      Share
    </button>
  );
}

interface MetaStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function MetaStat({ icon, label, value }: MetaStatProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 bg-cream-dark rounded-xl text-center">
      <div className="text-stone">{icon}</div>
      <span className="text-xs text-stone uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-charcoal">{value}</span>
    </div>
  );
}

interface RelatedRecipesProps {
  recipeId: Id<"recipes">;
}

export function RelatedRecipes({ recipeId }: RelatedRecipesProps) {
  const related = useQuery(api.discovery.recommendations, { limit: 4 });
  const filtered = related?.filter((r) => r._id !== recipeId).slice(0, 3);
  if (!filtered?.length) return null;
  return (
    <section className="wrapper max-w-4xl pb-16">
      <h2 className="font-serif text-2xl font-medium mb-6">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {filtered.map((r) => (
          <RecipeCard
            key={r._id}
            recipeId={r._id}
            slug={r.slug}
            title={r.title}
            category={r.category}
            coverImageUrl={r.coverImageUrl}
          />
        ))}
      </div>
    </section>
  );
}
