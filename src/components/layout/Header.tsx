import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCallback, useState, useEffect, useRef } from "react";
import { api } from "convex/_generated/api";
import { NotificationBell } from "@/components/social/Notifications";
import { Menu } from "@base-ui-components/react/menu";
import { HomeIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, PlusIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/Avatar";
import { HomeLink } from "@/components/layout/HomeLink";

export function Header() {
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleSignOut = useCallback(async () => {
    setMobileOpen(false);
    await signOut();
    await router.navigate({ to: "/", replace: true });
  }, [signOut, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.state.location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass">
        <div className="wrapper h-16 flex items-center justify-between">
          <HomeLink className="font-serif text-2xl font-semibold tracking-tight text-charcoal hover:text-sage transition-colors">mise</HomeLink>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <Menu.Root>
                  <Menu.Trigger className="btn-ghost text-sm flex items-center gap-2">
                    <Avatar src={user.profileImageUrl || user.image} name={user.name} size="xs" />
                    <span className="hidden sm:inline">{user.name?.split(" ")[0] ?? "Menu"}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner className="z-50" sideOffset={8} align="end">
                      <Menu.Popup className="min-w-[180px] bg-warm-white rounded-lg shadow-card border border-cream-dark py-1">
                        <Menu.Item className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-cream-dark outline-none cursor-pointer data-[highlighted]:bg-cream-dark" render={<Link to="/dashboard" />}>
                          <HomeIcon className="w-4 h-4" /> Dashboard
                        </Menu.Item>
                        <Menu.Item className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-cream-dark outline-none cursor-pointer data-[highlighted]:bg-cream-dark" render={<Link to="/settings" />}>
                          <Cog6ToothIcon className="w-4 h-4" /> Settings
                        </Menu.Item>
                        <Menu.Separator className="h-px bg-cream-dark my-1" />
                        <Menu.Item onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm text-terracotta hover:bg-cream-dark outline-none cursor-pointer data-[highlighted]:bg-cream-dark">
                          <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign out
                        </Menu.Item>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.Root>
                <Link to="/dashboard/create" className="btn-primary text-sm">
                  <PlusIcon className="w-4 h-4" /> New Recipe
                </Link>
              </>
            ) : user === null ? (
              <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            ) : null}
          </nav>

          {/* Mobile: right side */}
          <div className="flex sm:hidden items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 hover:bg-cream-dark rounded-lg transition-colors"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/30 backdrop-blur-sm sm:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        id="mobile-menu"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-warm-white shadow-hover flex flex-col sm:hidden transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-cream-dark">
          <span className="font-serif text-xl font-semibold text-charcoal">mise</span>
          <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-cream-dark rounded-lg" aria-label="Close menu">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-5 space-y-1">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 mb-4 bg-cream-dark rounded-lg">
                <Avatar src={user.profileImageUrl || user.image} name={user.name} size="md" />
                <div className="min-w-0">
                  <p className="font-medium text-charcoal truncate">{user.name ?? "Chef"}</p>
                  {user.username && <p className="text-xs text-stone truncate">@{user.username}</p>}
                </div>
              </div>
              <Link to="/dashboard/create" className="btn-primary w-full justify-center mb-3">
                <PlusIcon className="w-4 h-4" /> New Recipe
              </Link>
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-charcoal hover:bg-cream-dark transition-colors">
                <HomeIcon className="w-5 h-5 text-stone" /> Dashboard
              </Link>
              <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-charcoal hover:bg-cream-dark transition-colors">
                <Cog6ToothIcon className="w-5 h-5 text-stone" /> Settings
              </Link>
              <div className="pt-3 mt-3 border-t border-cream-dark">
                <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-terracotta hover:bg-cream-dark transition-colors w-full text-left">
                  <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary w-full justify-center">Sign in</Link>
              <Link to="/signup" className="btn-secondary w-full justify-center mt-2">Create account</Link>
            </>
          )}
        </nav>

        <div className="p-5 border-t border-cream-dark">
          <nav className="flex gap-4 text-sm text-stone">
            <Link to="/about" className="hover:text-charcoal transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-charcoal transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-charcoal transition-colors">Terms</Link>
          </nav>
        </div>
      </div>
    </>
  );
}
