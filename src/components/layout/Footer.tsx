export function Footer() {
  return (
    <footer className="border-t border-cream-dark bg-warm-white mt-auto">
      <div className="wrapper py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="font-serif text-xl font-semibold text-charcoal">mise</span>
            <p className="text-sm text-stone mt-2 max-w-xs">A place for home cooks to share recipes made with love.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href="/about" className="text-stone hover:text-charcoal transition-colors">About</a>
            <a href="/privacy" className="text-stone hover:text-charcoal transition-colors">Privacy</a>
            <a href="/terms" className="text-stone hover:text-charcoal transition-colors">Terms</a>
            <a href="https://github.com/dacrab/mise" className="text-stone hover:text-charcoal transition-colors">GitHub</a>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-cream-dark">
          <p className="text-xs text-stone-light">© {new Date().getFullYear()} mise. Made with care.</p>
        </div>
      </div>
    </footer>
  );
}
