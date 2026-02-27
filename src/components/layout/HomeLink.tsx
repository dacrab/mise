import { Link } from "@tanstack/react-router";

export function HomeLink({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Link to="/" className={className}>
      {children}
    </Link>
  );
}
