
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useToast } from "@/components/ui/toast";

interface Props {
  recipeId: Id<"recipes">;
  isLoggedIn: boolean;
}

export function CommentSection({ recipeId, isLoggedIn }: Props) {
  const { toast } = useToast();
  const comments = useQuery(api.social.getComments, { recipeId }) ?? [];
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addComment = useMutation(api.social.addComment).withOptimisticUpdate(
    (localStore, { recipeId, content }) => {
      const current = localStore.getQuery(api.social.getComments, { recipeId });
      if (current) {
        localStore.setQuery(api.social.getComments, { recipeId }, [
          { _id: `temp-${Date.now()}` as Id<"comments">, _creationTime: Date.now(), content, userId: "temp" as Id<"users">, recipeId, user: { name: "You", image: undefined } },
          ...current,
        ]);
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addComment({ recipeId, content });
      setContent("");
      toast("Comment posted!", "success");
    } catch {
      toast("Could not post comment", "error");
    }
    setIsSubmitting(false);
  };

  return (
    <section aria-labelledby="comments-heading">
      <h3 id="comments-heading" className="font-serif text-lg font-medium mb-6">
        Comments {comments.length > 0 && <span className="text-stone font-normal">({comments.length})</span>}
      </h3>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <label htmlFor="comment-input" className="sr-only">Write a comment</label>
          <textarea
            id="comment-input"
            className="textarea-field h-24 mb-3"
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
          />
          <button type="submit" disabled={isSubmitting || !content.trim()} className="btn-primary text-sm">
            {isSubmitting ? "Posting..." : "Post comment"}
          </button>
        </form>
      ) : (
        <div className="card p-6 mb-8 text-center">
          <p className="text-stone text-sm mb-3">Sign in to join the conversation.</p>
          <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 && <p className="text-stone text-sm">No comments yet.</p>}
        {comments.map((comment) => (
          <article key={comment._id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-sage/15 overflow-hidden shrink-0">
              {comment.user?.image ? (
                <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-medium text-sage">{(comment.user?.name || "?")[0]}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium text-charcoal">{comment.user?.name || "Anonymous"}</span>
                <time className="text-xs text-stone-light" dateTime={new Date(comment._creationTime).toISOString()}>
                  {new Date(comment._creationTime).toLocaleDateString()}
                </time>
              </div>
              <p className="text-sm text-charcoal-light leading-relaxed">{comment.content}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
