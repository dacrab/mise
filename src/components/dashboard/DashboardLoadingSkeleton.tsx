export function DashboardLoadingSkeleton() {
  return (
    <div className="wrapper py-8 animate-pulse">
      <div className="py-8 md:py-12 border-b border-cream-dark mb-8">
        <div className="h-6 w-32 bg-cream-dark rounded mb-3" />
        <div className="h-9 w-64 bg-cream-dark rounded" />
      </div>
      <div className="flex gap-6 mb-8">
        {["My Recipes", "Saved", "Collections"].map((label) => (
          <div key={label} className="h-4 w-20 bg-cream-dark rounded" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card flex items-center gap-4 p-4">
            <div className="w-16 h-16 rounded-lg bg-cream-dark shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-cream-dark rounded" />
              <div className="h-3 w-1/4 bg-cream-dark rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
