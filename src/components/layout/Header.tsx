import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "convex/_generated/api";
import { HomeLink } from "@/components/ui/Layout";
import { NotificationBell } from "@/components/social/Notifications";
import { Menu } from "@base-ui-components/react/menu";
import { HomeIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export function Header() {
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 w-full z-50 glass">
      <div className="wrapper h-16 flex items-center justify-between">
        <HomeLink className="font-serif text-2xl font-semibold tracking-tight text-charcoal hover:text-sage transition-colors">
          mise
        </HomeLink>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Menu.Root>
              <Menu.Trigger className="btn-ghost text-sm flex items-center gap-2">
                {user.profileImageUrl || user.image ? (
                  <img src={user.profileImageUrl || user.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center text-sage text-xs font-medium">
                    {user.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <span className="hidden sm:inline">{user.name?.split(" ")[0] || "Menu"}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </Menu.Trigger>

              <Menu.Portal>
                <Menu.Positioner className="z-50" sideOffset={8} align="end">
                  <Menu.Popup className="min-w-[180px] bg-warm-white rounded-lg shadow-card border border-cream-dark py-1">
                    <Menu.Item
                      className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-cream-dark outline-none cursor-pointer data-[highlighted]:bg-cream-dark"
                      render={<Link to="/dashboard" />}
                    >
                      <HomeIcon className="w-4 h-4" />
                      Dashboard
                    </Menu.Item>
                    <Menu.Item
                      className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-cream-dark outline-none cursor-pointer data-[highlighted]:bg-cream-dark"
                      render={<Link to="/settings" />}
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
                      Settings
                    </Menu.Item>
                    <Menu.Separator className="h-px bg-cream-dark my-1" />
                    <Menu.Item
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-terracotta hover:bg-cream-dark outline-none cursor-pointer data-[highlighted]:bg-cream-dark"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign out
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
            </>
          ) : user === null ? (
            <Link to="/login" className="btn-ghost text-sm hidden sm:flex">Sign in</Link>
          ) : null}
          <Link to="/dashboard/create" className="btn-primary text-sm">
            <PlusIcon className="w-4 h-4" />
            New Recipe
          </Link>
        </nav>
      </div>
    </header>
  );
}
