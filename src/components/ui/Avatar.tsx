interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

export function Avatar({ src, name, size = "sm", className = "" }: AvatarProps) {
  const sizeClass = sizeMap[size];
  const initial = name?.charAt(0).toUpperCase() ?? "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-sage/20 flex items-center justify-center text-sage font-medium shrink-0 ${className}`}>
      {initial}
    </div>
  );
}
