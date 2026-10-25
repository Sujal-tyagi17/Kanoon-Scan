"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

interface TopBarProps {
  title?: string;
  onMenuClick?: () => void;
  showScanButton?: boolean;
}

export default function TopBar({ title, onMenuClick, showScanButton = true }: TopBarProps) {
  return (
    <header className="h-16 border-b border-outline-variant bg-surface/80 backdrop-blur-md px-4 sm:px-8 flex justify-between items-center sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden p-2 -ml-2 rounded-lg text-on-surface-variant hover:bg-surface-variant focus-ring"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        {title && <h1 className="font-display text-xl font-bold text-on-surface truncate">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {showScanButton && (
          <Link href="/scan" className="btn-primary !px-4 !py-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">New Scan</span>
          </Link>
        )}
        <SignOutButton redirectUrl="/">
          <button className="btn-secondary !px-4 !py-2" aria-label="Log out">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </SignOutButton>
      </div>
    </header>
  );
}
