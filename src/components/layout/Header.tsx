import { Menu } from "@base-ui-components/react/menu";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link, useRouter } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Primitives";
import { useTheme } from "@/hooks/useTheme";

const FOOTER_LINKS = [
  { to: "/about", label: "About" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;

const USER_MENU_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { to: "/settings", label: "Settings", icon: Cog6ToothIcon },
] as const;

function UserMenu({ onClose }: { onClose?: () => void }) {
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleSignOut = async () => {
    onClose?.();
    await signOut();
    await router.navigate({ to: "/", replace: true });
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-2">
        <Menu.Root>
          <Menu.Trigger className="btn-ghost text-sm flex items-center gap-2">
            <Avatar src={user?.profileImageUrl ?? user?.image} name={user?.name} size="sm" />
            <span className="hidden sm:inline max-w-[120px] truncate">
              {user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Chef"}
            </span>
            <ChevronDownIcon className="w-4 h-4 shrink-0" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner className="z-50" sideOffset={8} align="end">
              <Menu.Popup className="min-w-[200px] bg-warm-white dark:bg-d-surface rounded-xl shadow-card border border-cream-dark dark:border-d-border py-1.5 animate-scale-in">
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-cream-dark mb-1">
                  <Avatar src={user?.profileImageUrl ?? user?.image} name={user?.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{user?.name ?? "Chef"}</p>
                    {user?.username && <p className="text-xs text-stone truncate">@{user.username}</p>}
                  </div>
                </div>
                {USER_MENU_LINKS.map(({ to, label, icon: Icon }) => (
                  <Menu.Item
                    key={to}
                    className="menu-item cursor-pointer"
                    render={<Link to={to} />}
                  >
                    <Icon className="w-4 h-4 text-stone" /> {label}
                  </Menu.Item>
                ))}
                <Menu.Separator className="h-px bg-cream-dark dark:bg-d-border my-1" />
                <Menu.Item
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-terracotta hover:bg-terracotta/5 outline-none cursor-pointer data-[highlighted]:bg-terracotta/5 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign out
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center gap-3 p-3 mb-4 surface-raised rounded-xl">
          <Avatar src={user?.profileImageUrl ?? user?.image} name={user?.name} size="md" />
          <div className="min-w-0">
            <p className="font-medium text-primary truncate">{user?.name ?? "Chef"}</p>
            {user?.username
              ? <p className="text-xs text-stone truncate">@{user.username}</p>
              : user?.email && <p className="text-xs text-stone truncate">{user.email}</p>}
          </div>
        </div>
        {USER_MENU_LINKS.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary hover:bg-cream-dark dark:hover:bg-d-surface-raised transition-colors">
            <Icon className="w-5 h-5 text-stone" /> {label}
          </Link>
        ))}
        <div className="pt-3 mt-3 border-t border-cream-dark">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-terracotta hover:bg-terracotta/5 transition-colors w-full text-left">
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign out
          </button>
        </div>
      </div>
    </>
  );
}

function GuestNav({ onClose }: { onClose?: () => void }) {
  return (
    <>
      <div className="hidden sm:flex items-center gap-2">
        <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
        <Link to="/signup" className="btn-primary text-sm">Get started</Link>
      </div>
      <div className="sm:hidden space-y-2">
        <Link to="/login" onClick={onClose} className="btn-primary w-full justify-center">Sign in</Link>
        <Link to="/signup" onClick={onClose} className="btn-secondary w-full justify-center">Create account</Link>
      </div>
    </>
  );
}

function ThemeToggle() {
  const { preference, setTheme } = useTheme();

  const cycle = () => {
    if (preference === "light") setTheme("dark");
    else if (preference === "dark") setTheme("system");
    else setTheme("light");
  };

  const label = preference === "system" ? "System theme" : preference === "dark" ? "Dark mode" : "Light mode";
  const Icon = preference === "dark" ? MoonIcon : preference === "system" ? ComputerDesktopIcon : SunIcon;

  return (
    <button onClick={cycle} className="btn-ghost p-2" aria-label={label} title={label}>
      <Icon className="w-5 h-5" />
    </button>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMobile();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass">
        <div className="wrapper h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl font-semibold tracking-tight text-primary hover:text-sage transition-colors">
            mise
          </Link>
          <nav className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <Authenticated><UserMenu /></Authenticated>
            <Unauthenticated><GuestNav /></Unauthenticated>
          </nav>
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-cream-dark dark:hover:bg-d-surface-raised rounded-lg transition-colors" aria-label="Open menu" aria-expanded={mobileOpen} aria-controls="mobile-menu">
              <Bars3Icon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-charcoal/30 backdrop-blur-sm sm:hidden" aria-hidden="true" onClick={() => setMobileOpen(false)} />
      )}

      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-warm-white shadow-hover flex flex-col sm:hidden transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-cream-dark">
          <span className="font-serif text-xl font-semibold text-primary">mise</span>
          <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-cream-dark dark:hover:bg-d-surface-raised rounded-lg" aria-label="Close menu">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-5 space-y-1">
          <Authenticated><UserMenu onClose={closeMobile} /></Authenticated>
          <Unauthenticated><GuestNav onClose={closeMobile} /></Unauthenticated>
        </nav>
        <div className="p-5 border-t border-cream-dark">
          <nav className="flex gap-4 text-sm text-stone">
            {FOOTER_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="hover:text-primary transition-colors">{label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
