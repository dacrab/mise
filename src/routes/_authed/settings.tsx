import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { UserCircleIcon, EnvelopeIcon, CalendarIcon, CameraIcon } from "@heroicons/react/24/outline";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "Settings | Mise" }] }),
  component: Settings,
});

function Settings() {
  const user = useQuery(api.users.currentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const hasChanges =
    !!user &&
    (name !== (userName ?? "") ||
      username !== (userUsername ?? "") ||
      bio !== (userBio ?? "") ||
      newProfileImage !== null);

  if (!user) {
    return <div className="flex items-center justify-center min-h-[60vh] text-stone animate-pulse">Loading…</div>;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Please select an image file", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("Image must be under 5MB", "error"); return; }

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const { storageId } = await (await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file })).json();
      setNewProfileImage(storageId);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      toast("Image uploaded", "success");
    } catch {
      toast("Could not upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    const trimName = name.trim();
    const trimUsername = username.trim();
    if (!trimName) { toast("Name cannot be empty", "error"); return; }
    if (trimUsername && !/^[a-z0-9_]+$/.test(trimUsername)) { toast("Username can only contain letters, numbers, and underscores", "error"); return; }

    setSaving(true);
    try {
      await updateProfile({ name: trimName, username: trimUsername || undefined, bio: bio.trim() || undefined, profileImage: newProfileImage ?? undefined });
      setNewProfileImage(null);
      toast("Profile saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const avatar = previewUrl ?? user.profileImageUrl ?? user.image;

  return (
    <div className="wrapper max-w-2xl py-8 md:py-12">
      <h1 className="font-serif text-3xl font-medium mb-8">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <section className="card p-6">
          <h2 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-sage" />
            Profile
          </h2>
          <div className="flex items-center gap-5 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-cream-dark shrink-0">
              {avatar
                ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-sage">{(name || "?")[0]}</div>
              }
              <label className="absolute inset-0 bg-charcoal/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <CameraIcon className="w-5 h-5 text-white" />
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" aria-label="Upload profile photo" />
              </label>
            </div>
            <div>
              <p className="font-medium text-charcoal">{name || "Anonymous"}</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm text-sage hover:text-sage-dark">
                {uploading ? "Uploading…" : "Change photo"}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-charcoal-light mb-2">Display name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-charcoal-light mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone">@</span>
                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} className="input-field pl-8" placeholder="username" />
              </div>
              <p className="text-xs text-stone mt-1.5">Letters, numbers, and underscores only</p>
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-charcoal-light mb-2">Bio</label>
              <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="textarea-field" rows={3} placeholder="A few words about yourself…" maxLength={160} />
              <p className="text-xs text-stone mt-1.5 text-right">{bio.length}/160</p>
            </div>
          </div>
        </section>

        {/* Account info */}
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
              <dt className="text-stone flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> Member since</dt>
              <dd className="text-charcoal">{new Date(user._creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</dd>
            </div>
          </dl>
        </section>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving || !hasChanges} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
