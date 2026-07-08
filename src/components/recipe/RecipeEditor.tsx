import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FieldError } from "@/components/ui/FieldError";
import { ProgressBar } from "@/components/ui/Primitives";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { CATEGORIES as BASE_CATEGORIES, DIFFICULTIES } from "@/lib/constants";

const CATEGORIES = ["General", ...BASE_CATEGORIES];

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

const unwrap = (arr?: Array<{ value?: string }>) => (arr ?? []).map((x) => x.value ?? "");

function buildPayload(
  data: RecipeFormData,
  coverImage: Id<"_storage"> | null,
  validIngredients: string[],
  validSteps: string[],
) {
  return {
    title: data.title.trim() || "Untitled",
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
  };
}

export function RecipeEditor({
  initialData,
  isEditing,
}: {
  initialData?: {
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
  };
  isEditing?: boolean;
}) {
  const { toast } = useToast();
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [coverImage, setCoverImage] = useState<Id<"_storage"> | null>(initialData?.coverImage ?? null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");

  const pendingStatusRef = useRef<"draft" | "published" | null>(null);

  const {
    register,
    control,
    handleSubmit: rhfHandleSubmit,
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
  } = useFieldArray({ control, name: "ingredients" });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: "steps" });

  const watchedValues = useWatch<RecipeFormData>({ control });
  const watchedValuesRef = useRef(watchedValues);
  watchedValuesRef.current = watchedValues;

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

  useEffect(() => {
    if (!isEditing || !initialData?.id) return;
    const recipeId = initialData.id;
    const interval = setInterval(async () => {
      if (!isDirty) return;
      const vals = watchedValuesRef.current;
      const validIngredients = unwrap(vals.ingredients);
      const validSteps = unwrap(vals.steps);
      try {
        await updateRecipe({
          id: recipeId,
          ...buildPayload(vals as RecipeFormData, coverImage, validIngredients, validSteps),
          status: "draft",
        });
        setLastSaved(new Date());
      } catch {
        // biome-ignore lint/suspicious/noConsole: required error logging
        console.error("Auto-save failed");
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [isEditing, initialData?.id, isDirty, coverImage, updateRecipe]);

  useEffect(
    () => () => {
      if (coverImageUrl?.startsWith("blob:")) URL.revokeObjectURL(coverImageUrl);
    },
    [coverImageUrl],
  );

  useEffect(() => {
    if (user === null) void navigate({ to: "/login", replace: true });
  }, [user, navigate]);

  if (user === undefined) {
    return <div className="center min-h-[60vh] text-stone animate-pulse">Loading…</div>;
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
      const payload = { ...buildPayload(data, coverImage, validIngredients, validSteps), status };
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
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="sticky top-16 z-30 glass border-b border-cream-dark dark:border-d-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="cursor-pointer text-stone hover:text-charcoal dark:hover:text-d-text transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <h1 className="font-serif text-lg font-medium">{isEditing ? "Edit recipe" : "New recipe"}</h1>
            {lastSaved && (
              <span className="text-xs text-stone hidden sm:inline">
                Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerSubmit("draft")}
              disabled={loading}
              className="btn-secondary text-sm px-4 py-2 cursor-pointer"
            >
              {loading ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => triggerSubmit("published")}
              disabled={loading}
              className="btn-primary text-sm px-4 py-2 cursor-pointer"
            >
              {loading ? "Saving…" : isEditing ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <div
              className={`relative w-full rounded-xl overflow-hidden border-2 border-dashed transition-colors ${
                coverImageUrl
                  ? "border-transparent aspect-[21/9]"
                  : "border-stone-light hover:border-sage bg-cream-dark dark:bg-d-surface-muted dark:border-d-border-strong dark:hover:border-sage aspect-[21/9]"
              }`}
            >
              {coverImageUrl ? (
                <>
                  <img src={coverImageUrl} className="w-full h-full object-cover" alt="Recipe cover preview" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                  <label className="absolute bottom-4 right-4 btn-secondary text-xs px-3 py-1.5 cursor-pointer bg-warm-white/90 backdrop-blur-sm">
                    Change image
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
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-stone hover:text-sage transition-colors gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-10 h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Add a cover photo</span>
                  <span className="text-xs text-stone">Recommended: 1200×600px or wider</span>
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

            <div>
              <input
                id="recipe-title"
                type="text"
                className="w-full text-2xl sm:text-3xl font-serif font-medium bg-transparent border-none outline-none placeholder:text-stone-light focus:ring-0 py-2 dark:text-d-text-heading"
                placeholder="Recipe title"
                maxLength={200}
                {...register("title")}
              />
              <FieldError error={errors.title} />
            </div>

            <div>
              <textarea
                id="recipe-description"
                className="w-full bg-transparent border-none outline-none placeholder:text-stone text-charcoal-light resize-none focus:ring-0 text-base leading-relaxed dark:text-d-text-secondary"
                placeholder="Write a short intro — what inspired this dish, what makes it special…"
                rows={3}
                {...register("description")}
              />
              <FieldError error={errors.description} />
            </div>

            <section className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-medium">Ingredients</h2>
                <span className="text-xs text-stone">
                  {ingredientFields.filter((_, i) => watchedValues.ingredients?.[i]?.value).length} items
                </span>
              </div>
              <div className="space-y-2">
                {ingredientFields.map((field, i) => (
                  <div key={field.id} className="group flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                    <input
                      type="text"
                      className="flex-1 px-3 py-2.5 bg-transparent border-b border-transparent hover:border-stone-light focus:border-sage focus:outline-none text-sm transition-colors dark:hover:border-d-border-strong dark:focus:border-sage"
                      placeholder={i === 0 ? "e.g. 2 cups all-purpose flour" : "Add ingredient…"}
                      {...register(`ingredients.${i}.value`)}
                      aria-label={`Ingredient ${i + 1}`}
                    />
                    <button
                      onClick={() => removeIngredient(i)}
                      className="opacity-0 group-hover:opacity-100 text-stone hover:text-terracotta transition-opacity p-1"
                      aria-label={`Remove ingredient ${i + 1}`}
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => appendIngredient({ value: "" })}
                className="flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-light transition-colors pt-2"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add ingredient
              </button>
            </section>

            <section className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-medium">Instructions</h2>
                <span className="text-xs text-stone">
                  {stepFields.filter((_, i) => watchedValues.steps?.[i]?.value).length} steps
                </span>
              </div>
              <div className="space-y-4">
                {stepFields.map((field, i) => (
                  <div key={field.id} className="group flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="w-8 h-8 step-number text-sm">{i + 1}</span>
                      {i < stepFields.length - 1 && <div className="step-line mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <textarea
                        className="w-full px-3 py-2.5 surface-muted rounded-lg border border-transparent hover:border-stone-light focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/20 text-sm resize-none transition-all min-h-[80px]"
                        placeholder="Describe this step…"
                        {...register(`steps.${i}.value`)}
                        aria-label={`Step ${i + 1}`}
                      />
                      <button
                        onClick={() => removeStep(i)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-stone hover:text-terracotta mt-1.5 transition-opacity"
                        aria-label={`Remove step ${i + 1}`}
                        type="button"
                      >
                        Remove step
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => appendStep({ value: "" })}
                className="flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-light transition-colors"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add step
              </button>
            </section>
          </div>

          <aside className="lg:self-start">
            <div className="sticky top-[7.5rem] space-y-6">
              <div className="card p-6 space-y-5">
                <h3 className="font-serif text-base font-medium">Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="recipe-category" className="label">
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
                    <label htmlFor="recipe-difficulty" className="label">
                      Difficulty
                    </label>
                    <Controller
                      name="difficulty"
                      control={control}
                      render={({ field }) => (
                        <Select
                          id="recipe-difficulty"
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { label: "Select…", value: "" },
                            ...DIFFICULTIES.map((d) => ({ label: d, value: d })),
                          ]}
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="card p-6 space-y-5">
                <h3 className="font-serif text-base font-medium">Timing & Servings</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="recipe-prep-time" className="label text-xs">
                      Prep (min)
                    </label>
                    <input
                      id="recipe-prep-time"
                      type="number"
                      min={0}
                      max={1440}
                      className="input-field text-sm py-2.5"
                      placeholder="15"
                      {...register("prepTime")}
                    />
                    <FieldError error={errors.prepTime} />
                  </div>
                  <div>
                    <label htmlFor="recipe-cook-time" className="label text-xs">
                      Cook (min)
                    </label>
                    <input
                      id="recipe-cook-time"
                      type="number"
                      min={0}
                      max={1440}
                      className="input-field text-sm py-2.5"
                      placeholder="30"
                      {...register("cookTime")}
                    />
                    <FieldError error={errors.cookTime} />
                  </div>
                </div>
                <div>
                  <label htmlFor="recipe-servings" className="label text-xs">
                    Servings
                  </label>
                  <input
                    id="recipe-servings"
                    type="number"
                    min={1}
                    max={100}
                    className="input-field text-sm py-2.5"
                    placeholder="4"
                    {...register("servings")}
                  />
                  <FieldError error={errors.servings} />
                </div>
              </div>

              <div className="card p-6 space-y-4">
                <h3 className="font-serif text-base font-medium">Video</h3>
                <div>
                  <TextField
                    id="recipe-video"
                    label="Video URL"
                    placeholder="YouTube or TikTok URL"
                    type="url"
                    {...register("videoUrl")}
                  />
                  <FieldError error={errors.videoUrl} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
