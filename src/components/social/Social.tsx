import { useRouter } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useRef, useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { BookmarkIcon, HeartIcon, StarIcon, BellIcon, CheckIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
  BellAlertIcon,
} from "@heroicons/react/24/solid";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Avatar, Spinner } from "@/components/ui/primitives";

// ============================================================================
// Types and Helpers
// ============================================================================

type AsyncFunction = (...args: never[]) => Promise<unknown>;

type Notification = {
  _id: Id<"notifications">;
  _creationTime: number;
  type: "like" | "comment" | "follow" | "fork";
  read: boolean;
  actor: { name?: string | null; image?: string | null; username?: string | null } | null;
  recipe: { title: string; slug: string } | null;
};

type Comment = {
  _id: Id<"comments">;
  _creationTime: number;
  userId: string;
  content: string;
  user: { name?: string | null; image?: string | null } | null;
};

// ============================================================================
// Internal Hooks and Utilities
// ============================================================================

function useAsyncAction<T extends AsyncFunction>(
  action: T,
  options?: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  // Keep latest action + options in a ref so the execute callback never
  // needs to be recreated when they change, avoiding infinite re-render loops
  // that would occur if `action` (a new function reference each render) were
  // listed as a dependency of useCallback.
  const actionRef = useRef(action);
  actionRef.current = action;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      if (isPending) return undefined;
      setIsPending(true);
      try {
        const result = await (actionRef.current as (...args: Parameters<T>) => Promise<unknown>)(...args);
        const opts = optionsRef.current;
        if (opts?.successMessage) toast(opts.successMessage, "success");
        opts?.onSuccess?.(result as Awaited<ReturnType<T>>);
        return result as Awaited<ReturnType<T>>;
      } catch (e) {
        const error = e instanceof Error ? e : new Error("An error occurred");
        const opts = optionsRef.current;
        toast(opts?.errorMessage || error.message, "error");
        opts?.onError?.(error);
        return undefined;
      } finally {
        setIsPending(false);
      }
    },
    [isPending, toast] // intentionally omit action/options — they live in refs
  );

  return { execute, isPending };
}

interface ActionButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isPending?: boolean;
  activeClass?: string;
  inactiveClass?: string;
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
}

function ActionButton({
  onClick,
  isActive = false,
  isPending = false,
  activeClass = "bg-sage/10 border-sage/30 text-sage",
  inactiveClass = "bg-warm-white border-cream-dark text-charcoal-light hover:border-sage/30 hover:text-sage",
  children,
  ariaLabel,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isPending}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isActive ? activeClass : inactiveClass} ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

// Simple fork/branch SVG icon (no heroicons equivalent)
function ForkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M6 8v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8" />
      <line x1="12" y1="14" x2="12" y2="16" />
    </svg>
  );
}

function notificationMessage(n: Notification): string {
  const actor = n.actor?.name ?? "Someone";
  switch (n.type) {
    case "like":
      return `${actor} liked your recipe${n.recipe ? ` "${n.recipe.title}"` : ""}`;
    case "comment":
      return `${actor} commented on${n.recipe ? ` "${n.recipe.title}"` : " your recipe"}`;
    case "follow":
      return `${actor} started following you`;
    case "fork":
      return `${actor} forked your recipe${n.recipe ? ` "${n.recipe.title}"` : ""}`;
    default:
      return `${actor} interacted with your content`;
  }
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString();
}

function CommentItem({ comment, currentUserId }: { comment: Comment; currentUserId?: string | null }) {
  const updateComment = useMutation(api.social.updateComment);
  const deleteComment = useMutation(api.social.deleteComment);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const isOwner = !!currentUserId && currentUserId === comment.userId;

  const handleEdit = () => {
    setEditText(comment.content);
    setEditing(true);
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditText(comment.content);
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === comment.content) {
      handleCancelEdit();
      return;
    }
    setPending(true);
    try {
      await updateComment({ id: comment._id, content: trimmed });
      setEditing(false);
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setPending(true);
    try {
      await deleteComment({ id: comment._id });
    } finally {
      setPending(false);
    }
  };

  const authorName = comment.user?.name ?? "Chef";
  const authorImage = comment.user?.image;

  return (
    <div className="flex gap-3">
      <Avatar src={authorImage} name={authorName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-medium text-charcoal">{authorName}</span>
          <span className="text-xs text-stone">{new Date(comment._creationTime).toLocaleDateString()}</span>
        </div>

        {editing ? (
          <div className="mt-1">
            <label htmlFor={`edit-comment-${comment._id}`} className="sr-only">
              Edit comment
            </label>
            <textarea
              id={`edit-comment-${comment._id}`}
              ref={editRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              rows={2}
              className="input-field w-full text-sm resize-none"
              disabled={pending}
            />
            <div className="flex gap-2 mt-1.5">
              <button
                onClick={() => void handleSaveEdit()}
                disabled={pending || !editText.trim()}
                className="flex items-center gap-1 text-xs btn-sage px-2 py-1 disabled:opacity-50"
              >
                <CheckIcon className="w-3.5 h-3.5" /> Save
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={pending}
                className="flex items-center gap-1 text-xs btn-ghost px-2 py-1"
              >
                <XMarkIcon className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-charcoal-light mt-0.5 break-words">{comment.content}</p>
        )}

        {isOwner && !editing && (
          <div className="flex gap-3 mt-1.5">
            <button
              onClick={handleEdit}
              disabled={pending}
              className="flex items-center gap-1 text-xs text-stone hover:text-sage transition-colors"
            >
              <PencilIcon className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => void handleDelete()}
              disabled={pending}
              className={`flex items-center gap-1 text-xs transition-colors ${confirmDelete ? "text-terracotta font-medium" : "text-stone hover:text-terracotta"}`}
            >
              <TrashIcon className="w-3 h-3" />
              {confirmDelete ? "Confirm delete?" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Exported Components
// ============================================================================

export function FollowButton({ userId }: { userId: Id<"users"> }) {
  const isFollowing = useQuery(api.social.isFollowing, { userId });
  const toggle = useMutation(api.social.toggleFollow);
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setPending(true);
    try {
      await toggle({ userId });
    } catch {
      toast("Could not update follow", "error");
    } finally {
      setPending(false);
    }
  };

  if (isFollowing === undefined) {
    return <div className="h-9 w-24 rounded-lg bg-cream-dark animate-pulse" aria-hidden="true" />;
  }

  return (
    <button
      onClick={() => void handleClick()}
      disabled={pending}
      aria-label={isFollowing ? "Unfollow this chef" : "Follow this chef"}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${isFollowing ? "bg-cream-dark text-charcoal-light hover:bg-stone-light/50" : "bg-charcoal text-cream hover:bg-charcoal-light"}`}
    >
      {pending && <Spinner className="w-3.5 h-3.5" />}
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export function FollowStats({ userId }: { userId: Id<"users"> }) {
  const counts = useQuery(api.social.followCounts, { userId }) ?? { followers: 0, following: 0 };
  return (
    <div className="flex gap-4 text-sm text-charcoal-light">
      <span>
        <strong className="text-charcoal">{counts.followers}</strong> followers
      </span>
      <span>
        <strong className="text-charcoal">{counts.following}</strong> following
      </span>
    </div>
  );
}

export function ForkButton({ recipeId, recipeTitle }: { recipeId: Id<"recipes">; recipeTitle: string }) {
  const fork = useMutation(api.recipes.fork);
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleFork = async () => {
    if (!confirming) {
      setConfirming(true);
      toast(`Tap again to fork "${recipeTitle}" to your kitchen`, "info");
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setConfirming(false);
    setPending(true);
    try {
      const result = await fork({ id: recipeId });
      await router.navigate({ to: "/dashboard/edit/$id", params: { id: result.id } });
    } catch {
      toast("Could not fork recipe", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleFork}
      disabled={pending}
      className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-light hover:text-sage hover:bg-cream-dark rounded-lg transition-colors disabled:opacity-50"
      title="Fork this recipe"
      aria-label="Fork this recipe into your kitchen"
    >
      <ForkIcon className="w-4 h-4" />
      {pending ? "Forking…" : confirming ? "Confirm?" : "Fork"}
    </button>
  );
}

export function StarRating({ recipeId }: { recipeId: Id<"recipes"> }) {
  const stats = useQuery(api.social.ratingStats, { recipeId }) ?? { average: 0, count: 0, userRating: null };
  const rate = useMutation(api.social.rateRecipe);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = (hover || stats.userRating || 0) >= star;
          return (
            <button
              key={star}
              onClick={() => rate({ recipeId, value: star })}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5 text-honey transition-colors"
            >
              {filled ? <StarSolidIcon className="w-5 h-5" /> : <StarIcon className="w-5 h-5" />}
            </button>
          );
        })}
      </div>
      {stats.count > 0 && (
        <span className="text-sm text-stone">
          {stats.average} ({stats.count})
        </span>
      )}
    </div>
  );
}

export function SocialActions({ recipeId, slug }: { recipeId: Id<"recipes">; slug: string }) {
  const recipe = useQuery(api.recipes.getBySlug, { slug });

  const toggleLikeMutation = useMutation(api.social.toggleLike).withOptimisticUpdate((localStore) => {
    const current = localStore.getQuery(api.recipes.getBySlug, { slug });
    if (current) {
      localStore.setQuery(
        api.recipes.getBySlug,
        { slug },
        {
          ...current,
          isLiked: !current.isLiked,
          likesCount: current.isLiked ? current.likesCount - 1 : current.likesCount + 1,
        }
      );
    }
  });

  const toggleBookmarkMutation = useMutation(api.social.toggleBookmark).withOptimisticUpdate((localStore) => {
    const current = localStore.getQuery(api.recipes.getBySlug, { slug });
    if (current) {
      localStore.setQuery(api.recipes.getBySlug, { slug }, { ...current, isBookmarked: !current.isBookmarked });
    }
  });

  const { execute: handleLike, isPending: isLiking } = useAsyncAction(() => toggleLikeMutation({ recipeId }), {
    errorMessage: "Sign in to like recipes",
  });
  const { execute: handleBookmark, isPending: isBookmarking } = useAsyncAction(
    () => toggleBookmarkMutation({ recipeId }),
    { errorMessage: "Sign in to save recipes" }
  );

  const liked = recipe?.isLiked ?? false;
  const bookmarked = recipe?.isBookmarked ?? false;
  const count = recipe?.likesCount ?? 0;

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Recipe actions">
      <ActionButton
        onClick={handleLike}
        isActive={liked}
        isPending={isLiking}
        activeClass="bg-terracotta/10 border-terracotta/30 text-terracotta"
        inactiveClass="bg-warm-white border-cream-dark text-charcoal-light hover:border-terracotta/30 hover:text-terracotta"
        ariaLabel={liked ? `Unlike recipe (${count} likes)` : `Like recipe (${count} likes)`}
      >
        {liked ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
        {count}
      </ActionButton>
      <ActionButton
        onClick={handleBookmark}
        isActive={bookmarked}
        isPending={isBookmarking}
        ariaLabel={bookmarked ? "Remove from saved" : "Save recipe"}
      >
        {bookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
        {bookmarked ? "Saved" : "Save"}
      </ActionButton>
    </div>
  );
}

export function NotificationBell() {
  const count = useQuery(api.notifications.unreadCount) ?? 0;
  const notifications = useQuery(api.notifications.list, { limit: 15 });
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleNotificationClick = async (n: Notification) => {
    setOpen(false);
    // Mark as read
    if (!n.read) {
      await markRead({ id: n._id });
    }
    // Navigate to relevant page
    if (n.type === "follow" && n.actor?.username) {
      void router.navigate({ to: "/chef/$username", params: { username: n.actor.username } });
    } else if (n.recipe?.slug) {
      void router.navigate({ to: "/recipe/$slug", params: { slug: n.recipe.slug } });
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllRead();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 hover:bg-cream-dark rounded-lg transition-colors"
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {count > 0 ? <BellAlertIcon className="w-5 h-5 text-terracotta" /> : <BellIcon className="w-5 h-5" />}
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 w-80 bg-warm-white rounded-xl shadow-hover border border-cream-dark z-50 overflow-hidden animate-scale-in origin-top-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cream-dark">
            <h3 className="font-medium text-sm text-charcoal">Notifications</h3>
            {count > 0 && (
              <button
                onClick={() => void handleMarkAllRead()}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-sage hover:text-sage-dark transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                {markingAll ? "Marking…" : "Mark all read"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-cream-dark">
            {notifications === undefined ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-cream-dark shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-cream-dark rounded w-full" />
                      <div className="h-3 bg-cream-dark rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <BellIcon className="w-8 h-8 text-stone mx-auto mb-2" />
                <p className="text-sm text-stone">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => void handleNotificationClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-dark ${!n.read ? "bg-sage/5" : ""}`}
                >
                  <Avatar src={n.actor?.image} name={n.actor?.name} size="sm" className="mt-0.5" />
                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${!n.read ? "text-charcoal font-medium" : "text-charcoal-light"}`}
                    >
                      {notificationMessage(n)}
                    </p>
                    <p className="text-xs text-stone mt-0.5">{timeAgo(n._creationTime)}</p>
                  </div>
                  {/* Unread dot */}
                  {!n.read && <div className="w-2 h-2 rounded-full bg-sage shrink-0 mt-1.5" aria-hidden="true" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CommentSection({ recipeId }: { recipeId: Id<"recipes"> }) {
  const comments = useQuery(api.social.getComments, { recipeId });
  const addComment = useMutation(api.social.addComment);
  const currentUser = useQuery(api.users.currentUser);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await addComment({ recipeId, content: trimmed });
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-label="Comments">
      <h3 className="font-serif text-xl font-medium mb-4">
        Comments {comments !== undefined && <span className="text-stone text-base font-normal">({comments.length})</span>}
      </h3>

      {currentUser ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="mb-6">
          <label htmlFor="new-comment" className="sr-only">
            Add a comment
          </label>
          <textarea
            id="new-comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSubmit(e as unknown as React.FormEvent);
            }}
            placeholder="Share your thoughts…"
            rows={3}
            className="input-field w-full resize-none mb-2"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-stone mb-6">
          <a href="/login" className="text-sage hover:underline">
            Sign in
          </a>{" "}
          to leave a comment.
        </p>
      )}

      {comments === undefined ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cream-dark shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-cream-dark rounded" />
                <div className="h-3 w-full bg-cream-dark rounded" />
                <div className="h-3 w-3/4 bg-cream-dark rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-stone text-sm py-4 text-center">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <CommentItem key={c._id} comment={c} currentUserId={currentUser?._id} />
          ))}
        </div>
      )}
    </section>
  );
}
