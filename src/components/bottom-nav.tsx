"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Library, User, PenTool, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { getUserRole } from "@/lib/user-utils";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AuthModal } from "@/components/auth-modal";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  showForRoles?: string[];
  badge?: boolean;
  isSignIn?: boolean;
}

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Hide bottom nav on chapter reading pages and offline reading pages
  const isReadingPage =
    pathname.match(/\/novels\/[^/]+\/chapters\/\d+/) ||
    pathname.match(/\/offline\/read\/\d+/);

  if (isReadingPage) {
    return null;
  }

  const navItems: NavItem[] = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/search",
      label: "Browse",
      icon: Search,
    },
    {
      href: "/library",
      label: "Library",
      icon: Library,
      requiresAuth: true,
    },
    {
      href: "/profile/downloads",
      label: "Downloads",
      icon: Download,
      requiresAuth: true,
    },
  ];

  // Filter nav items based on authentication and roles
  const filteredNavItems = navItems.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }
    if (item.showForRoles && user) {
      const userRole = getUserRole(user);
      return item.showForRoles.includes(userRole);
    }
    if (item.showForRoles && !user) {
      return false;
    }
    return true;
  });

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/93 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          const isProfileIcon = item.icon === User && isAuthenticated && user;

          const content = (
            <>
              <div className="relative">
                {isProfileIcon ? (
                  <div
                    className={cn(
                      "transition-opacity",
                      active && "opacity-100",
                    )}
                  >
                    <UserAvatar user={user} size="sm" showBadge={true} />
                    {item.badge && (
                      <div className="absolute -top-0.5 -right-0.5">
                        <Badge
                          variant="destructive"
                          className="flex h-2 w-2 items-center justify-center p-0"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Icon className="h-5 w-5" />
                    {item.badge && (
                      <div className="absolute -top-1 -right-1">
                        <Badge
                          variant="destructive"
                          className="flex h-2 w-2 items-center justify-center p-0"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              <span
                className={cn("text-xs font-medium", active && "font-semibold")}
              >
                {item.label}
              </span>
            </>
          );

          if (item.isSignIn) {
            return (
              <AuthModal
                key={item.href}
                defaultTab="signin"
                trigger={
                  <button
                    className={cn(
                      "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 transition-colors",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {content}
                  </button>
                }
              />
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-0 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
