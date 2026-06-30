"use client";

import { useUser } from "@clerk/nextjs";

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
        <span className="bg-primary-container/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest border border-primary/30 uppercase ml-2 animate-pulse">
          Intelligence
        </span>
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

        {/* Notifications & User Info */}
        <div className="flex items-center gap-stack-md">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-variant rounded-lg">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-8 w-px bg-outline-variant mx-2 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-on-surface">{displayName}</p>
              <p className="text-[10px] text-outline">Legal Professional</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
