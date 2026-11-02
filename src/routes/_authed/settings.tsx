import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  CameraIcon,
  EnvelopeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { LoadingState, ProgressBar } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useSignOut } from "@/hooks/useSignOut";
import { THEME_OPTIONS, type ThemePreference, useTheme } from "@/hooks/useTheme";
import { useBookmarks } from "@/lib/bookmarks";
import { pageHead } from "@/lib/route";
import { cn, formatDate, getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authed/settings")({
  head: () => pageHead("Settings", "Update your profile, appearance, and account.", "/settings"),
  component: SettingsPage,
});

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: this page coordinates profile editing, uploads, and account lifecycle together
function SettingsPage() {
  const user = useQuery(api.users.currentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const deleteAccount = useAction(api.users.deleteAccount);
  const myRecipes = useQuery(api.recipes.myRecipes);
  const { bookmarks } = useBookmarks();
  const { toast } = useToast();
  const signOut = useSignOut();
  const { preference, setTheme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const initializedUserIdRef = useRef<string | undefined>(undefined);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<Id<"_storage"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    handleInputChange,
    uploading,
    progress: uploadProgress,
  } = useFileUpload(() => generateUploadUrl(), {
    onSuccess: (storageId, preview) => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = preview;
      setPreviewUrl(preview);
      setNewProfileImage(storageId);
      toast("Photo uploaded", "success");
    },
    onError: () => toast("Could not upload image", "error"),
  });

  useEffect(() => {
    if (user && user._id !== initializedUserIdRef.current) {
      initializedUserIdRef.current = user._id;
      setName(user.name ?? "");
      setUsername(user.username ?? "");
      setBio(user.bio ?? "");
    }
  }, [user]);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  if (!user) return <LoadingState />;

  const hasChanges =
    name !== (user.name ?? "") ||
    username !== (user.username ?? "") ||
    bio !== (user.bio ?? "") ||
    newProfileImage !== null;

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: validation branches are clearer inline than split across helpers
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasChanges || saving) return;

    if (!name.trim()) {
      toast("Name cannot be empty", "error");
      return;
    }
    if (username.trim() && !/^[a-z0-9_]{3,32}$/.test(username.trim())) {
      toast("Username must be 3–32 characters: lowercase letters, numbers, underscores", "error");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        profileImage: newProfileImage ?? undefined,
      });
      setNewProfileImage(null);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setPreviewUrl(null);
      toast("Profile saved", "success");
    } catch (error) {
      toast(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (error) {
      toast(getErrorMessage(error), "error");
      setDeleting(false);
      return;
    }
    toast("Your account has been deleted", "success");
    await signOut("/");
    window.location.replace("/");
  };

  const avatar = previewUrl ?? user?.profileImageUrl;

  return (
    <div className="container-page py-10 md:py-14">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-2 text-4xl font-medium sm:text-5xl">Settings</h1>
        </div>
        <button type="submit" form="settings-form" disabled={saving || !hasChanges} className="btn-primary shrink-0">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
          <section className="card p-6">
            <div className="flex flex-wrap items-center gap-5">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-surface-2">
                {avatar ? (
                  <img src={avatar} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-2xl font-medium text-accent">
                    {(name || "?")[0]}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-xs font-semibold text-white">
                    {uploadProgress}%
                  </div>
                )}
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 text-white opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100">
                  <CameraIcon className="size-5" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    aria-label="Upload profile photo"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-lg font-medium">Profile photo</h2>
                <p className="mt-1 text-sm text-muted">A square image works best. Up to 5 MB.</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="link mt-2 text-sm font-medium"
                >
                  {uploading ? "Uploading…" : "Change photo"}
                </button>
                {uploading && <ProgressBar value={uploadProgress} className="mt-2 w-44" />}
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              <div>
                <label htmlFor="name" className="label">
                  Display name
                </label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  value={name}
                  maxLength={80}
                  placeholder="Your name"
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                    @
                  </span>
                  <input
                    id="username"
                    type="text"
                    className="input pl-8"
                    value={username}
                    placeholder="username"
                    disabled={Boolean(user.username)}
                    onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  />
                </div>
                <p className="hint">
                  {user.username
                    ? "Usernames are permanent."
                    : "3–32 characters: lowercase letters, numbers, underscores. This becomes your public profile URL."}
                </p>
              </div>

              <div>
                <label htmlFor="bio" className="label">
                  Bio
                </label>
                <textarea
                  id="bio"
                  className="textarea"
                  value={bio}
                  placeholder="A few words about yourself…"
                  maxLength={160}
                  rows={3}
                  onChange={(event) => setBio(event.target.value)}
                />
                <p className="hint text-right tabular-nums">{bio.length}/160</p>
              </div>
            </div>
          </section>

          <AppearanceSection preference={preference} setTheme={setTheme} />

          <DangerZone onSignOut={() => void signOut()} onDeleteAccount={() => setDeleteOpen(true)} />
        </form>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-6">
            <h2 className="eyebrow">Account</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="mb-1 flex items-center gap-1.5 text-xs text-muted">
                  <EnvelopeIcon className="size-3.5" /> Email
                </dt>
                <dd className="truncate font-medium text-ink">{user.email ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="mb-1 flex items-center gap-1.5 text-xs text-muted">
                  <CalendarIcon className="size-3.5" /> Joined
                </dt>
                <dd className="font-medium text-ink">{formatDate(user._creationTime)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="eyebrow">Your kitchen</h2>
            <KitchenStats recipeCount={myRecipes?.length ?? 0} savedCount={bookmarks?.length ?? 0} />
          </section>
        </aside>
      </div>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        deleting={deleting}
        onConfirm={() => void handleDeleteAccount()}
      />
    </div>
  );
}

function KitchenStats({ recipeCount, savedCount }: { recipeCount: number; savedCount: number }) {
  const stats = [
    { label: "Recipes", value: recipeCount },
    { label: "Saved", value: savedCount },
  ];

  return (
    <dl className="mt-4 grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dd className="font-display text-2xl font-medium text-ink">{stat.value}</dd>
          <dt className="text-xs text-muted">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}

function AppearanceSection({
  preference,
  setTheme,
}: {
  preference: ThemePreference;
  setTheme: (preference: ThemePreference) => void;
}) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-medium">Appearance</h2>
      <p className="mt-1 text-sm text-muted">Choose how Mise looks to you.</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = preference === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-colors",
                active
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              <Icon className="size-5" />
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DangerZone({ onSignOut, onDeleteAccount }: { onSignOut: () => void; onDeleteAccount: () => void }) {
  return (
    <section className="card border-clay/25 p-6">
      <h2 className="text-lg font-medium text-clay">Danger zone</h2>
      <p className="mt-1 text-sm text-muted">Sign out of this device or permanently delete your account.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onSignOut} className="btn-secondary btn-sm justify-center">
          <ArrowRightOnRectangleIcon className="size-4" />
          Sign out
        </button>
        <button
          type="button"
          onClick={onDeleteAccount}
          className="btn btn-sm justify-center border border-clay/30 text-clay hover:bg-clay-soft"
        >
          <TrashIcon className="size-4" />
          Delete account
        </button>
      </div>
    </section>
  );
}

function DeleteAccountDialog({
  open,
  onOpenChange,
  deleting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleting: boolean;
  onConfirm: () => void;
}) {
  const [confirmation, setConfirmation] = useState("");
  const confirmed = confirmation.trim().toUpperCase() === "DELETE";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (deleting) return;
        if (!next) setConfirmation("");
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[100] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-lift outline-none transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
          <Dialog.Title className="text-2xl font-medium text-ink">Delete account</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-ink-soft">
            This permanently deletes your profile, recipes, and saved bookmarks. It cannot be undone.
          </Dialog.Description>
          <label htmlFor="delete-confirm" className="label mt-6">
            Type <span className="font-mono font-semibold text-clay">DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm"
            type="text"
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={deleting}
            className="input"
          />
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close disabled={deleting} className="btn-secondary btn-sm">
              Cancel
            </Dialog.Close>
            <button type="button" onClick={onConfirm} disabled={!confirmed || deleting} className="btn-danger btn-sm">
              {deleting ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
