import { CheckIcon, FolderPlusIcon, ShareIcon } from "@heroicons/react/24/outline";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { useToast } from "@/components/ui/toast";

// ─── Add to Collection ────────────────────────────────────────────────────────

interface AddToCollectionButtonProps {
  recipeId: Id<"recipes">;
}

export function AddToCollectionButton({ recipeId }: AddToCollectionButtonProps) {
  const { toast } = useToast();
  const collections = useQuery(api.collections.list);
  const toggleBookmark = useMutation(api.social.toggleBookmark);
  const bookmarks = useQuery(api.recipes.myBookmarks);
  const currentUser = useQuery(api.users.currentUser);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!currentUser) return null;

  const isBookmarked = bookmarks?.some((r) => r._id === recipeId) ?? false;

  const handleToggle = async (collectionId?: Id<"collections">) => {
    setPending(collectionId ?? "none");
    try {
      await toggleBookmark({ recipeId, collectionId });
      toast(collectionId ? "Collection updated!" : "Saved to bookmarks!", "success");
      setOpen(false);
    } catch {
      toast("Could not save recipe", "error");
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
          <button
            onClick={() => void handleToggle(undefined)}
            disabled={!!pending}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-cream-dark transition-colors text-left"
          >
            {isBookmarked ? <CheckIcon className="w-4 h-4 text-sage shrink-0" /> : <div className="w-4" />}
            Bookmarks
          </button>
          {collections?.map((col) => (
            <button
              key={col._id}
              onClick={() => void handleToggle(col._id)}
              disabled={!!pending}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-cream-dark transition-colors text-left"
            >
              <div className="w-4" />
              {col.name}
              <span className="ml-auto text-xs text-stone">{col.count}</span>
            </button>
          ))}
          {collections?.length === 0 && (
            <p className="px-3 py-2 text-xs text-stone">No collections yet. Create one in your dashboard.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Share Button ─────────────────────────────────────────────────────────────

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

// ─── Meta Stat ────────────────────────────────────────────────────────────────

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

// ─── Related Recipes ──────────────────────────────────────────────────────────

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
