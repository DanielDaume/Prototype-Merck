"use client";

import Link from "next/link";
import { Bell, Bookmark } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { useToast } from "@/components/providers/ToastProvider";

export function Topbar() {
  const { toast } = useToast();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3">
        <GlobalSearch className="flex-1" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-muted hover:bg-bg hover:text-navy"
            onClick={() => toast("Available in production version")}
          >
            <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
          </button>
          <Link
            href="/saved"
            aria-label="Saved"
            className="rounded-lg p-2 text-muted hover:bg-bg hover:text-navy"
          >
            <Bookmark className="h-[18px] w-[18px]" />
          </Link>
          <div
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
            title="Christina H."
          >
            CH
          </div>
        </div>
      </div>
    </header>
  );
}
