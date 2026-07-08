import { Link } from "@tanstack/react-router";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function PageLayout({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      <Header />
      <main className={`pt-20 pb-24 ${className}`}>{children}</main>
      <Footer />
    </>
  );
}

export function ErrorPage({
  title,
  message,
  showHomeLink = true,
}: {
  title: string;
  message?: string;
  showHomeLink?: boolean;
}) {
  return (
    <div className="center min-h-screen bg-cream dark:bg-d-bg p-8 text-center">
      <div>
        <h1 className="font-serif text-4xl font-medium text-primary mb-4">{title}</h1>
        {message && <p className="text-stone mb-6">{message}</p>}
        {showHomeLink && (
          <Link to="/" className="btn-primary">
            Back to recipes
          </Link>
        )}
      </div>
    </div>
  );
}
