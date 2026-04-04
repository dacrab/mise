import { Link } from "@tanstack/react-router";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({ icon, title, message, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="card p-12 text-center">
      <div className="w-14 h-14 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-4">{icon}</div>
      <h2 className="font-serif text-xl font-medium mb-2">{title}</h2>
      <p className="text-stone text-sm mb-6">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
