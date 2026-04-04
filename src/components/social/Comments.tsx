import { useMutation, useQuery } from "convex/react";
import { useRef, useState } from "react";
import { CheckIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Avatar } from "@/components/ui/Primitives";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { timeAgo } from "@/lib/utils";

type Comment = {
  _id: Id<"comments">;
  _creationTime: number;
  userId: string;
  content: string;
  user: { name?: string | null; image?: string | null } | null;
};

function CommentItem({ comment, currentUserId }: { comment: Comment; currentUserId?: string | null }) {
  const updateComment = useMutation(api.social.updateComment);
  const deleteComment = useMutation(api.social.deleteComment);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const isOwner = !!currentUserId && currentUserId === comment.userId;

  const { execute: handleSaveEdit, isPending } = useAsyncAction(async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === comment.content) { handleCancelEdit(); return; }
    await updateComment({ id: comment._id, content: trimmed });
    setIsEditing(false);
  });

  const { trigger: handleDelete, pendingId: deletePendingId } = useConfirmAction<string>(
    async () => { await deleteComment({ id: comment._id }); },
    { confirmMessage: "Tap again to confirm delete", errorMessage: "Could not delete comment" }
  );

  const handleEdit = () => {
    setEditText(comment.content);
    setIsEditing(true);
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.content);
  };

  return (
    <div className="flex gap-3">
      <Avatar src={comment.user?.image} name={comment.user?.name ?? "Chef"} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-medium text-charcoal">{comment.user?.name ?? "Chef"}</span>
          <span className="text-xs text-stone">{timeAgo(comment._creationTime)}</span>
        </div>

        {isEditing ? (
          <div className="mt-1">
            <label htmlFor={`edit-comment-${comment._id}`} className="sr-only">Edit comment</label>
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
              disabled={isPending}
            />
            <div className="flex gap-2 mt-1.5">
              <button
                onClick={() => void handleSaveEdit()}
                disabled={isPending || !editText.trim()}
                className="flex items-center gap-1 text-xs btn-primary px-2 py-1 disabled:opacity-50"
              >
                <CheckIcon className="w-3.5 h-3.5" /> Save
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isPending}
                className="flex items-center gap-1 text-xs btn-ghost px-2 py-1"
              >
                <XMarkIcon className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-charcoal-light mt-0.5 break-words">{comment.content}</p>
        )}

        {isOwner && !isEditing && (
          <div className="flex gap-3 mt-1.5">
            <button
              onClick={handleEdit}
              disabled={isPending}
              className="flex items-center gap-1 text-xs text-stone hover:text-sage transition-colors"
            >
              <PencilIcon className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => void handleDelete(comment._id)}
              disabled={isPending}
              className={`flex items-center gap-1 text-xs transition-colors ${deletePendingId === comment._id ? "text-terracotta font-medium" : "text-stone hover:text-terracotta"}`}
            >
              <TrashIcon className="w-3 h-3" />
              {deletePendingId === comment._id ? "Confirm delete?" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ recipeId }: { recipeId: Id<"recipes"> }) {
  const comments = useQuery(api.social.getComments, { recipeId });
  const addComment = useMutation(api.social.addComment);
  const currentUser = useQuery(api.users.currentUser);
  const [text, setText] = useState("");

  const { execute: handleSubmit, isPending: submitting } = useAsyncAction(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) return;
      await addComment({ recipeId, content: trimmed });
      setText("");
    }
  );

  return (
    <section aria-label="Comments">
      <h3 className="font-serif text-xl font-medium mb-4">
        Comments {comments !== undefined && <span className="text-stone text-base font-normal">({comments.length})</span>}
      </h3>

      {currentUser ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="mb-6">
          <label htmlFor="new-comment" className="sr-only">Add a comment</label>
          <textarea
            id="new-comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                const form = e.currentTarget.closest("form");
                if (form) void handleSubmit(new Event("submit", { bubbles: true }) as unknown as React.FormEvent);
              }
            }}
            placeholder="Share your thoughts…"
            rows={3}
            className="input-field w-full resize-none mb-2"
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !text.trim()} className="btn-primary text-sm disabled:opacity-50">
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-stone mb-6">
          <a href="/login" className="text-sage hover:underline">Sign in</a>{" "}to leave a comment.
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
