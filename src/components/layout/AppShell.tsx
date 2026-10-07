"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("aac-sidebar-collapsed");
    if (stored === "1") setCollapsed(true);

    const onResize = () => {
      if (window.innerWidth < 1280) setCollapsed(true);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem("aac-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className={cn("transition-all duration-200", collapsed ? "pl-[68px]" : "pl-[240px]")}>
        <Topbar />
        <main className="px-4 py-5 md:px-6">
          <div className="mx-auto w-full max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
