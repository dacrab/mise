import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export function CookingNow({ recipeId }: { recipeId: Id<"recipes"> }) {
  const cooking = useQuery(api.presence.getCooking, { recipeId });
  const heartbeatMutation = useMutation(api.presence.heartbeat);
  const leaveMutation = useMutation(api.presence.leave);

  const heartbeatRef = useRef(heartbeatMutation);
  const leaveRef = useRef(leaveMutation);
  heartbeatRef.current = heartbeatMutation;
  leaveRef.current = leaveMutation;

  useEffect(() => {
    heartbeatRef.current({ recipeId });
    const interval = setInterval(() => heartbeatRef.current({ recipeId }), 10_000);
    return () => {
      clearInterval(interval);
      leaveRef.current({ recipeId });
    };
  }, [recipeId]);

  if (!cooking || cooking.count <= 1) return null;

  const others = cooking.count - 1;
  const names = cooking.users.map((u: { name?: string } | null) => u?.name || "Someone").slice(0, 2);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-sage/10 rounded-full text-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-sage" />
      </span>
      <span className="text-sage-dark">
        {names.length > 0 ? `${names.join(", ")}${others > names.length ? ` +${others - names.length}` : ""}` : `${others} ${others === 1 ? "person" : "people"}`} cooking now
      </span>
    </div>
  );
}
