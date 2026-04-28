import { Link, useRouter } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";

interface RouteErrorProps {
  error: Error;
  reset?: () => void;
}

export function RouteError({ error, reset }: RouteErrorProps) {
  const router = useRouter();
  const isNotFound = error.message.includes("notFound") || error.message.includes("404");

  if (isNotFound) {
    return (
      <PageLayout>
        <div className="wrapper py-20 text-center">
          <h1 className="font-serif text-4xl font-medium mb-4">Page Not Found</h1>
          <p className="text-charcoal-light mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="wrapper py-20 text-center">
        <h1 className="font-serif text-4xl font-medium mb-4">Something Went Wrong</h1>
        <p className="text-charcoal-light mb-8">
          We encountered an error while loading this page.
        </p>
        <div className="flex gap-4 justify-center">
          {reset && (
            <button onClick={reset} className="btn-primary">
              Try Again
            </button>
          )}
          <button
            onClick={() => router.history.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
