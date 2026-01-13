import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export function NotificationBell() {
  const count = useQuery(api.notifications.unreadCount) ?? 0;
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-cream-dark rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-warm-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const notifications = useQuery(api.notifications.list, { limit: 10 }) ?? [];
  const markAllRead = useMutation(api.notifications.markAllRead);
  const markRead = useMutation(api.notifications.markRead);

  const getMessage = (n: typeof notifications[0]) => {
    switch (n.type) {
      case "like": return `liked your recipe "${n.recipe?.title}"`;
      case "comment": return `commented on "${n.recipe?.title}"`;
      case "follow": return "started following you";
      case "fork": return `forked your recipe "${n.recipe?.title}"`;
    }
  };

  const getLink = (n: typeof notifications[0]) => {
    if (n.type === "follow") return `/chef/${n.actor?.username}`;
    return n.recipe ? `/recipe/${n.recipe.slug}` : "#";
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 card shadow-card z-50 overflow-hidden">
        <div className="p-3 border-b border-cream-dark flex items-center justify-between">
          <span className="text-sm font-medium">Notifications</span>
          {notifications.some((n) => !n.read) && (
            <button onClick={() => markAllRead()} className="text-xs text-sage hover:text-sage-light">
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-stone text-sm">No notifications</p>
          ) : (
            notifications.map((n) => (
              <a
                key={n._id}
                href={getLink(n)}
                onClick={() => !n.read && markRead({ id: n._id })}
                className={`block p-3 hover:bg-cream-dark/50 border-b border-cream-dark last:border-0 transition-colors ${!n.read ? "bg-sage/5" : ""}`}
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage/15 overflow-hidden shrink-0">
                    {n.actor?.image ? (
                      <img src={n.actor.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-medium text-sage">
                        {n.actor?.name?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal-light">
                      <span className="font-medium text-charcoal">{n.actor?.name || "Someone"}</span>{" "}
                      {getMessage(n)}
                    </p>
                    <p className="text-xs text-stone mt-0.5">
                      {new Date(n._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-sage mt-2 shrink-0" />}
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </>
  );
}
