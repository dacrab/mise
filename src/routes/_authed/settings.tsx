import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { UserCircleIcon, EnvelopeIcon, CalendarIcon, CameraIcon } from "@heroicons/react/24/outline";

export const Route = createFileRoute("/_authed/settings")({
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
  const [hasChanges, setHasChanges] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<Id<"_storage"> | null>(null);

  const userName = user?.name;
  const userUsername = user?.username;
  const userBio = user?.bio;

  useEffect(() => {
    if (userName !== undefined) setName(userName || "");
    if (userUsername !== undefined) setUsername(userUsername || "");
    if (userBio !== undefined) setBio(userBio || "");
  }, [userName, userUsername, userBio]);

  useEffect(() => {
    if (userName !== undefined || userUsername !== undefined || userBio !== undefined) {
      setHasChanges(
        name !== (userName || "") ||
        username !== (userUsername || "") ||
        bio !== (userBio || "") ||
        newProfileImage !== null
      );
    }
  }, [name, username, bio, userName, userUsername, userBio, newProfileImage]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!user) {
    return <div className="flex items-center justify-center min-h-[60vh] text-stone animate-pulse">Loading...</div>;
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

    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      
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
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        profileImage: newProfileImage || undefined,
      });
      setNewProfileImage(null);
      toast("Settings saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const displayImage = previewUrl || user.profileImageUrl || user.image;

  return (
    <div className="wrapper py-8 md:py-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <p className="font-hand text-xl text-sage mb-1">preferences</p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium">Settings</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Section */}
          <section className="card p-6">
            <h2 className="font-serif text-lg font-medium mb-6 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-sage" />
              Profile
            </h2>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-cream-dark">
              <div className="relative group">
                {displayImage ? (
                  <img src={displayImage} alt="" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-sage/20 flex items-center justify-center text-sage text-3xl font-medium">
                    {name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <CameraIcon className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-medium text-charcoal">{name || "Anonymous"}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-sm text-sage hover:text-sage-dark"
                >
                  {uploading ? "Uploading..." : "Change photo"}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charcoal-light mb-2">Display name</label>
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
                <label htmlFor="username" className="block text-sm font-medium text-charcoal-light mb-2">Username</label>
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
                <label htmlFor="bio" className="block text-sm font-medium text-charcoal-light mb-2">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="textarea-field"
                  rows={3}
                  placeholder="A few words about yourself..."
                  maxLength={160}
                />
                <p className="text-xs text-stone mt-1.5 text-right">{bio.length}/160</p>
              </div>
            </div>
          </section>

          {/* Account Info */}
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
                  <CalendarIcon className="w-4 h-4" />
                  Member since
                </dt>
                <dd className="text-charcoal">{new Date(user._creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</dd>
              </div>
            </dl>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
