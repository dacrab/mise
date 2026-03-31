import { Link } from "@tanstack/react-router";

interface AuthorCardProps {
  name?: string | null;
  username?: string | null;
  image?: string | null;
  profileImageUrl?: string | null;
  /** Extra content to show below the name row (e.g. date, follow button) */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Shared author/chef avatar + name card.
 * Used on the recipe detail page and chef profile page.
 */
export function AuthorCard({ name, username, image, profileImageUrl, children, className = "" }: AuthorCardProps) {
  const displayImage = profileImageUrl ?? image;
  const initial = name?.[0] ?? "U";
  const href = username ?? "unknown";

  return (
    <Link
      to="/chef/$username"
      params={{ username: href }}
      className={`flex items-center gap-3 group ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-sage/15 overflow-hidden shrink-0">
        {displayImage ? (
          <img src={displayImage} alt={name ?? ""} className="w-full h-full object-cover ring-2 ring-cream-dark" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sage font-medium">
            {initial}
          </div>
        )}
      </div>
      <div>
        <span className="block text-sm font-medium text-charcoal group-hover:text-sage transition-colors">
          {name ?? "Chef"}
        </span>
        {children}
      </div>
    </Link>
  );
}
