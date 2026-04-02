interface ActionButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isPending?: boolean;
  activeClass?: string;
  inactiveClass?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
}

export function ActionButton({
  onClick,
  isActive = false,
  isPending = false,
  activeClass = "bg-sage/10 border-sage/30 text-sage",
  inactiveClass = "bg-warm-white border-cream-dark text-charcoal-light hover:border-sage/30 hover:text-sage",
  className = "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
  children,
  ariaLabel,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isPending}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={`${className} ${isActive ? activeClass : inactiveClass} ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
