"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";

export default function TopBar() {
  const { user } = useUser();
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.username || "Legal Counsel";

  return (
    <header className="h-16 border-b border-outline-variant bg-surface/70 backdrop-blur-md px-8 flex justify-between items-center sticky top-0 z-40">
      {/* Title & Badge */}
      <div className="flex items-center gap-2">
        <h2 className="font-headline-md text-headline-md font-extrabold text-primary">KanoonScan</h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-gutter">
        {/* Search */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
            search
          </span>
          <input
            className="bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface"
            placeholder="Search documents, clauses..."
            type="text"
          />
        </div>

        {/* Notifications & SignOut */}
        <div className="flex items-center gap-stack-md">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-variant rounded-lg">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-8 w-px bg-outline-variant mx-2 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-3">
            <SignOutButton redirectUrl="/">
              <button className="bg-gradient-to-r from-primary-container to-primary px-4 py-2 text-xs font-label-caps text-[#452b00] font-bold rounded-DEFAULT hover:opacity-90 active:scale-95 transition-all">
                Logout
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </header>
  );
}
