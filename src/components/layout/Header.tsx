import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  Cog6ToothIcon,
  HomeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Primitives";
import { useSignOut } from "@/hooks/useSignOut";
import { nextTheme, themeOption, useTheme } from "@/hooks/useTheme";
import { FOOTER_LINKS } from "@/lib/constants";

const NAV_LINKS = [
  { to: "/", label: "Recipes", exact: true },
  { to: "/about", label: "About", exact: true },
] as const;

const USER_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { to: "/settings", label: "Settings", icon: Cog6ToothIcon },
] as const;

function ThemeToggle() {
  const { preference, setTheme } = useTheme();
  const { ariaLabel, icon: Icon } = themeOption(preference);

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme(preference))}
      className="icon-btn"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Icon className="size-5" />
    </button>
  );
}

function DesktopUserMenu() {
  const user = useQuery(api.users.currentUser);
  const signOut = useSignOut();

  return (
    <Menu.Root>
      <Menu.Trigger className="btn-ghost gap-2 pl-1.5">
        <Avatar src={user?.profileImageUrl} name={user?.name} size="sm" />
        <span className="hidden max-w-28 truncate lg:inline">
          {user?.name?.split(" ")[0] ?? user?.username ?? "Chef"}
        </span>
        <ChevronDownIcon className="size-4 shrink-0" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="z-50" sideOffset={8} align="end">
          <Menu.Popup className="min-w-56 animate-scale-in rounded-xl border border-line bg-surface p-1.5 shadow-lift">
            <div className="flex items-center gap-3 border-b border-line px-3 py-2.5">
              <Avatar src={user?.profileImageUrl} name={user?.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{user?.name ?? "Chef"}</p>
                {user?.username && <p className="truncate text-xs text-muted">@{user.username}</p>}
              </div>
            </div>
            {USER_LINKS.map(({ to, label, icon: Icon }) => (
              <Menu.Item key={to} className="menu-item" render={<Link to={to} />}>
                <Icon className="size-4 text-muted" />
                {label}
              </Menu.Item>
            ))}
            <Menu.Separator className="my-1 h-px bg-line" />
            <Menu.Item
              onClick={() => void signOut()}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm text-clay outline-none transition-colors hover:bg-clay-soft data-[highlighted]:bg-clay-soft"
            >
              <ArrowRightOnRectangleIcon className="size-4" />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function DesktopGuestActions() {
  return (
    <div className="flex items-center gap-1.5">
      <Link to="/login" className="btn-ghost">
        Sign in
      </Link>
      <Link to="/signup" className="btn-primary btn-sm">
        Start cooking
      </Link>
    </div>
  );
}

function MobileUserMenu({ onNavigate }: { onNavigate: () => void }) {
  const user = useQuery(api.users.currentUser);
  const signOut = useSignOut();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
        <Avatar src={user?.profileImageUrl} name={user?.name} size="md" />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{user?.name ?? "Chef"}</p>
          {user?.username && <p className="truncate text-xs text-muted">@{user.username}</p>}
        </div>
      </div>

      <nav className="space-y-1" aria-label="Account">
        {USER_LINKS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            <Icon className="size-5 text-muted" />
            {label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => {
          onNavigate();
          void signOut();
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-clay transition-colors hover:bg-clay-soft"
      >
        <ArrowRightOnRectangleIcon className="size-5" />
        Sign out
      </button>
    </div>
  );
}

function MobileGuestMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="space-y-2">
      <Link to="/login" onClick={onNavigate} className="btn-secondary w-full">
        Sign in
      </Link>
      <Link to="/signup" onClick={onNavigate} className="btn-primary w-full">
        Start cooking
      </Link>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);

  return (
    <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
      <a
        href="#main"
        className="sr-only z-[60] rounded-lg bg-ink px-4 py-2 text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
            Mise
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.exact }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
                activeProps={{ className: "bg-surface-2 text-ink" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-1.5 md:flex">
            <ThemeToggle />
            <Authenticated>
              <DesktopUserMenu />
            </Authenticated>
            <Unauthenticated>
              <DesktopGuestActions />
            </Unauthenticated>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button type="button" onClick={() => setMobileOpen(true)} className="icon-btn" aria-label="Open menu">
              <Bars3Icon className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 md:hidden" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] flex-col border-l border-line bg-canvas transition-transform duration-300 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full md:hidden">
          <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <span className="font-display text-xl font-semibold">Mise</span>
            <Dialog.Close className="icon-btn" aria-label="Close menu">
              <XMarkIcon className="size-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <nav className="mb-8 space-y-1" aria-label="Main">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
                  activeProps={{ className: "bg-surface-2 text-ink" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Authenticated>
              <MobileUserMenu onNavigate={closeMenu} />
            </Authenticated>
            <Unauthenticated>
              <MobileGuestMenu onNavigate={closeMenu} />
            </Unauthenticated>
          </div>

          <div className="border-t border-line p-5">
            <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.to} to={link.to} onClick={closeMenu} className="link-muted text-xs">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
