export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center min-h-[60vh] text-stone animate-pulse ${className}`}>
      Loading...
    </div>
  );
}

export function LoadingDots() {
  return <span className="animate-pulse">...</span>;
}
