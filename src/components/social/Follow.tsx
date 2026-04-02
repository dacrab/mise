import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Spinner } from "@/components/ui/Primitives";
import { ActionButton } from "@/components/ui/ActionButton";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export function FollowButton({ userId }: { userId: Id<"users"> }) {
  const isFollowing = useQuery(api.social.isFollowing, { userId });
  const toggle = useMutation(api.social.toggleFollow);

  const { execute: handleClick, isPending } = useAsyncAction(
    () => toggle({ userId }),
    { errorMessage: "Could not update follow" }
  );

  if (isFollowing === undefined) {
    return <div className="h-9 w-24 rounded-lg bg-cream-dark animate-pulse" aria-hidden="true" />;
  }

  return (
    <ActionButton
      onClick={() => void handleClick()}
      isActive={isFollowing}
      isPending={isPending}
      ariaLabel={isFollowing ? "Unfollow this chef" : "Follow this chef"}
      activeClass="bg-cream-dark border-cream-dark text-charcoal-light hover:bg-stone-light/50"
      inactiveClass="bg-charcoal border-charcoal text-cream hover:bg-charcoal-light"
      className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60"
    >
      {isPending && <Spinner className="w-3.5 h-3.5" />}
      {isFollowing ? "Following" : "Follow"}
    </ActionButton>
  );
}

export function FollowStats({ userId }: { userId: Id<"users"> }) {
  const counts = useQuery(api.social.followCounts, { userId });
  return (
    <div className="flex gap-4 text-sm text-charcoal-light">
      <span><strong className="text-charcoal">{counts?.followers ?? 0}</strong> followers</span>
      <span><strong className="text-charcoal">{counts?.following ?? 0}</strong> following</span>
    </div>
  );
}
