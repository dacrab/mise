
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useToast } from "@/components/ui/toast";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { FolderIcon, FolderPlusIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

export function Collections() {
  const { toast } = useToast();
  const collections = useQuery(api.collections.list) ?? [];
  const createCollection = useMutation(api.collections.create);
  const removeCollection = useMutation(api.collections.remove);
  
  const [selectedId, setSelectedId] = useState<Id<"collections"> | null>(null);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const bookmarks = useQuery(
    api.collections.getBookmarks,
    selectedId ? { collectionId: selectedId } : { collectionId: undefined }
  ) ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createCollection({ name: newName.trim() });
      setNewName("");
      setShowCreate(false);
      toast("Collection created", "success");
    } catch {
      toast("Could not create collection", "error");
    }
  };

  const handleDelete = async (id: Id<"collections">) => {
    if (!confirm("Delete this collection? Bookmarks will be moved to Unsorted.")) return;
    try {
      await removeCollection({ id });
      if (selectedId === id) setSelectedId(null);
      toast("Collection deleted", "success");
    } catch {
      toast("Could not delete collection", "error");
    }
  };

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-6">
      {/* Sidebar */}
      <aside className="space-y-2">
        <button
          onClick={() => setSelectedId(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
            selectedId === null ? "bg-sage/10 text-sage font-medium" : "text-charcoal-light hover:bg-cream-dark"
          }`}
        >
          <FolderIcon className="w-4 h-4" />
          All Saved
        </button>

        {collections.map((c) => (
          <div key={c._id} className="group flex items-center">
            <button
              onClick={() => setSelectedId(c._id)}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                selectedId === c._id ? "bg-sage/10 text-sage font-medium" : "text-charcoal-light hover:bg-cream-dark"
              }`}
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
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-cream-dark focus:outline-none focus:border-sage"
              autoFocus
            />
            <button type="submit" className="btn-primary text-sm py-2 px-3">
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

      {/* Content */}
      <div>
        <h2 className="font-serif text-xl font-medium mb-4">
          {selectedId ? collections.find((c) => c._id === selectedId)?.name : "All Saved Recipes"}
        </h2>
        
        {bookmarks.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderIcon className="w-12 h-12 text-stone-light mx-auto mb-4" />
            <p className="text-stone mb-4">No recipes in this collection</p>
            <Link to="/" className="btn-primary text-sm">Browse recipes</Link>
          </div>
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
