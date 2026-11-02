import { isNotFound, Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageLayout } from "@/components/layout/PageLayout";

function ErrorLayout({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  return (
    <PageLayout>
      <div className="container-page py-24 text-center">
        <p className="eyebrow">Mise</p>
        <h1 className="mt-4 text-4xl font-medium sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-ink-soft">{message}</p>
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </PageLayout>
  );
}

function NotFoundPage() {
  return (
    <ErrorLayout title="Page not found" message="The page you're looking for doesn't exist or has been moved.">
      <Link to="/" className="btn-primary">
        Back to recipes
      </Link>
    </ErrorLayout>
  );
}

export function RouteError({ error, reset }: { error: unknown; reset?: () => void }) {
  const router = useRouter();

  if (isNotFound(error)) return <NotFoundPage />;

  return (
    <ErrorLayout title="Something went wrong" message="We encountered an error while loading this page.">
      {reset && (
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
      )}
      <button type="button" onClick={() => router.history.back()} className="btn-secondary">
        Go back
      </button>
    </ErrorLayout>
  );
}
