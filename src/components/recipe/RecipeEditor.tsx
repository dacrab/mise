import { ArrowLeftIcon, PhotoIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { FieldError } from "@/components/ui/Field";
import { LoadingState, ProgressBar } from "@/components/ui/Primitives";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  CATEGORIES,
  DIFFICULTIES,
  MAX_COOK_MINUTES,
  MAX_PREP_MINUTES,
  MAX_SERVINGS,
  MIN_COOK_MINUTES,
  MIN_PREP_MINUTES,
  MIN_SERVINGS,
} from "@/lib/constants";
import { cn, getErrorMessage } from "@/lib/utils";

const AUTOSAVE_DELAY_MS = 30_000;

const numericString = (min: number, max: number, minMessage: string, maxMessage: string) =>
  z
    .string()
    .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= min), { message: minMessage })
    .refine((value) => !value || Number(value) <= max, { message: maxMessage });

const recipeSchema = z.object({
  title: z.string().trim().min(1, "Please add a title").max(200, "Title must be under 200 characters"),
  description: z.string(),
  category: z.enum(CATEGORIES),
  difficulty: z.string(),
  prepTime: numericString(
    MIN_PREP_MINUTES,
    MAX_PREP_MINUTES,
    "Prep time cannot be negative",
    `Prep time must be under ${MAX_PREP_MINUTES} minutes`,
  ),
  cookTime: numericString(
    MIN_COOK_MINUTES,
    MAX_COOK_MINUTES,
    "Cook time cannot be negative",
    `Cook time must be under ${MAX_COOK_MINUTES} minutes`,
  ),
  servings: numericString(
    MIN_SERVINGS,
    MAX_SERVINGS,
    "Servings must be at least 1",
    `Servings must be at most ${MAX_SERVINGS}`,
  ),
  videoUrl: z.string().refine((value) => !value || /^https?:\/\/.+/.test(value), {
    message: "Video URL must be a valid URL",
  }),
  ingredients: z.array(z.object({ value: z.string() })),
  steps: z.array(z.object({ value: z.string() })),
});

type RecipeFormData = z.infer<typeof recipeSchema>;
type RecipeStatus = "draft" | "published";

const values = (items?: Array<{ value?: string }>) => (items ?? []).map((item) => item.value ?? "");

function buildPayload(data: RecipeFormData, coverImage: Id<"_storage"> | null, ingredients: string[], steps: string[]) {
  return {
    title: data.title.trim(),
    description: data.description.trim() || undefined,
    category: data.category,
    prepTime: data.prepTime ? Number(data.prepTime) : undefined,
    cookTime: data.cookTime ? Number(data.cookTime) : undefined,
    servings: data.servings ? Number(data.servings) : undefined,
    difficulty: data.difficulty || undefined,
    ingredients,
    steps,
    coverImage: coverImage ?? undefined,
    videoUrl: data.videoUrl.trim() || undefined,
  };
}

function NumberField({
  id,
  label,
  error,
  ...props
}: React.ComponentPropsWithRef<"input"> & { id: string; label: string; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="label text-xs">
        {label}
      </label>
      <input
        id={id}
        type="number"
        className="input py-2.5 text-sm"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      <FieldError id={`${id}-error`} error={error ? { message: error } : undefined} />
    </div>
  );
}

function EditorSidebar() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RecipeFormData>();

  return (
    <aside className="lg:self-start">
      <div className="sticky top-36 space-y-5">
        <section className="card p-5">
          <h2 className="text-base font-medium">Details</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="recipe-category" className="label text-xs">
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
                    options={CATEGORIES.map((category) => ({ label: category, value: category }))}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="recipe-difficulty" className="label text-xs">
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
                      { label: "Not specified", value: "" },
                      ...DIFFICULTIES.map((difficulty) => ({ label: difficulty, value: difficulty })),
                    ]}
                  />
                )}
              />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-base font-medium">Time & servings</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <NumberField
              id="recipe-prep-time"
              label="Prep (min)"
              placeholder="15"
              min={MIN_PREP_MINUTES}
              max={MAX_PREP_MINUTES}
              error={errors.prepTime?.message}
              {...register("prepTime")}
            />
            <NumberField
              id="recipe-cook-time"
              label="Cook (min)"
              placeholder="30"
              min={MIN_COOK_MINUTES}
              max={MAX_COOK_MINUTES}
              error={errors.cookTime?.message}
              {...register("cookTime")}
            />
          </div>
          <div className="mt-3">
            <NumberField
              id="recipe-servings"
              label="Servings"
              placeholder="4"
              min={MIN_SERVINGS}
              max={MAX_SERVINGS}
              error={errors.servings?.message}
              {...register("servings")}
            />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-base font-medium">Video</h2>
          <div className="mt-4">
            <label htmlFor="recipe-video" className="label text-xs">
              Video URL
            </label>
            <input
              id="recipe-video"
              type="url"
              placeholder="YouTube or TikTok URL"
              className="input"
              aria-invalid={errors.videoUrl ? true : undefined}
              aria-describedby={errors.videoUrl ? "recipe-video-error" : undefined}
              {...register("videoUrl")}
            />
            <FieldError id="recipe-video-error" error={errors.videoUrl} />
          </div>
        </section>
      </div>
    </aside>
  );
}

function CoverUploader({
  coverImageUrl,
  uploading,
  uploadProgress,
  onInputChange,
}: {
  coverImageUrl: string;
  uploading: boolean;
  uploadProgress: number;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <div
        className={cn(
          "relative aspect-[21/9] overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
          coverImageUrl ? "border-transparent" : "border-line-strong bg-surface-2 hover:border-accent",
        )}
      >
        {coverImageUrl ? (
          <>
            <img src={coverImageUrl} alt="Recipe cover preview" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <label className="btn-secondary btn-sm absolute bottom-4 right-4 cursor-pointer border-transparent bg-surface/90 backdrop-blur-sm">
              Change image
              <input
                type="file"
                accept="image/*"
                onChange={onInputChange}
                className="hidden"
                aria-label="Change cover image"
              />
            </label>
          </>
        ) : (
          <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 text-muted transition-colors hover:text-accent">
            <PhotoIcon className="size-9" />
            <span className="text-sm font-medium">Add a cover photo</span>
            <span className="text-xs">1200 × 600 or wider</span>
            <input
              type="file"
              accept="image/*"
              onChange={onInputChange}
              className="hidden"
              aria-label="Upload cover image"
            />
          </label>
        )}
      </div>
      {uploading && <ProgressBar value={uploadProgress} label="Uploading" className="mt-3" />}
    </div>
  );
}

function missingForPublish(status: RecipeStatus | null, ingredients: string[], steps: string[]): string | null {
  if (status !== "published") return null;
  if (ingredients.length === 0) return "Add at least one ingredient";
  if (steps.length === 0) return "Add at least one step";
  return null;
}

function EditorHeader({
  isEditing,
  loading,
  lastSaved,
  onSaveDraft,
  onPublish,
}: {
  isEditing: boolean;
  loading: boolean;
  lastSaved: Date | null;
  onSaveDraft: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="sticky top-16 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="container-wide flex h-14 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/dashboard" className="icon-btn shrink-0" aria-label="Back to dashboard">
            <ArrowLeftIcon className="size-5" />
          </Link>
          <h1 className="truncate font-display text-lg font-medium">{isEditing ? "Edit recipe" : "New recipe"}</h1>
          {lastSaved && (
            <span className="hidden text-xs text-muted sm:inline">
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onSaveDraft} disabled={loading} className="btn-secondary btn-sm">
            Save draft
          </button>
          <button type="button" onClick={onPublish} disabled={loading} className="btn-primary btn-sm">
            {loading ? "Saving…" : isEditing ? "Update" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: the editor keeps form state, uploads, and autosave in one lifecycle
export function RecipeEditor({
  initialData,
  isEditing = false,
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
    status?: RecipeStatus;
    prepTime?: number | null;
    cookTime?: number | null;
    servings?: number | null;
    difficulty?: string | null;
  };
  isEditing?: boolean;
}) {
  const { toast } = useToast();
  const { isLoading: isAuthLoading } = useConvexAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [coverImage, setCoverImage] = useState<Id<"_storage"> | null>(initialData?.coverImage ?? null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");

  const pendingStatusRef = useRef<RecipeStatus | null>(null);
  const lastSavedPayloadRef = useRef<string | null>(null);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      category: CATEGORIES.find((category) => category === initialData?.category) ?? "General",
      difficulty: initialData?.difficulty ?? "",
      prepTime: initialData?.prepTime != null ? String(initialData.prepTime) : "",
      cookTime: initialData?.cookTime != null ? String(initialData.cookTime) : "",
      servings: initialData?.servings != null ? String(initialData.servings) : "",
      videoUrl: initialData?.videoUrl ?? "",
      ingredients: (initialData?.ingredients?.length ? initialData.ingredients : [""]).map((value) => ({ value })),
      steps: (initialData?.steps?.length ? initialData.steps : [""]).map((value) => ({ value })),
    },
  });

  const {
    register,
    control,
    handleSubmit: rhfHandleSubmit,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = form;

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: "ingredients" });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: "steps" });

  const watchedValues = useWatch<RecipeFormData>({ control });

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (isDirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const createRecipe = useMutation(api.recipes.create);
  const updateRecipe = useMutation(api.recipes.update);

  const {
    handleInputChange,
    uploading,
    progress: uploadProgress,
  } = useFileUpload(() => generateUploadUrl(), {
    onSuccess: (storageId, previewUrl) => {
      if (coverImageUrl.startsWith("blob:")) URL.revokeObjectURL(coverImageUrl);
      setCoverImage(storageId);
      setCoverImageUrl(previewUrl);
      toast("Image uploaded", "success");
    },
    onError: () => toast("Could not upload image", "error"),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: watchedValues is the timer re-arm signal
  useEffect(() => {
    if (!(isEditing && initialData?.id && isDirty)) return;
    const recipeId = initialData.id;
    const status = initialData.status ?? "draft";
    const timer = setTimeout(async () => {
      const formValues = getValues();
      const payload = {
        ...buildPayload(formValues, coverImage, values(formValues.ingredients), values(formValues.steps)),
        status,
      };
      const fingerprint = JSON.stringify(payload);
      if (fingerprint === lastSavedPayloadRef.current) return;
      try {
        await updateRecipe({ id: recipeId, ...payload });
        lastSavedPayloadRef.current = fingerprint;
        setLastSaved(new Date());
        reset({ ...formValues });
      } catch {
        toast("Autosave failed", "error");
      }
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [
    isEditing,
    initialData?.id,
    initialData?.status,
    isDirty,
    watchedValues,
    coverImage,
    updateRecipe,
    reset,
    getValues,
    toast,
  ]);

  useEffect(
    () => () => {
      if (coverImageUrl.startsWith("blob:")) URL.revokeObjectURL(coverImageUrl);
    },
    [coverImageUrl],
  );

  if (isAuthLoading) return <LoadingState />;

  const handleSubmit = async (data: RecipeFormData) => {
    const status = pendingStatusRef.current;
    if (!status) return;

    const validIngredients = values(data.ingredients).filter(Boolean);
    const validSteps = values(data.steps).filter(Boolean);
    const missing = missingForPublish(status, validIngredients, validSteps);
    if (missing) {
      toast(missing, "error");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...buildPayload(data, coverImage, validIngredients, validSteps), status };
      if (isEditing && initialData?.id) {
        await updateRecipe({ id: initialData.id, ...payload });
        toast("Recipe updated", "success");
      } else {
        await createRecipe(payload);
        toast("Recipe saved", "success");
      }
      void navigate({ to: "/dashboard" });
    } catch (error) {
      toast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
      pendingStatusRef.current = null;
    }
  };

  const triggerSubmit = (status: RecipeStatus) => {
    pendingStatusRef.current = status;
    void rhfHandleSubmit(handleSubmit)();
  };

  return (
    <FormProvider {...form}>
      <div className="min-h-[calc(100svh-4rem)]">
        <EditorHeader
          isEditing={isEditing}
          loading={loading}
          lastSaved={lastSaved}
          onSaveDraft={() => triggerSubmit("draft")}
          onPublish={() => triggerSubmit("published")}
        />

        <div className="container-wide py-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <CoverUploader
                coverImageUrl={coverImageUrl}
                uploading={uploading}
                uploadProgress={uploadProgress}
                onInputChange={handleInputChange}
              />

              <div>
                <input
                  id="recipe-title"
                  type="text"
                  className="w-full border-0 bg-transparent py-2 font-display text-3xl font-medium outline-none placeholder:text-muted/60 focus:ring-0 sm:text-4xl"
                  placeholder="Recipe title"
                  maxLength={200}
                  aria-label="Recipe title"
                  aria-invalid={errors.title ? true : undefined}
                  aria-describedby={errors.title ? "recipe-title-error" : undefined}
                  {...register("title")}
                />
                <FieldError id="recipe-title-error" error={errors.title} />
              </div>

              <div>
                <label htmlFor="recipe-description" className="sr-only">
                  Description
                </label>
                <textarea
                  id="recipe-description"
                  className="w-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed text-ink-soft outline-none placeholder:text-muted/70 focus:ring-0"
                  placeholder="A short intro — what inspired this dish, what makes it special…"
                  rows={3}
                  aria-invalid={errors.description ? true : undefined}
                  aria-describedby={errors.description ? "recipe-description-error" : undefined}
                  {...register("description")}
                />
                <FieldError id="recipe-description-error" error={errors.description} />
              </div>

              <section className="card p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">Ingredients</h2>
                  <span className="text-xs text-muted">
                    {ingredientFields.filter((_, index) => watchedValues.ingredients?.[index]?.value).length} items
                  </span>
                </div>
                <div className="mt-4 space-y-1">
                  {ingredientFields.map((field, index) => (
                    <div key={field.id} className="group flex items-center gap-2">
                      <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                      <input
                        type="text"
                        className="min-w-0 flex-1 rounded-md border-b border-transparent px-2 py-2.5 text-sm outline-none transition-colors hover:border-line focus:border-accent"
                        placeholder={index === 0 ? "e.g. 2 cups all-purpose flour" : "Add ingredient…"}
                        aria-label={`Ingredient ${index + 1}`}
                        {...register(`ingredients.${index}.value`)}
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="rounded-md p-1 text-muted opacity-0 transition hover:text-clay focus:opacity-100 group-hover:opacity-100"
                        aria-label={`Remove ingredient ${index + 1}`}
                      >
                        <XMarkIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => appendIngredient({ value: "" })}
                  className="link mt-4 inline-flex items-center gap-2 text-sm font-medium"
                >
                  <PlusIcon className="size-4" />
                  Add ingredient
                </button>
              </section>

              <section className="card p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">Instructions</h2>
                  <span className="text-xs text-muted">
                    {stepFields.filter((_, index) => watchedValues.steps?.[index]?.value).length} steps
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  {stepFields.map((field, index) => (
                    <div key={field.id} className="group flex gap-3 sm:gap-4">
                      <div className="flex flex-col items-center">
                        <span className="step-number text-sm">{index + 1}</span>
                        {index < stepFields.length - 1 && <div className="step-line mt-2" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <label htmlFor={`step-${field.id}`} className="sr-only">
                          Step {index + 1}
                        </label>
                        <textarea
                          id={`step-${field.id}`}
                          className="textarea min-h-20 text-sm"
                          placeholder="Describe this step…"
                          {...register(`steps.${index}.value`)}
                        />
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="mt-1 text-xs text-muted opacity-0 transition hover:text-clay focus:opacity-100 group-hover:opacity-100"
                          aria-label={`Remove step ${index + 1}`}
                        >
                          Remove step
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => appendStep({ value: "" })}
                  className="link mt-4 inline-flex items-center gap-2 text-sm font-medium"
                >
                  <PlusIcon className="size-4" />
                  Add step
                </button>
              </section>
            </div>

            <EditorSidebar />
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
