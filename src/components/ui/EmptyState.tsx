import type { ComponentType, ReactNode } from "react";

/** Card used for empty lists (dashboard, chef profiles, …). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="card p-16 text-center">
      <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
        <Icon className="w-9 h-9 text-sage" />
      </div>
      <h2 className="font-serif text-2xl font-medium mb-2">{title}</h2>
      <p className="text-stone max-w-sm mx-auto">{description}</p>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
