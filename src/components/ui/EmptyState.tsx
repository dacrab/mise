import type { ComponentType, ReactNode } from "react";

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
    <div className="card px-6 py-16 text-center sm:px-12">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-accent-soft">
        <Icon className="size-6 text-accent" />
      </div>
      <h2 className="text-2xl font-medium">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p>
      {children && <div className="mt-7">{children}</div>}
    </div>
  );
}
