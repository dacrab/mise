import { FolderIcon, FolderPlusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useConfirmAction } from "@/hooks/useConfirmAction";

const activeNav = "bg-sage/10 text-sage font-medium";
const inactiveNav = "text-charcoal-light hover:bg-cream-dark";

export function Collections() {
  const collections = useQuery(api.collections.list) ?? [];
  const createCollection = useMutation(api.collections.create);
  const removeCollection = useMutation(api.collections.remove);

  const [selectedId, setSelectedId] = useState<Id<"collections"> | null>(null);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { trigger: handleDelete } = useConfirmAction<Id<"collections">>(
    async (id) => {
      await removeCollection({ id });
      if (selectedId === id) setSelectedId(null);
    },
    { confirmMessage: "Tap delete again to confirm", successMessage: "Collection deleted", errorMessage: "Could not delete collection" }
  );

  const bookmarks = useQuery(
    api.collections.getBookmarks,
    selectedId ? { collectionId: selectedId } : { collectionId: undefined }
  ) ?? [];

  const { execute: handleCreate, isPending: creating } = useAsyncAction(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const trimmed = newName.trim();
      if (!trimmed) return;
      await createCollection({ name: trimmed });
      setNewName("");
      setShowCreate(false);
    },
    {
      successMessage: "Collection created",
      errorMessage: "Could not create collection",
    }
  );

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-6">
      <aside className="space-y-2">
        <button
          onClick={() => setSelectedId(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedId === null ? activeNav : inactiveNav}`}
        >
          <FolderIcon className="w-4 h-4" />
          All Saved
        </button>

        {collections.map((c) => (
          <div key={c._id} className="group flex items-center">
            <button
              onClick={() => setSelectedId(c._id)}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedId === c._id ? activeNav : inactiveNav}`}
            >
              <FolderIcon className="w-4 h-4" />
              {c.name}
              <span className="ml-auto text-xs text-stone">{c.count}</span>
            </button>
            <button
              onClick={() => handleDelete(c._id)}
              className="p-1.5 text-stone opacity-0 group-hover:opacity-100 hover:text-terracotta transition-all"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

        {showCreate ? (
          <form onSubmit={(event) => void handleCreate(event)} className="flex gap-2">
            <label htmlFor="new-collection-name" className="sr-only">
              Collection name
            </label>
            <input
              id="new-collection-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-cream-dark focus:outline-none focus:border-sage"
              disabled={creating}
            />
            <button type="submit" className="btn-primary text-sm py-2 px-3 disabled:opacity-50" disabled={creating || !newName.trim()}>
              <PlusIcon className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sage hover:bg-sage/10 transition-colors"
          >
            <FolderPlusIcon className="w-4 h-4" />
            New Collection
          </button>
        )}
      </aside>

      <div>
        <h2 className="font-serif text-xl font-medium mb-4">
          {selectedId ? collections.find((c) => c._id === selectedId)?.name : "All Saved Recipes"}
        </h2>

        {bookmarks.length === 0 ? (
          <EmptyState
            icon={<FolderIcon className="w-6 h-6 text-stone" />}
            title="Nothing saved here yet"
            message={selectedId ? "No recipes in this collection" : "Saved recipes will appear here once you bookmark them."}
            actionLabel="Browse recipes"
            actionTo="/"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookmarks.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                slug={recipe.slug}
                title={recipe.title}
                category={recipe.category}
                coverImageUrl={recipe.coverImageUrl}
                variant="list"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
