import { isNotFound, Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageLayout } from "@/components/layout/PageLayout";

interface RouteErrorProps {
  error: unknown;
  reset?: () => void;
}

function ErrorLayout({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  return (
    <PageLayout>
      <div className="wrapper py-20 text-center">
        <h1 className="page-title mb-4">{title}</h1>
        <p className="text-secondary mb-8">{message}</p>
        {children}
      </div>
    </PageLayout>
  );
}

export function RouteError({ error, reset }: RouteErrorProps) {
  const router = useRouter();

  if (isNotFound(error)) {
    return (
      <ErrorLayout title="Page not found" message="The page you're looking for doesn't exist or has been moved.">
        <Link to="/" className="btn-primary">
          Go home
        </Link>
      </ErrorLayout>
    );
  }

  return (
    <ErrorLayout title="Something went wrong" message="We encountered an error while loading this page.">
      <div className="flex gap-4 justify-center">
        {reset && (
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
        )}
        <button type="button" onClick={() => router.history.back()} className="btn-secondary">
          Go back
        </button>
      </div>
    </ErrorLayout>
  );
}
