import { SimpleLayout } from "@/components/layout";

export function StaticPage({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <SimpleLayout>
      <article className="wrapper max-w-2xl py-12 md:py-16">
        <h1 className="font-serif text-4xl font-medium mb-4">{title}</h1>
        {description && <p className="text-stone mb-8">{description}</p>}
        {children}
      </article>
    </SimpleLayout>
  );
}
