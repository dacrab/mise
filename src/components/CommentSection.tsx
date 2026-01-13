"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useToast } from "./ui/toast";

interface Props {
  recipeId: Id<"recipes">;
  isLoggedIn: boolean;
}

export function CommentSection({ recipeId, isLoggedIn }: Props) {
  const { toast } = useToast();
  const comments = useQuery(api.social.getComments, { recipeId }) ?? [];
  const addComment = useMutation(api.social.addComment);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await addComment({ recipeId, content });
      setContent("");
      toast("Comment posted!", "success");
    } catch {
      toast("Could not post comment", "error");
    }
    setLoading(false);
  };

  return (
    <section>
      <h3 className="font-serif text-lg font-medium mb-6">
        Comments {comments.length > 0 && <span className="text-stone font-normal">({comments.length})</span>}
      </h3>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            className="textarea-field h-24 mb-3"
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? "Posting..." : "Post comment"}
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
          <div key={comment._id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-sage/15 overflow-hidden shrink-0">
              {comment.user?.image ? (
                <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-medium text-sage">
                  {(comment.user?.name || "?")[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium text-charcoal">{comment.user?.name || "Anonymous"}</span>
                <span className="text-xs text-stone-light">{new Date(comment._creationTime).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-charcoal-light leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
