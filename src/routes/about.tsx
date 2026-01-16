import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-cream-dark/50">
        <div className="wrapper h-16 flex items-center">
          <Link to="/" className="text-sm text-stone hover:text-charcoal transition-colors">← Back</Link>
        </div>
      </header>

      <main className="pt-20 pb-24">
        <article className="wrapper max-w-2xl py-12 md:py-16">
          <p className="font-hand text-xl text-sage mb-3">our story</p>
          <h1 className="heading-1 text-3xl md:text-4xl mb-6">A place for home cooks</h1>
          <p className="body-large mb-12">
            Mise is a platform born from the love of home cooking and the desire to share 
            culinary secrets with a global community.
          </p>
          
          <div className="aspect-video rounded-xl bg-cream-dark overflow-hidden mb-12">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745a3002?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover" 
              alt="Cooking" 
              loading="lazy" 
            />
          </div>

          <div className="space-y-4 text-charcoal-light leading-relaxed">
            <p>
              Our mission is simple: provide a beautiful, fast, and secure space for cooks 
              of all levels to document their creations and discover new tastes.
            </p>
            <p>
              No algorithms pushing viral content. No ads interrupting your flow. 
              Just good food, shared with intention.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
