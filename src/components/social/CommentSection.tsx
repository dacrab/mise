import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useState, useRef } from "react";
import type { Id } from "convex/_generated/dataModel";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Comment = {
  _id: Id<"comments">;
  _creationTime: number;
  userId: string;
  content: string;
  user: { name?: string | null; image?: string | null } | null;
};

function CommentItem({
  comment,
  currentUserId,
}: {
  comment: Comment;
  currentUserId?: string | null;
}) {
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
    if (!trimmed || trimmed === comment.content) { handleCancelEdit(); return; }
    setPending(true);
    try {
      await updateComment({ id: comment._id, content: trimmed });
      setEditing(false);
    } finally { setPending(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setPending(true);
    try { await deleteComment({ id: comment._id }); }
    finally { setPending(false); }
  };

  const authorName = comment.user?.name ?? "Chef";
  const authorImage = comment.user?.image;

  return (
    <div className="flex gap-3">
      <div className="shrink-0">
        {authorImage
          ? <img src={authorImage} alt="" className="w-8 h-8 rounded-full object-cover" />
          : <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center text-sage text-xs font-medium">
              {authorName.charAt(0).toUpperCase()}
            </div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-medium text-charcoal">{authorName}</span>
          <span className="text-xs text-stone">{new Date(comment._creationTime).toLocaleDateString()}</span>
        </div>

        {editing ? (
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
    } finally { setSubmitting(false); }
  };

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
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSubmit(e as unknown as React.FormEvent); }}
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
          <a href="/login" className="text-sage hover:underline">Sign in</a> to leave a comment.
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
