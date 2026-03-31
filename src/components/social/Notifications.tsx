import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";
import { useRouter } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Avatar } from "@/components/ui/Primitives";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { timeAgo } from "@/lib/utils";

type Notification = {
  _id: Id<"notifications">;
  _creationTime: number;
  type: "like" | "comment" | "follow" | "fork";
  read: boolean;
  actor: { name?: string | null; image?: string | null; username?: string | null } | null;
  recipe: { title: string; slug: string } | null;
};

function notificationMessage(n: Notification): string {
  const actor = n.actor?.name ?? "Someone";
  switch (n.type) {
    case "like":    return `${actor} liked your recipe${n.recipe ? ` "${n.recipe.title}"` : ""}`;
    case "comment": return `${actor} commented on${n.recipe ? ` "${n.recipe.title}"` : " your recipe"}`;
    case "follow":  return `${actor} started following you`;
    case "fork":    return `${actor} forked your recipe${n.recipe ? ` "${n.recipe.title}"` : ""}`;
    default:        return `${actor} interacted with your content`;
  }
}

export function NotificationBell() {
  const count = useQuery(api.notifications.unreadCount) ?? 0;
  const notifications = useQuery(api.notifications.list, { limit: 15 });
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleNotificationClick = async (n: Notification) => {
    setOpen(false);
    if (!n.read) await markRead({ id: n._id });
    if (n.type === "follow" && n.actor?.username) {
      void router.navigate({ to: "/chef/$username", params: { username: n.actor.username } });
    } else if (n.recipe?.slug) {
      void router.navigate({ to: "/recipe/$slug", params: { slug: n.recipe.slug } });
    }
  };

  const { execute: handleMarkAllRead, isPending: markingAll } = useAsyncAction(
    async () => { await markAllRead(); }
  );

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
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "text-charcoal font-medium" : "text-charcoal-light"}`}>
                      {notificationMessage(n)}
                    </p>
                    <p className="text-xs text-stone mt-0.5">{timeAgo(n._creationTime)}</p>
                  </div>
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
