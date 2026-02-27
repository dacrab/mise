import { useState, useEffect, useRef } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useMutation, useQuery } from "convex/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useToast } from "@/components/ui/toast";
import { Select } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RecipeImporter } from "@/components/recipe/RecipeImporter";

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"] as const;

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
  ariaLabel: (i: number) => string;
  numbered?: boolean;
}

function setAt(arr: string[], i: number, val: string): string[] {
  return arr.map((x, j) => (j === i ? val : x));
}

function EditableList({ items, onChange, placeholder, addLabel, ariaLabel, numbered = false }: EditableListProps) {
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, ""]);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className={`flex gap-${numbered ? "3" : "2"}`}>
          {numbered && (
            <span className="w-7 h-7 rounded-full bg-charcoal text-cream text-sm font-medium flex items-center justify-center shrink-0 mt-2">
              {i + 1}
            </span>
          )}
          <div className="flex-1">
            {numbered ? (
              <textarea
                className="textarea-field h-20"
                value={item}
                placeholder={placeholder}
                onChange={(e) => onChange(setAt(items, i, e.target.value))}
                aria-label={ariaLabel(i + 1)}
              />
            ) : (
              <input
                type="text"
                className="input-field"
                value={item}
                placeholder={placeholder}
                onChange={(e) => onChange(setAt(items, i, e.target.value))}
                aria-label={ariaLabel(i + 1)}
              />
            )}
            {numbered && (
              <button onClick={() => remove(i)} className="text-xs text-stone hover:text-terracotta mt-1" aria-label={`Remove item ${i + 1}`}>
                Remove
              </button>
            )}
          </div>
          {!numbered && (
            <button onClick={() => remove(i)} className="btn-ghost px-3 text-stone hover:text-terracotta" aria-label={`Remove item ${i + 1}`}>×</button>
          )}
        </div>
      ))}
      <button onClick={add} className="text-sm font-medium text-sage hover:text-sage-light">
        {addLabel}
      </button>
    </div>
  );
}

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
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  difficulty?: string | null;
}

interface Props {
  initialData?: InitialData;
  isEditing?: boolean;
}

export function RecipeEditor({ initialData, isEditing }: Props) {
  const { toast } = useToast();
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "General");
  const [prepTime, setPrepTime] = useState<number | "">(initialData?.prepTime ?? "");
  const [cookTime, setCookTime] = useState<number | "">(initialData?.cookTime ?? "");
  const [servings, setServings] = useState<number | "">(initialData?.servings ?? "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty ?? "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl ?? "");
  const [coverImage, setCoverImage] = useState<Id<"_storage"> | null>(initialData?.coverImage ?? null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients ?? [""]);
  const [steps, setSteps] = useState<string[]>(initialData?.steps ?? [""]);

  // Unsaved changes tracking
  const isDirty = useRef(false);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    isDirty.current = true;
  }, [title, description, category, prepTime, cookTime, servings, difficulty, videoUrl, coverImage, ingredients, steps]);

  // Warn on browser close/refresh when dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirty.current) e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);
  const createRecipe = useMutation(api.recipes.create);
  const updateRecipe = useMutation(api.recipes.update);
  const updateRecipeRef = useRef(updateRecipe);
  updateRecipeRef.current = updateRecipe;
  const { upload, uploading, progress: uploadProgress } = useFileUpload(
    () => generateUploadUrl(),
    {
      onSuccess: (storageId, previewUrl) => {
        if (coverImageUrl?.startsWith("blob:")) URL.revokeObjectURL(coverImageUrl);
        setCoverImage(storageId as Id<"_storage">);
        setCoverImageUrl(previewUrl);
        toast("Image uploaded", "success");
      },
      onError: () => toast("Could not upload image", "error"),
    }
  );

  // Auto-save draft every 30s when dirty and editing
  useEffect(() => {
    if (!isEditing || !initialData?.id) return;
    const recipeId = initialData.id;
    const interval = setInterval(async () => {
      if (!isDirty.current) return;
      try {
        await updateRecipeRef.current({
          id: recipeId,
          title: title.trim() || "Untitled",
          description: description.trim() || undefined,
          category: category || "General",
          prepTime: prepTime !== "" ? Number(prepTime) : undefined,
          cookTime: cookTime !== "" ? Number(cookTime) : undefined,
          servings: servings !== "" ? Number(servings) : undefined,
          difficulty: difficulty || undefined,
          ingredients: ingredients.filter(Boolean),
          steps: steps.filter(Boolean),
          coverImage: coverImage ?? undefined,
          videoUrl: videoUrl.trim() || undefined,
          status: "draft",
        });
        isDirty.current = false;
        setLastSaved(new Date());
      } catch { /* silent auto-save fail */ }
    }, 30_000);
    return () => clearInterval(interval);
  }, [isEditing, initialData?.id, title, description, category, prepTime, cookTime, servings, difficulty, ingredients, steps, coverImage, videoUrl]);

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
    await upload(file);
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
        prepTime: prepTime !== "" ? Number(prepTime) : undefined,
        cookTime: cookTime !== "" ? Number(cookTime) : undefined,
        servings: servings !== "" ? Number(servings) : undefined,
        difficulty: difficulty || undefined,
        ingredients: validIngredients,
        steps: validSteps,
        coverImage: coverImage ?? undefined,
        videoUrl: videoUrl.trim() || undefined,
        status,
      };

      if (isEditing && initialData?.id) {
        await updateRecipe({ id: initialData.id, ...payload });
        isDirty.current = false;
        toast("Recipe updated!", "success");
      } else {
        await createRecipe(payload);
        isDirty.current = false;
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
        <div className="flex flex-wrap items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-stone hidden sm:inline">
              Auto-saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Link to="/dashboard" className="btn-ghost text-sm">Cancel</Link>
          <button onClick={() => void handleSubmit("draft")} disabled={loading} className="btn-secondary text-sm">{loading ? "Saving…" : "Save draft"}</button>
          <button onClick={() => void handleSubmit("published")} disabled={loading} className="btn-primary text-sm">{loading ? "Saving…" : (isEditing ? "Update" : "Publish")}</button>
        </div>
      </div>

      {!isEditing && (
        <div className="mb-8">
          <RecipeImporter onImport={(imported) => {
            if (imported.title) setTitle(imported.title);
            if (imported.description) setDescription(imported.description);
            if (imported.ingredients.length > 0) setIngredients(imported.ingredients);
            if (imported.steps.length > 0) setSteps(imported.steps);
            if (imported.imageUrl) setCoverImageUrl(imported.imageUrl);
            if (imported.prepTime) setPrepTime(imported.prepTime);
            if (imported.cookTime) setCookTime(imported.cookTime);
            if (imported.servings) setServings(imported.servings);
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
                <label htmlFor="recipe-category" className="block text-sm font-medium text-charcoal-light mb-2">Category</label>
                <Select id="recipe-category" value={category} onChange={setCategory} options={CATEGORIES.map((c) => ({ label: c, value: c }))} className="w-full" />
              </div>
              <div>
                <label htmlFor="recipe-difficulty" className="block text-sm font-medium text-charcoal-light mb-2">Difficulty <span className="text-stone">(optional)</span></label>
                <Select id="recipe-difficulty" value={difficulty} onChange={setDifficulty} options={[{ label: "Select…", value: "" }, ...DIFFICULTIES.map((d) => ({ label: d, value: d }))]} className="w-full" />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="recipe-prep-time" className="block text-sm font-medium text-charcoal-light mb-2">Prep time <span className="text-stone">(min)</span></label>
                <input id="recipe-prep-time" type="number" min={0} max={1440} className="input-field" value={prepTime} onChange={(e) => setPrepTime(e.target.value === "" ? "" : Number(e.target.value))} placeholder="15" />
              </div>
              <div>
                <label htmlFor="recipe-cook-time" className="block text-sm font-medium text-charcoal-light mb-2">Cook time <span className="text-stone">(min)</span></label>
                <input id="recipe-cook-time" type="number" min={0} max={1440} className="input-field" value={cookTime} onChange={(e) => setCookTime(e.target.value === "" ? "" : Number(e.target.value))} placeholder="30" />
              </div>
              <div>
                <label htmlFor="recipe-servings" className="block text-sm font-medium text-charcoal-light mb-2">Servings</label>
                <input id="recipe-servings" type="number" min={1} max={100} className="input-field" value={servings} onChange={(e) => setServings(e.target.value === "" ? "" : Number(e.target.value))} placeholder="4" />
              </div>
            </div>
            <div>
              <label htmlFor="recipe-video" className="block text-sm font-medium text-charcoal-light mb-2">Video URL <span className="text-stone">(optional)</span></label>
              <input id="recipe-video" type="url" className="input-field" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube or TikTok" />
            </div>
            <div>
              <label htmlFor="recipe-description" className="block text-sm font-medium text-charcoal-light mb-2">Description</label>
              <textarea id="recipe-description" className="textarea-field h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell the story…" />
            </div>
          </section>

          {/* Ingredients */}
          <section className="card p-6 space-y-4">
            <h2 className="font-serif text-lg font-medium">Ingredients</h2>
            <EditableList items={ingredients} onChange={setIngredients} placeholder="e.g. 2 cups flour" addLabel="+ Add ingredient" ariaLabel={(i) => `Ingredient ${i}`} />
          </section>

          {/* Steps */}
          <section className="card p-6 space-y-4">
            <h2 className="font-serif text-lg font-medium">Instructions</h2>
            <EditableList items={steps} onChange={setSteps} placeholder="Describe this step…" addLabel="+ Add step" ariaLabel={(i) => `Step ${i}`} numbered />
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
            {uploading && <ProgressBar value={uploadProgress} label="Uploading" />}
          </div>
        </aside>
      </div>
    </div>
  );
}
