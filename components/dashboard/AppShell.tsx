"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AppShellProps {
  title: string;
  children: React.ReactNode;
  showScanButton?: boolean;
}

export default function AppShell({ title, children, showScanButton = true }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar min-w-0">
        <TopBar title={title} onMenuClick={() => setMenuOpen(true)} showScanButton={showScanButton} />
        {children}
      </main>
    </div>
  );
}
