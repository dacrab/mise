import { CalendarIcon, CameraIcon, EnvelopeIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useFileUpload } from "@/hooks/useFileUpload";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "Settings | Mise" }] }),
  component: Settings,
});

function Settings() {
  const user = useQuery(api.users.currentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const {
    upload,
    uploading,
    progress: uploadProgress,
  } = useFileUpload(() => generateUploadUrl(), {
    onSuccess: (storageId, preview) => {
      setNewProfileImage(storageId as Id<"_storage">);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(preview);
      toast("Photo uploaded!", "success");
    },
    onError: () => toast("Could not upload image", "error"),
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<Id<"_storage"> | null>(null);

  // Seed form once — ref guard prevents overwriting user edits on re-render.
  // Depend on stable primitives to satisfy @tanstack/query/no-unstable-deps.
  const seeded = useRef(false);
  const userName = user?.name;
  const userUsername = user?.username;
  const userBio = user?.bio;

  useEffect(() => {
    if (userName !== undefined && !seeded.current) {
      seeded.current = true;
      setName(userName ?? "");
      setUsername(userUsername ?? "");
      setBio(userBio ?? "");
    }
  }, [userName, userUsername, userBio]);

  // Revoke preview object URL on unmount
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const hasChanges =
    !!user &&
    (name !== (userName ?? "") ||
      username !== (userUsername ?? "") ||
      bio !== (userBio ?? "") ||
      newProfileImage !== null);

  const { execute: handleSubmit, isPending: saving } = useAsyncAction(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!hasChanges) return;
      if (!name.trim()) { toast("Name cannot be empty", "error"); return; }
      if (username.trim() && !/^[a-z0-9_]+$/.test(username.trim())) {
        toast("Username can only contain letters, numbers, and underscores", "error");
        return;
      }
      await updateProfile({
        name: name.trim(),
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        profileImage: newProfileImage ?? undefined,
      });
      setNewProfileImage(null);
      toast("Profile saved", "success");
    },
    { errorMessage: "Could not save profile" }
  );

  if (!user) {
    return <div className="flex items-center justify-center min-h-[60vh] text-stone animate-pulse">Loading…</div>;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be under 5MB", "error");
      return;
    }
    await upload(file);
  };

  const avatar = previewUrl ?? user.profileImageUrl ?? user.image;

  return (
    <div className="wrapper max-w-2xl py-8 md:py-12">
      <h1 className="font-serif text-3xl font-medium mb-8">Settings</h1>

      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
        <section className="card p-6">
          <h2 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-sage" />
            Profile
          </h2>
          <div className="flex items-center gap-5 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-cream-dark shrink-0 group/avatar">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-sage">
                  {(name || "?")[0]}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
                  <svg className="w-10 h-10" viewBox="0 0 36 36" aria-hidden="true">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 15}`}
                      strokeDashoffset={`${2 * Math.PI * 15 * (1 - uploadProgress / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                      className="transition-[stroke-dashoffset] duration-200"
                    />
                  </svg>
                  <span className="absolute text-white text-[11px] font-bold">{uploadProgress}%</span>
                </div>
              )}
              <label className="absolute inset-0 bg-charcoal/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <CameraIcon className="w-5 h-5 text-white" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload profile photo"
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-charcoal">{name || "Chef"}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm text-sage hover:text-sage-dark transition-colors"
              >
                {uploading ? `Uploading… ${uploadProgress}%` : "Change photo"}
              </button>
              {uploading && <ProgressBar value={uploadProgress} label="Uploading" className="mt-2 w-36" />}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-charcoal-light mb-2">
                Display name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-charcoal-light mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone">@</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="input-field pl-8"
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-stone mt-1.5">Letters, numbers, and underscores only</p>
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-charcoal-light mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="textarea-field"
                rows={3}
                placeholder="A few words about yourself…"
                maxLength={160}
              />
              <p className="text-xs text-stone mt-1.5 text-right">{bio.length}/160</p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
            <EnvelopeIcon className="w-5 h-5 text-sage" />
            Account
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-cream-dark">
              <dt className="text-stone">Email</dt>
              <dd className="text-charcoal">{user.email}</dd>
            </div>
            <div className="flex justify-between py-2 items-center">
              <dt className="text-stone flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" /> Member since
              </dt>
              <dd className="text-charcoal">
                {new Date(user._creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </dd>
            </div>
          </dl>
        </section>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
