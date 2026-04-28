import { createFileRoute, Link } from "@tanstack/react-router";
import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const Route = createFileRoute("/(auth)/forgot-password")({
  head: () => ({
    meta: [
      { title: `Reset password${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Request a password reset to get back into your kitchen." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal p-12 flex-col justify-between">
        <Link to="/" className="font-serif text-2xl font-semibold text-cream">
          mise
        </Link>
        <div>
          <p className="font-hand text-3xl text-sage-light mb-4">no worries</p>
          <p className="text-cream/80 text-lg max-w-md">We'll help you get back into your kitchen.</p>
        </div>
        <p className="text-stone text-sm">© {new Date().getFullYear()} mise</p>
      </div>
      <div className="center flex-1 p-8 bg-cream">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden font-serif text-2xl font-semibold text-charcoal block mb-8">
            mise
          </Link>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
