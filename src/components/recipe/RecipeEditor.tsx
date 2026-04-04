import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { ProgressBar } from "@/components/ui/Primitives";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { CATEGORIES as BASE_CATEGORIES, DIFFICULTIES } from "@/lib/constants";

import { RecipeImporter } from "@/components/recipe/RecipeImporter";

const CATEGORIES = ["General", ...BASE_CATEGORIES];

// All fields are strings in the RHF layer (native HTML inputs return strings).
// Numeric fields are validated as numeric strings and converted to numbers on submit.
// useFieldArray requires object items — strings are wrapped as { value: string }.
type RecipeFormData = {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  videoUrl: string;
  ingredients: Array<{ value: string }>;
  steps: Array<{ value: string }>;
};

const numericStr = (min: number, max: number, minMsg: string, maxMsg: string) =>
  z
    .string()
    .refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= min), { message: minMsg })
    .refine((val) => !val || Number(val) <= max, { message: maxMsg });

const recipeSchema = z.object({
  title: z.string().min(1, "Please add a title").max(200, "Title must be under 200 characters"),
  description: z.string(),
  category: z.string(),
  difficulty: z.string(),
  prepTime: numericStr(0, 24 * 60, "Prep time must be at least 0", "Prep time must be under 1440 minutes"),
  cookTime: numericStr(0, 24 * 60, "Cook time must be at least 0", "Cook time must be under 1440 minutes"),
  servings: numericStr(1, 100, "Servings must be at least 1", "Servings must be at most 100"),
  videoUrl: z
    .string()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), { message: "Video URL must be a valid URL" }),
  ingredients: z.array(z.object({ value: z.string() })),
  steps: z.array(z.object({ value: z.string() })),
});

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
  const [coverImage, setCoverImage] = useState<Id<"_storage"> | null>(initialData?.coverImage ?? null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");

  // Tracks which button (Save draft / Publish) was clicked before RHF handleSubmit runs.
  const pendingStatusRef = useRef<"draft" | "published" | null>(null);

  const {
    register,
    control,
    handleSubmit: rhfHandleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      category: initialData?.category ?? "General",
      difficulty: initialData?.difficulty ?? "",
      prepTime: initialData?.prepTime != null ? String(initialData.prepTime) : "",
      cookTime: initialData?.cookTime != null ? String(initialData.cookTime) : "",
      servings: initialData?.servings != null ? String(initialData.servings) : "",
      videoUrl: initialData?.videoUrl ?? "",
      ingredients: (initialData?.ingredients ?? [""]).map((v) => ({ value: v })),
      steps: (initialData?.steps ?? [""]).map((v) => ({ value: v })),
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  const unwrap = (arr: Array<{ value: string }>) => arr.map((x) => x.value);

  const watchedValues = watch();

  // Warn on tab close/refresh when the form has unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);
  const createRecipe = useMutation(api.recipes.create);
  const updateRecipe = useMutation(api.recipes.update);

  const {
    upload,
    uploading,
    progress: uploadProgress,
  } = useFileUpload(() => generateUploadUrl(), {
    onSuccess: (storageId, previewUrl) => {
      if (coverImageUrl?.startsWith("blob:")) URL.revokeObjectURL(coverImageUrl);
      setCoverImage(storageId as Id<"_storage">);
      setCoverImageUrl(previewUrl);
      toast("Image uploaded", "success");
    },
    onError: () => toast("Could not upload image", "error"),
  });

  // Auto-save draft every 30s while editing and the form is dirty.
  useEffect(() => {
    if (!isEditing || !initialData?.id) return;
    const recipeId = initialData.id;
    const interval = setInterval(async () => {
      if (!isDirty) return;
      try {
        const validIngredients = unwrap(watchedValues.ingredients).filter(Boolean);
        const validSteps = unwrap(watchedValues.steps).filter(Boolean);

        await updateRecipe({
          id: recipeId,
          title: watchedValues.title.trim() || "Untitled",
          description: watchedValues.description?.trim() || undefined,
          category: watchedValues.category || "General",
          prepTime: watchedValues.prepTime ? Number(watchedValues.prepTime) : undefined,
          cookTime: watchedValues.cookTime ? Number(watchedValues.cookTime) : undefined,
          servings: watchedValues.servings ? Number(watchedValues.servings) : undefined,
          difficulty: watchedValues.difficulty || undefined,
          ingredients: validIngredients,
          steps: validSteps,
          coverImage: coverImage ?? undefined,
          videoUrl: watchedValues.videoUrl?.trim() || undefined,
          status: "draft",
        });
        setLastSaved(new Date());
      } catch {
        /* silent auto-save fail */
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [isEditing, initialData?.id, isDirty, coverImage, watchedValues, updateRecipe]);

  // Revoke the blob preview URL when the component unmounts to free memory.
  useEffect(
    () => () => {
      if (coverImageUrl?.startsWith("blob:")) URL.revokeObjectURL(coverImageUrl);
    },
    [coverImageUrl]
  );

  useEffect(() => {
    if (user === null) void navigate({ to: "/login", replace: true });
  }, [user, navigate]);

  if (user === undefined) {
    return <div className="flex items-center justify-center min-h-[60vh] text-stone animate-pulse">Loading…</div>;
  }
  if (user === null) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file);
  };

  const handleSubmit = async (data: RecipeFormData) => {
    const status = pendingStatusRef.current;
    if (!status) return;

    const validIngredients = unwrap(data.ingredients).filter(Boolean);
    const validSteps = unwrap(data.steps).filter(Boolean);

    if (status === "published" && validIngredients.length === 0) {
      toast("Add at least one ingredient", "error");
      return;
    }
    if (status === "published" && validSteps.length === 0) {
      toast("Add at least one step", "error");
      return;
    }


    setLoading(true);
    try {
      const payload = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        category: data.category || "General",
        prepTime: data.prepTime ? Number(data.prepTime) : undefined,
        cookTime: data.cookTime ? Number(data.cookTime) : undefined,
        servings: data.servings ? Number(data.servings) : undefined,
        difficulty: data.difficulty || undefined,
        ingredients: validIngredients,
        steps: validSteps,
        coverImage: coverImage ?? undefined,
        videoUrl: data.videoUrl?.trim() || undefined,
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
      pendingStatusRef.current = null;
    }
  };

  const triggerSubmit = (status: "draft" | "published") => {
    pendingStatusRef.current = status;
    void rhfHandleSubmit(handleSubmit)();
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
          <Link to="/dashboard" className="btn-ghost text-sm">
            Cancel
          </Link>
          <button onClick={() => triggerSubmit("draft")} disabled={loading} className="btn-secondary text-sm">
            {loading ? "Saving…" : "Save draft"}
          </button>
          <button onClick={() => triggerSubmit("published")} disabled={loading} className="btn-primary text-sm">
            {loading ? "Saving…" : isEditing ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {!isEditing && (
        <div className="mb-8">
          <RecipeImporter
            onImport={(imported) => {
              reset((formValues) => ({
                ...formValues,
                title: imported.title || formValues.title,
                description: imported.description || formValues.description,
                ingredients: imported.ingredients.length > 0 ? imported.ingredients.map((v) => ({ value: v })) : formValues.ingredients,
                steps: imported.steps.length > 0 ? imported.steps.map((v) => ({ value: v })) : formValues.steps,
                prepTime: imported.prepTime ? String(imported.prepTime) : formValues.prepTime,
                cookTime: imported.cookTime ? String(imported.cookTime) : formValues.cookTime,
                servings: imported.servings ? String(imported.servings) : formValues.servings,
              }));
              if (imported.imageUrl) setCoverImageUrl(imported.imageUrl);
              toast("Recipe imported! Review and edit before publishing.", "success");
            }}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          <section className="card p-6 space-y-5">
            <h2 className="font-serif text-lg font-medium">Basic info</h2>
            <div>
              <label htmlFor="recipe-title" className="block text-sm font-medium text-charcoal-light mb-2">
                Title
              </label>
              <input
                id="recipe-title"
                type="text"
                className="input-field text-lg font-medium"
                placeholder="What's cooking?"
                maxLength={200}
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-terracotta mt-1">{errors.title.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="recipe-category" className="block text-sm font-medium text-charcoal-light mb-2">
                  Category
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="recipe-category"
                      value={field.value}
                      onChange={field.onChange}
                      options={CATEGORIES.map((c) => ({ label: c, value: c }))}
                      className="w-full"
                    />
                  )}
                />
              </div>
              <div>
                <label htmlFor="recipe-difficulty" className="block text-sm font-medium text-charcoal-light mb-2">
                  Difficulty <span className="text-stone">(optional)</span>
                </label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="recipe-difficulty"
                      value={field.value}
                      onChange={field.onChange}
                      options={[{ label: "Select…", value: "" }, ...DIFFICULTIES.map((d) => ({ label: d, value: d }))]}
                      className="w-full"
                    />
                  )}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="recipe-prep-time" className="block text-sm font-medium text-charcoal-light mb-2">
                  Prep time <span className="text-stone">(min)</span>
                </label>
                <input
                  id="recipe-prep-time"
                  type="number"
                  min={0}
                  max={1440}
                  className="input-field"
                  placeholder="15"
                  {...register("prepTime")}
                />
                {errors.prepTime && <p className="text-xs text-terracotta mt-1">{errors.prepTime.message}</p>}
              </div>
              <div>
                <label htmlFor="recipe-cook-time" className="block text-sm font-medium text-charcoal-light mb-2">
                  Cook time <span className="text-stone">(min)</span>
                </label>
                <input
                  id="recipe-cook-time"
                  type="number"
                  min={0}
                  max={1440}
                  className="input-field"
                  placeholder="30"
                  {...register("cookTime")}
                />
                {errors.cookTime && <p className="text-xs text-terracotta mt-1">{errors.cookTime.message}</p>}
              </div>
              <div>
                <label htmlFor="recipe-servings" className="block text-sm font-medium text-charcoal-light mb-2">
                  Servings
                </label>
                <input
                  id="recipe-servings"
                  type="number"
                  min={1}
                  max={100}
                  className="input-field"
                  placeholder="4"
                  {...register("servings")}
                />
                {errors.servings && <p className="text-xs text-terracotta mt-1">{errors.servings.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="recipe-video" className="block text-sm font-medium text-charcoal-light mb-2">
                Video URL <span className="text-stone">(optional)</span>
              </label>
              <input
                id="recipe-video"
                type="url"
                className="input-field"
                placeholder="YouTube or TikTok"
                {...register("videoUrl")}
              />
              {errors.videoUrl && <p className="text-xs text-terracotta mt-1">{errors.videoUrl.message}</p>}
            </div>
            <div>
              <label htmlFor="recipe-description" className="block text-sm font-medium text-charcoal-light mb-2">
                Description
              </label>
              <textarea
                id="recipe-description"
                className="textarea-field h-24"
                placeholder="Tell the story…"
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-terracotta mt-1">{errors.description.message}</p>}
            </div>
          </section>

          <section className="card p-6 space-y-4">
            <h2 className="font-serif text-lg font-medium">Ingredients</h2>
            <div className="space-y-3">
              {ingredientFields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 2 cups flour"
                      {...register(`ingredients.${i}.value`)}
                      aria-label={`Ingredient ${i + 1}`}
                    />
                    {errors.ingredients?.[i] && (
                      <p className="text-xs text-terracotta mt-1">{errors.ingredients[i]?.message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeIngredient(i)}
                    className="btn-ghost px-3 text-stone hover:text-terracotta"
                    aria-label={`Remove ingredient ${i + 1}`}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => appendIngredient({ value: "" })}
                className="text-sm font-medium text-sage hover:text-sage-light"
                type="button"
              >
                + Add ingredient
              </button>
            </div>
          </section>

          <section className="card p-6 space-y-4">
            <h2 className="font-serif text-lg font-medium">Instructions</h2>
            <div className="space-y-3">
              {stepFields.map((field, i) => (
                <div key={field.id} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-charcoal text-cream text-sm font-medium flex items-center justify-center shrink-0 mt-2">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <textarea
                      className="textarea-field h-20"
                      placeholder="Describe this step…"
                      {...register(`steps.${i}.value`)}
                      aria-label={`Step ${i + 1}`}
                    />
                    {errors.steps?.[i] && <p className="text-xs text-terracotta mt-1">{errors.steps[i]?.message}</p>}
                    <button
                      onClick={() => removeStep(i)}
                      className="text-xs text-stone hover:text-terracotta mt-1"
                      aria-label={`Remove step ${i + 1}`}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => appendStep({ value: "" })}
                className="text-sm font-medium text-sage hover:text-sage-light"
                type="button"
              >
                + Add step
              </button>
            </div>
          </section>
        </div>

        <aside>
          <div className="card p-5 sticky top-24 space-y-4">
            <h3 className="text-sm font-medium text-charcoal-light">Cover image</h3>
            <div
              className={`relative aspect-video rounded-lg overflow-hidden border-2 border-dashed ${
                coverImageUrl ? "border-transparent" : "border-stone-light hover:border-sage bg-cream-dark"
              }`}
            >
              {coverImageUrl ? (
                <>
                  <img src={coverImageUrl} className="w-full h-full object-cover" alt="Recipe cover preview" />
                  <label className="absolute inset-0 bg-charcoal/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="btn-primary text-xs">Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                      aria-label="Change cover image"
                    />
                  </label>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-stone hover:text-sage">
                  <span className="text-xs font-medium">Upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    aria-label="Upload cover image"
                  />
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
