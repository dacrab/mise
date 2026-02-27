interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card p-12 text-center">
      {icon && (
        <div className="w-14 h-14 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h2 className="font-serif text-xl font-medium mb-2">{title}</h2>
      {description && <p className="text-stone text-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
