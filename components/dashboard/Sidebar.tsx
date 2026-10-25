"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import Logo from "../Logo";

const navLinks = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard", exact: true },
  { href: "/scan", icon: "document_scanner", label: "New Scan" },
  { href: "/vault", icon: "inventory_2", label: "Document Vault" },
  { href: "/dashboard/settings", icon: "settings", label: "Settings" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Your account";

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface-container border-r border-outline-variant flex flex-col shrink-0 h-screen p-4 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="px-2 py-3 mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <Logo className="w-10 h-10" />
            <div>
              <p className="font-display text-lg font-bold text-primary leading-tight">KanoonScan</p>
              <p className="text-[10px] uppercase tracking-widest text-outline">Know Before You Sign</p>
            </div>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant focus-ring"
            onClick={onClose}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors focus-ring ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="pt-4 border-t border-outline-variant">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-surface-container-low border border-outline-variant">
            <UserButton appearance={{ elements: { avatarBox: "size-9 rounded-full" } }} />
            <div className="flex-1 min-w-0">
              {isLoaded ? (
                <>
                  <p className="text-sm font-semibold truncate text-on-surface">{displayName}</p>
                  <p className="text-xs text-outline truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                </>
              ) : (
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-surface-variant animate-pulse" />
                  <div className="h-2.5 w-32 rounded bg-surface-variant/60 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
