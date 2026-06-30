"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import Logo from "../Logo";

const navLinks = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/vault", icon: "inventory_2", label: "Document Vault" },
  { href: "/scan", icon: "description", label: "Scan New Document" },
  { href: "/dashboard/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  // Get user display name
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.username || "User";

  return (
    <aside className="w-60 bg-surface-container border-r border-outline-variant flex flex-col shrink-0 h-screen p-base space-y-stack-md z-40">
      {/* Logo */}
      <div className="px-2 py-4 mb-4 flex items-center gap-3">
        <Logo className="w-10 h-10" />
        <div>
          <h1 className="text-md font-extrabold text-primary leading-tight">KanoonScan</h1>
          <p className="text-[10px] uppercase tracking-widest text-outline">Institutional Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all translate-x-1 hover:translate-x-2 ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              <span 
                className="material-symbols-outlined text-[22px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {link.icon}
              </span>
              <span className="font-body-md">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="pt-4 border-t border-outline-variant">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-surface-container-low border border-outline-variant">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-9 rounded-full",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-on-surface">{displayName}</p>
            <p className="text-xs text-outline truncate">{user?.primaryEmailAddress?.emailAddress || "Free Plan"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
