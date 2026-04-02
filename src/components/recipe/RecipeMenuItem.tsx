interface RecipeMenuItemProps {
  onClick: () => void;
  disabled?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

export function RecipeMenuItem({ onClick, disabled = false, leading, trailing, children }: RecipeMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-cream-dark transition-colors text-left disabled:opacity-50"
    >
      {leading ?? <div className="w-4" />}
      {children}
      {trailing}
    </button>
  );
}
