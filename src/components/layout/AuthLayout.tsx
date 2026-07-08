import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthLayout({
  form,
  heroHeading,
  heroDescription,
  heroBg = "bg-charcoal",
  heroFooterClass = "text-stone",
}: {
  form: ReactNode;
  heroHeading: string;
  heroDescription: string;
  heroBg?: string;
  heroFooterClass?: string;
}) {
  return (
    <div className="min-h-screen flex">
      <div className={`hidden lg:flex lg:w-1/2 ${heroBg} p-12 flex-col justify-between`}>
        <Link to="/" className="font-serif text-2xl font-semibold text-cream">
          mise
        </Link>
        <div>
          <p className="font-hand text-3xl text-sage-light mb-4">{heroHeading}</p>
          <p className="text-cream/80 text-lg max-w-md">{heroDescription}</p>
        </div>
        <p className={`${heroFooterClass} text-sm`}>&copy; {new Date().getFullYear()} mise</p>
      </div>
      <div className="center flex-1 p-8 bg-cream dark:bg-d-bg">
        <div className="w-full max-w-md">{form}</div>
      </div>
    </div>
  );
}
