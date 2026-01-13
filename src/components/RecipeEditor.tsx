import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { useAuthToken } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { config } from "../config";
import { withConvex } from "../convex";
import type { Id } from "../../convex/_generated/dataModel";

interface RecipeInput {
  id?: Id<"recipes">;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  coverImage?: Id<"_storage"> | null;
  ingredients: string[];
  steps: string[];
  category?: string | null;
  videoUrl?: string | null;
  status?: "draft" | "published";
  slug?: string;
}

function RecipeEditorInner({
  initialData,
  isEditing = false,
}: {
  initialData?: RecipeInput;
  isEditing?: boolean;
}) {
  const token = useAuthToken();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    coverImage: initialData?.coverImage || null as Id<"_storage"> | null,
    coverImageUrl: initialData?.coverImageUrl || "",
    category: initialData?.category || "General",
    videoUrl: initialData?.videoUrl || "",
    status: initialData?.status || ("published" as const),
  });
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || [""]);
  const [steps, setSteps] = useState<string[]>(initialData?.steps || [""]);

  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);
  const createRecipe = useMutation(api.recipes.create);
  const updateRecipe = useMutation(api.recipes.update);

  // Redirect immediately if no token
  useEffect(() => {
    if (token === null) {
      window.location.href = "/login";
    }
  }, [token]);

  if (token === null) {
    return null;
  }

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateList = (
    list: string[],
    setList: (v: string[]) => void,
    i: number,
    value: string
  ) => {
    const updated = [...list];
    updated[i] = value;
    setList(updated);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      update("coverImage", storageId);
      update("coverImageUrl", URL.createObjectURL(file));
    } catch {
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        category: form.category || "General",
        videoUrl: form.videoUrl || undefined,
        coverImage: form.coverImage || undefined,
        status,
        ingredients: ingredients.filter((i) => i.trim()),
        steps: steps.filter((s) => s.trim()),
      };

      let slug: string;
      if (isEditing && initialData?.id) {
        const result = await updateRecipe({ id: initialData.id, ...payload });
        slug = result.slug;
      } else {
        const result = await createRecipe(payload);
        slug = result.slug;
      }
      window.location.href = `/recipe/${slug}`;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper max-w-4xl py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-cream-dark">
        <p className="font-hand text-xl text-sage mb-1">
          {isEditing ? "editing" : "new recipe"}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-6">
          {isEditing ? "Refine your recipe" : "Share something delicious"}
        </h1>
        <div className="flex flex-wrap gap-3">
          <a href="/dashboard" className="btn-ghost text-sm">Cancel</a>
          <button
            onClick={() => handleSubmit("draft")}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            Save as draft
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={loading}
            className="btn-primary text-sm"
          >
            {loading ? "Saving..." : isEditing ? "Update recipe" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Main Form */}
        <div className="space-y-8">
          {/* Basic Info */}
          <section className="card p-6 space-y-5">
            <h2 className="font-serif text-lg font-medium">Basic info</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-charcoal-light mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                className="input-field text-lg font-medium"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="What's cooking?"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-charcoal-light mb-2">
                  Category
                </label>
                <select
                  id="category"
                  className="input-field"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {config.categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="video" className="block text-sm font-medium text-charcoal-light mb-2">
                  Video URL <span className="text-stone">(optional)</span>
                </label>
                <input
                  id="video"
                  type="url"
                  className="input-field"
                  value={form.videoUrl}
                  onChange={(e) => update("videoUrl", e.target.value)}
                  placeholder="YouTube or TikTok"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-charcoal-light mb-2">
                Description
              </label>
              <textarea
                id="description"
                className="textarea-field h-24"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Tell the story behind this dish..."
              />
            </div>
          </section>

          {/* Ingredients */}
          <section className="card p-6 space-y-4">
            <h2 className="font-serif text-lg font-medium">Ingredients</h2>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    className="input-field"
                    value={ing}
                    placeholder="e.g. 2 cups flour"
                    onChange={(e) => updateList(ingredients, setIngredients, i, e.target.value)}
                  />
                  <button
                    onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                    className="btn-ghost px-3 text-stone hover:text-terracotta"
                    aria-label="Remove ingredient"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIngredients([...ingredients, ""])}
              className="text-sm font-medium text-sage hover:text-sage-light transition-colors"
            >
              + Add ingredient
            </button>
          </section>

          {/* Steps */}
          <section className="card p-6 space-y-4">
            <h2 className="font-serif text-lg font-medium">Instructions</h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-charcoal text-cream text-sm font-medium shrink-0 mt-2">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <textarea
                      className="textarea-field h-20"
                      value={step}
                      placeholder="Describe this step..."
                      onChange={(e) => updateList(steps, setSteps, i, e.target.value)}
                    />
                    <button
                      onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                      className="text-xs text-stone hover:text-terracotta mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSteps([...steps, ""])}
              className="text-sm font-medium text-sage hover:text-sage-light transition-colors"
            >
              + Add step
            </button>
          </section>
        </div>

        {/* Sidebar */}
        <aside>
          <div className="card p-5 sticky top-24 space-y-4">
            <h3 className="text-sm font-medium text-charcoal-light">Cover image</h3>
            <div
              className={`relative aspect-video rounded-lg overflow-hidden border-2 border-dashed transition-colors ${
                form.coverImageUrl
                  ? "border-transparent"
                  : "border-stone-light hover:border-sage bg-cream-dark"
              }`}
            >
              {form.coverImageUrl ? (
                <>
                  <img
                    src={form.coverImageUrl}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-charcoal/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="btn-primary text-xs cursor-pointer">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-stone hover:text-sage transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <span className="text-xs font-medium">Upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {uploading && (
              <p className="text-xs text-sage text-center animate-pulse">Uploading...</p>
            )}
            <p className="text-xs text-stone">
              JPG or PNG, max 10MB
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default withConvex(RecipeEditorInner);
