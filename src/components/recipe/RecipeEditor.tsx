import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useToast } from "@/components/ui/toast";
import { Select } from "@/components/ui/Select";
import { RecipeImporter } from "@/components/recipe/RecipeImporter";

const CATEGORIES = ["General", "Breakfast", "Lunch", "Dinner", "Dessert", "Vegan", "Quick & Easy", "Baking", "Italian", "Asian", "Mexican"];

interface InitialData {
  id?: Id<"recipes">;
  title: string;
  description?: string | null;
  coverImage?: Id<"_storage"> | null;
  coverImageUrl?: string | null;
  ingredients: string[];
  steps: string[];
  category?: string | null;
  videoUrl?: string | null;
  status?: "draft" | "published";
}

interface Props {
  initialData?: InitialData;
  isEditing?: boolean;
}

// Replace item at index in an array, returning a new array
function setAt<T>(arr: T[], i: number, val: T): T[] {
  return arr.map((x, j) => (j === i ? val : x));
}

export function RecipeEditor({ initialData, isEditing }: Props) {
  const { toast } = useToast();
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "General");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl ?? "");
  const [coverImage, setCoverImage] = useState<Id<"_storage"> | null>(initialData?.coverImage ?? null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients ?? [""]);
  const [steps, setSteps] = useState<string[]>(initialData?.steps ?? [""]);

  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);
  const createRecipe = useMutation(api.recipes.create);
  const updateRecipe = useMutation(api.recipes.update);

  // Revoke blob URL on unmount
  useEffect(() => () => { if (coverImageUrl?.startsWith("blob:")) URL.revokeObjectURL(coverImageUrl); }, [coverImageUrl]);

  // Redirect unauthenticated users — must be in effect, not render
  const userIsNull = user === null;
  useEffect(() => {
    if (userIsNull) void navigate({ to: "/login", replace: true });
  }, [userIsNull, navigate]);

  if (user === undefined) return <div className="flex items-center justify-center min-h-[60vh] text-stone animate-pulse">Loading…</div>;
  if (user === null) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const { storageId } = await (await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file })).json();
      if (coverImageUrl?.startsWith("blob:")) URL.revokeObjectURL(coverImageUrl);
      setCoverImage(storageId);
      setCoverImageUrl(URL.createObjectURL(file));
      toast("Image uploaded", "success");
    } catch {
      toast("Could not upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { toast("Please add a title", "error"); return; }
    if (trimmedTitle.length > 200) { toast("Title must be under 200 characters", "error"); return; }
    const validIngredients = ingredients.filter(Boolean);
    const validSteps = steps.filter(Boolean);
    if (status === "published" && validIngredients.length === 0) { toast("Add at least one ingredient", "error"); return; }
    if (status === "published" && validSteps.length === 0) { toast("Add at least one step", "error"); return; }

    setLoading(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: description.trim() || undefined,
        category: category || "General",
        ingredients: validIngredients,
        steps: validSteps,
        coverImage: coverImage ?? undefined,
        videoUrl: videoUrl.trim() || undefined,
        status,
      };

      if (isEditing && initialData?.id) {
        await updateRecipe({ id: initialData.id, ...payload });
        toast("Recipe updated!", "success");
      } else {
        await createRecipe(payload);
        toast(status === "published" ? "Recipe published!" : "Draft saved!", "success");
      }
      void navigate({ to: "/dashboard" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save recipe", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-medium">{isEditing ? "Edit recipe" : "New recipe"}</h1>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard" className="btn-ghost text-sm">Cancel</Link>
          <button onClick={() => handleSubmit("draft")} disabled={loading} className="btn-secondary text-sm">{loading ? "Saving…" : "Save draft"}</button>
          <button onClick={() => handleSubmit("published")} disabled={loading} className="btn-primary text-sm">{loading ? "Saving…" : (isEditing ? "Update" : "Publish")}</button>
        </div>
      </div>

      {!isEditing && (
        <div className="mb-8">
          <RecipeImporter onImport={(imported) => {
            setTitle(imported.title);
            setDescription(imported.description);
            setIngredients(imported.ingredients.length > 0 ? imported.ingredients : [""]);
            setSteps(imported.steps.length > 0 ? imported.steps : [""]);
            toast("Recipe imported! Review and edit before publishing.", "success");
          }} />
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          {/* Basic info */}
          <section className="card p-6 space-y-5">
            <h2 className="font-serif text-lg font-medium">Basic info</h2>
            <div>
              <label htmlFor="recipe-title" className="block text-sm font-medium text-charcoal-light mb-2">Title</label>
              <input id="recipe-title" type="text" className="input-field text-lg font-medium" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's cooking?" maxLength={200} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-light mb-2">Category</label>
                <Select value={category} onChange={setCategory} options={CATEGORIES.map((c) => ({ label: c, value: c }))} className="w-full" />
              </div>
              <div>
                <label htmlFor="recipe-video" className="block text-sm font-medium text-charcoal-light mb-2">Video URL <span className="text-stone">(optional)</span></label>
                <input id="recipe-video" type="url" className="input-field" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube or TikTok" />
              </div>
            </div>
            <div>
              <label htmlFor="recipe-description" className="block text-sm font-medium text-charcoal-light mb-2">Description</label>
              <textarea id="recipe-description" className="textarea-field h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell the story…" />
            </div>
          </section>

          {/* Ingredients */}
          <section className="card p-6 space-y-4">
            <h2 className="font-serif text-lg font-medium">Ingredients</h2>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" className="input-field" value={ing} placeholder="e.g. 2 cups flour" onChange={(e) => setIngredients(setAt(ingredients, i, e.target.value))} aria-label={`Ingredient ${i + 1}`} />
                <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="btn-ghost px-3 text-stone hover:text-terracotta" aria-label={`Remove ingredient ${i + 1}`}>×</button>
              </div>
            ))}
            <button onClick={() => setIngredients([...ingredients, ""])} className="text-sm font-medium text-sage hover:text-sage-light">+ Add ingredient</button>
          </section>

          {/* Steps */}
          <section className="card p-6 space-y-4">
            <h2 className="font-serif text-lg font-medium">Instructions</h2>
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-charcoal text-cream text-sm font-medium flex items-center justify-center shrink-0 mt-2">{i + 1}</span>
                <div className="flex-1">
                  <textarea className="textarea-field h-20" value={step} placeholder="Describe this step…" onChange={(e) => setSteps(setAt(steps, i, e.target.value))} aria-label={`Step ${i + 1}`} />
                  <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="text-xs text-stone hover:text-terracotta mt-1" aria-label={`Remove step ${i + 1}`}>Remove</button>
                </div>
              </div>
            ))}
            <button onClick={() => setSteps([...steps, ""])} className="text-sm font-medium text-sage hover:text-sage-light">+ Add step</button>
          </section>
        </div>

        {/* Cover image */}
        <aside>
          <div className="card p-5 sticky top-24 space-y-4">
            <h3 className="text-sm font-medium text-charcoal-light">Cover image</h3>
            <div className={`relative aspect-video rounded-lg overflow-hidden border-2 border-dashed ${coverImageUrl ? "border-transparent" : "border-stone-light hover:border-sage bg-cream-dark"}`}>
              {coverImageUrl ? (
                <>
                  <img src={coverImageUrl} className="w-full h-full object-cover" alt="Recipe cover preview" />
                  <label className="absolute inset-0 bg-charcoal/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="btn-primary text-xs">Change</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" aria-label="Change cover image" />
                  </label>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-stone hover:text-sage">
                  <span className="text-xs font-medium">Upload image</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" aria-label="Upload cover image" />
                </label>
              )}
            </div>
            {uploading && <p className="text-xs text-sage text-center animate-pulse">Uploading…</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
