import {
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  CameraIcon,
  ComputerDesktopIcon,
  EnvelopeIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "@/components/ui/Primitives";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useSignOut } from "@/hooks/useSignOut";
import { type ThemePreference, useTheme } from "@/hooks/useTheme";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({
    meta: [
      { title: `Settings${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Update your profile, username, bio, and profile image." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const user = useQuery(api.users.currentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
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
    if (username.trim() && !/^[a-z0-9_]+$/.test(username.trim())) {
      toast("Username can only contain letters, numbers, and underscores", "error");
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
    return <div className="center min-h-[60vh] text-stone animate-pulse">Loading…</div>;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const avatar = previewUrl ?? user.profileImageUrl ?? user.image;

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

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* Left column */}
            <div className="space-y-10">
              <section className="space-y-6">
                <h2 className="font-serif text-xl font-medium">Profile</h2>
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

              <DangerZone
                onSignOut={() => void handleSignOut()}
                onDeleteAccount={() => toast("Account deletion is not yet available", "error")}
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
                <section className="rounded-xl surface-muted p-6 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone">Account</h3>
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
                </section>

                <section className="rounded-xl surface-muted p-6 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone">Your kitchen</h3>
                  <QuickStats />
                </section>

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
      <div className="max-w-5xl mx-auto flex items-center gap-6">
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
      <h2 className="font-serif text-xl font-medium">Appearance</h2>
      <p className="text-sm text-stone">Choose how Mise looks to you.</p>
      <div className="grid grid-cols-3 gap-3">
        <ThemeOption icon={SunIcon} label="Light" active={preference === "light"} onClick={() => setTheme("light")} />
        <ThemeOption icon={MoonIcon} label="Dark" active={preference === "dark"} onClick={() => setTheme("dark")} />
        <ThemeOption
          icon={ComputerDesktopIcon}
          label="System"
          active={preference === "system"}
          onClick={() => setTheme("system")}
        />
      </div>
    </section>
  );
}

function DangerZone({ onSignOut, onDeleteAccount }: { onSignOut: () => void; onDeleteAccount: () => void }) {
  return (
    <section className="space-y-4 pt-6 border-t border-subtle">
      <h2 className="font-serif text-xl font-medium text-terracotta">Danger zone</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-field text-sm text-secondary hover:bg-cream-dark transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sign out
        </button>
        <button
          type="button"
          onClick={onDeleteAccount}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-terracotta/30 text-sm text-terracotta hover:bg-terracotta/5 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Delete account
        </button>
      </div>
    </section>
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
