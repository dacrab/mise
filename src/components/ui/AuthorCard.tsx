import { Link } from "@tanstack/react-router";
import { Avatar } from "@/components/ui/Primitives";

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
  const href = username ?? "unknown";

  return (
    <Link
      to="/chef/$username"
      params={{ username: href }}
      className={`flex items-center gap-3 group ${className}`}
    >
      <Avatar src={displayImage} name={name ?? "Chef"} size="md" className="ring-2 ring-cream-dark" />
      <div>
        <span className="block text-sm font-medium text-charcoal group-hover:text-sage transition-colors">
          {name ?? "Chef"}
        </span>
        {children}
      </div>
    </Link>
  );
}
