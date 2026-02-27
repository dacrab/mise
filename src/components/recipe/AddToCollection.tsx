import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import { FolderPlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";

export function AddToCollectionButton({ recipeId }: { recipeId: Id<"recipes"> }) {
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
