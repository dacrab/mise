import { Link } from "@tanstack/react-router";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-20 pb-24">{children}</main>
      <Footer />
    </>
  );
}

export function ErrorPage({ title, message }: { title: string; message?: string }) {
  return (
    <div className="center min-h-screen bg-cream dark:bg-d-bg p-8 text-center">
      <div>
        <h1 className="font-serif text-4xl font-medium text-primary mb-4">{title}</h1>
        {message && <p className="text-stone mb-6">{message}</p>}
        <Link to="/" className="btn-primary">
          Back to recipes
        </Link>
      </div>
    </div>
  );
}
