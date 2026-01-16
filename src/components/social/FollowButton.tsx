
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

interface Props {
  userId: Id<"users">;
  initialFollowing?: boolean;
}

export function FollowButton({ userId, initialFollowing = false }: Props) {
  const isFollowing = useQuery(api.follows.isFollowing, { userId }) ?? initialFollowing;
  const toggle = useMutation(api.follows.toggle);

  return (
    <button
      onClick={() => toggle({ userId })}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isFollowing
          ? "bg-cream-dark text-charcoal-light hover:bg-stone-light/50"
          : "bg-charcoal text-cream hover:bg-charcoal-light"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export function FollowStats({ userId }: { userId: Id<"users"> }) {
  const counts = useQuery(api.follows.counts, { userId }) ?? { followers: 0, following: 0 };

  return (
    <div className="flex gap-4 text-sm text-charcoal-light">
      <span><strong className="text-charcoal">{counts.followers}</strong> followers</span>
      <span><strong className="text-charcoal">{counts.following}</strong> following</span>
    </div>
  );
}
