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
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useSignOut } from "@/hooks/useSignOut";
import { THEME_OPTIONS, type ThemePreference, useTheme } from "@/hooks/useTheme";
import { pageHead } from "@/lib/head";
import { avatarSource, getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authed/settings")({
  head: () => pageHead("Settings", "Update your profile, username, bio, and profile image."),
  component: Settings,
});

function Settings() {
  const user = useQuery(api.users.currentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const deleteAccount = useAction(api.users.deleteAccount);
  const { toast } = useToast();
  const signOut = useSignOut();
  const { preference, setTheme } = useTheme();
  const {
    handleInputChange,
    uploading,
    progress: uploadProgress,
  } = useFileUpload(() => generateUploadUrl(), {
    onSuccess: (storageId, preview) => {
      setNewProfileImage(storageId);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = preview;
      setPreviewUrl(preview);
      toast("Photo uploaded!", "success");
    },
    onError: () => toast("Could not upload image", "error"),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<Id<"_storage"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const userIdRef = useRef<string | undefined>(undefined);
  // Populate the form once per user so query refetches don't clobber in-progress edits
  useEffect(() => {
    if (user && user._id !== userIdRef.current) {
      userIdRef.current = user._id;
      setName(user.name ?? "");
      setUsername(user.username ?? "");
      setBio(user.bio ?? "");
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const hasChanges =
    !!user &&
    (name !== (user.name ?? "") ||
      username !== (user.username ?? "") ||
      bio !== (user.bio ?? "") ||
      newProfileImage !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || saving) return;
    if (!name.trim()) {
      toast("Name cannot be empty", "error");
      return;
    }
    if (username.trim() && !/^[a-z0-9_]{3,32}$/.test(username.trim())) {
      toast("Username must be 3-32 characters: letters, numbers, and underscores", "error");
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
      toast("Profile saved", "success");
    } catch {
      toast("Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <LoadingState />;
  }

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      toast(getErrorMessage(err), "error");
      setDeleting(false);
      return;
    }
    toast("Your account has been deleted", "success");
    await signOut("/");
    // signOut navigates on success; if the session was already invalidated by
    // the deletion, force a hard redirect so the user is not left signed in.
    window.location.replace("/");
  };

  const avatar = previewUrl ?? avatarSource(user);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <ProfileHero
        avatar={avatar}
        name={name}
        username={username}
        uploading={uploading}
        uploadProgress={uploadProgress}
        fileInputRef={fileInputRef}
        onInputChange={handleInputChange}
      />

      <div className="wrapper-narrow py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* Left column */}
            <div className="space-y-10">
              <section className="space-y-6">
                <h2 className="section-title">Profile</h2>
                <TextField
                  id="name"
                  label="Display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                <TextField
                  id="username"
                  label="Username"
                  prefix="@"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="username"
                  disabled={!!user.username}
                  hint={
                    user.username
                      ? "Usernames are permanent and cannot be changed."
                      : "Letters, numbers, and underscores only. This is your public profile URL."
                  }
                />
                <TextArea
                  id="bio"
                  label="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A few words about yourself…"
                  maxLength={160}
                  rows={4}
                />
              </section>

              <AppearanceSection preference={preference} setTheme={setTheme} />

              <DangerZone onSignOut={() => void signOut()} onDeleteAccount={() => setDeleteOpen(true)} />

              <DeleteAccountDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                deleting={deleting}
                onConfirm={() => void handleDeleteAccount()}
              />

              {/* Save — mobile */}
              <div className="lg:hidden flex justify-end pt-4">
                <button type="submit" disabled={saving || !hasChanges} className="btn-primary disabled:opacity-50">
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>

            {/* Right column — sidebar */}
            <aside className="lg:self-start">
              <div className="sticky top-24 space-y-6">
                <SidebarSection title="Account">
                  <dl className="space-y-4 text-sm">
                    <div>
                      <dt className="text-xs text-stone mb-1 flex items-center gap-1.5">
                        <EnvelopeIcon className="w-3.5 h-3.5" /> Email
                      </dt>
                      <dd className="text-primary font-medium truncate">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone mb-1 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" /> Joined
                      </dt>
                      <dd className="text-primary">
                        {new Date(user._creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </dd>
                    </div>
                  </dl>
                </SidebarSection>

                <SidebarSection title="Your kitchen">
                  <QuickStats />
                </SidebarSection>

                {/* Save — desktop */}
                <div className="hidden lg:block">
                  <button
                    type="submit"
                    disabled={saving || !hasChanges}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  {hasChanges && <p className="text-xs text-sage text-center mt-2">You have unsaved changes</p>}
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl surface-muted p-6 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone">{title}</h3>
      {children}
    </section>
  );
}

function ProfileHero({
  avatar,
  name,
  username,
  uploading,
  uploadProgress,
  fileInputRef,
  onInputChange,
}: {
  avatar: string | null | undefined;
  name: string;
  username: string;
  uploading: boolean;
  uploadProgress: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="hero-banner py-12 px-5 sm:px-8">
      <div className="wrapper-narrow flex items-center gap-6">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden surface-raised shrink-0 ring-4 ring-cream/20">
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="center w-full h-full text-3xl font-medium text-sage surface-raised">{(name || "?")[0]}</div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{uploadProgress}%</span>
            </div>
          )}
          <label className="absolute inset-0 bg-charcoal/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <CameraIcon className="w-6 h-6 text-white" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onInputChange}
              className="hidden"
              aria-label="Upload profile photo"
            />
          </label>
        </div>
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-cream">{name || "Chef"}</h1>
          {username && <p className="text-sage-light text-sm mt-1">@{username}</p>}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-cream/70 hover:text-cream transition-colors mt-2"
          >
            {uploading ? "Uploading…" : "Change photo"}
          </button>
          {uploading && <ProgressBar value={uploadProgress} className="mt-2" />}
        </div>
      </div>
    </div>
  );
}

function AppearanceSection({
  preference,
  setTheme,
}: {
  preference: ThemePreference;
  setTheme: (pref: ThemePreference) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="section-title">Appearance</h2>
      <p className="text-sm text-stone">Choose how Mise looks to you.</p>
      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map(({ value, label, icon }) => (
          <ThemeOption
            key={value}
            icon={icon}
            label={label}
            active={preference === value}
            onClick={() => setTheme(value)}
          />
        ))}
      </div>
    </section>
  );
}

function DangerZone({ onSignOut, onDeleteAccount }: { onSignOut: () => void; onDeleteAccount: () => void }) {
  return (
    <section className="space-y-4 pt-6 border-t border-subtle">
      <h2 className="section-title text-terracotta">Danger zone</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <DangerButton icon={ArrowRightOnRectangleIcon} onClick={onSignOut}>
          Sign out
        </DangerButton>
        <DangerButton icon={TrashIcon} onClick={onDeleteAccount} danger>
          Delete account
        </DangerButton>
      </div>
    </section>
  );
}

function DangerButton({
  icon: Icon,
  children,
  onClick,
  danger = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
        danger
          ? "border-terracotta/30 text-terracotta hover:bg-terracotta/5"
          : "border-field text-secondary hover:bg-cream-dark dark:hover:bg-d-surface-raised"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
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
        <Dialog.Backdrop className="fixed inset-0 z-[90] bg-charcoal/40 backdrop-blur-sm transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[100] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cream-dark bg-warm-white p-6 shadow-hover outline-none transition-opacity duration-200 dark:border-d-border dark:bg-d-surface data-[starting-style]:opacity-0 data-[ending-style]:opacity-0">
          <Dialog.Title className="section-title text-primary">Delete account</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-stone">
            This permanently deletes your account and cannot be undone. It removes:
          </Dialog.Description>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-secondary">
            <li>Your profile and sign-in</li>
            <li>All recipes you've published or drafted</li>
            <li>Your saved bookmarks</li>
          </ul>
          <label htmlFor="delete-confirm" className="label mt-6">
            Type <span className="font-mono font-semibold text-terracotta">DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm"
            type="text"
            autoComplete="off"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={deleting}
            className="input-field"
          />
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close disabled={deleting} className="btn-secondary">
              Cancel
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!confirmed || deleting}
              className="btn rounded-lg bg-terracotta px-5 py-2.5 text-white hover:bg-terracotta/90"
            >
              {deleting ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ThemeOption({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
        active
          ? "border-sage bg-sage/5 dark:bg-sage/10"
          : "border-stone-light/40 hover:border-stone-light dark:border-d-border-strong dark:hover:border-d-border-hover"
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? "text-sage" : "text-stone"}`} />
      <span className={`text-xs font-medium ${active ? "text-sage" : "text-stone"}`}>{label}</span>
    </button>
  );
}

function QuickStats() {
  const recipes = useQuery(api.recipes.myRecipes);
  const bookmarks = useQuery(api.recipes.myBookmarks);

  const published = recipes?.filter((r) => r.status === "published").length ?? 0;
  const drafts = recipes?.filter((r) => r.status === "draft").length ?? 0;
  const saved = bookmarks?.length ?? 0;

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div>
        <p className="text-lg font-semibold text-primary">{published}</p>
        <p className="text-[11px] text-stone">Published</p>
      </div>
      <div>
        <p className="text-lg font-semibold text-primary">{drafts}</p>
        <p className="text-[11px] text-stone">Drafts</p>
      </div>
      <div>
        <p className="text-lg font-semibold text-primary">{saved}</p>
        <p className="text-[11px] text-stone">Saved</p>
      </div>
    </div>
  );
}
