import { ArrowLeftIcon, PhotoIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import type { FieldError as RHFFieldError } from "react-hook-form";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ProgressBar } from "@/components/ui/Primitives";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  CATEGORIES as BASE_CATEGORIES,
  DIFFICULTIES,
  MAX_COOK_MINUTES,
  MAX_IMAGE_BYTES,
  MAX_PREP_MINUTES,
  MAX_SERVINGS,
  MIN_COOK_MINUTES,
  MIN_PREP_MINUTES,
  MIN_SERVINGS,
} from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";

const CATEGORIES = ["General", ...BASE_CATEGORIES];

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
  prepTime: numericStr(
    MIN_PREP_MINUTES,
    MAX_PREP_MINUTES,
    "Prep time cannot be negative",
    `Prep time must be under ${MAX_PREP_MINUTES} minutes`,
  ),
  cookTime: numericStr(
    MIN_COOK_MINUTES,
    MAX_COOK_MINUTES,
    "Cook time cannot be negative",
    `Cook time must be under ${MAX_COOK_MINUTES} minutes`,
  ),
  servings: numericStr(
    MIN_SERVINGS,
    MAX_SERVINGS,
    "Servings must be at least 1",
    `Servings must be at most ${MAX_SERVINGS}`,
  ),
  videoUrl: z
    .string()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), { message: "Video URL must be a valid URL" }),
  ingredients: z.array(z.object({ value: z.string() })),
  steps: z.array(z.object({ value: z.string() })),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const unwrap = (arr?: Array<{ value?: string }>) => (arr ?? []).map((x) => x.value ?? "");

function FieldError({ error }: { error?: RHFFieldError | { message?: string } }) {
  if (!error?.message) return null;
  return <p className="text-xs text-terracotta mt-1">{error.message}</p>;
}

function buildPayload(
  data: RecipeFormData,
  coverImage: Id<"_storage"> | null,
  validIngredients: string[],
  validSteps: string[],
) {
  return {
    title: data.title.trim() || "Untitled",
    description: data.description.trim() || undefined,
    category: data.category || "General",
    prepTime: data.prepTime ? Number(data.prepTime) : undefined,
    cookTime: data.cookTime ? Number(data.cookTime) : undefined,
    servings: data.servings ? Number(data.servings) : undefined,
    difficulty: data.difficulty || undefined,
    ingredients: validIngredients,
    steps: validSteps,
    coverImage: coverImage ?? undefined,
    videoUrl: data.videoUrl.trim() || undefined,
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
  } = useFieldArray({ control, name: "ingredients" });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: "steps" });

  const watchedValues = useWatch<RecipeFormData>({ control });

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
      setCoverImage(storageId);
      setCoverImageUrl(previewUrl);
      toast("Image uploaded", "success");
    },
    onError: () => toast("Could not upload image", "error"),
  });

  useEffect(() => {
    if (!isEditing || !initialData?.id || !isDirty) return;
    const recipeId = initialData.id;
    const recipeStatus = initialData.status ?? "draft";
    const timer = setTimeout(async () => {
      const vals = watchedValues as RecipeFormData;
      try {
        await updateRecipe({
          id: recipeId,
          ...buildPayload(vals, coverImage, unwrap(vals.ingredients), unwrap(vals.steps)),
          status: recipeStatus,
        });
        setLastSaved(new Date());
        reset({ ...vals });
      } catch {
        toast("Autosave failed", "error");
      }
    }, 30_000);
    return () => clearTimeout(timer);
  }, [isEditing, initialData?.id, initialData?.status, isDirty, watchedValues, coverImage, updateRecipe, reset, toast]);

  useEffect(
    () => () => {
      if (coverImageUrl?.startsWith("blob:")) URL.revokeObjectURL(coverImageUrl);
    },
    [coverImageUrl],
  );

  if (user === undefined) {
    return <div className="center min-h-[60vh] text-stone animate-pulse">Loading…</div>;
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast("Image must be under 5MB", "error");
      return;
    }
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
      toast(getErrorMessage(err), "error");
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
              aria-label="Back to dashboard"
            >
              <ArrowLeftIcon className="w-5 h-5" />
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
                  <PhotoIcon className="w-10 h-10" />
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
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => appendIngredient({ value: "" })}
                className="flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-light transition-colors pt-2"
                type="button"
              >
                <PlusIcon className="w-4 h-4" />
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
                <PlusIcon className="w-4 h-4" />
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
                      min={MIN_PREP_MINUTES}
                      max={MAX_PREP_MINUTES}
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
                      min={MIN_COOK_MINUTES}
                      max={MAX_COOK_MINUTES}
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
                    min={MIN_SERVINGS}
                    max={MAX_SERVINGS}
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
