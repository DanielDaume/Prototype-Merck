"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";

export function SaveButton({
  assetType,
  assetId,
  assetSlug,
  assetName,
  initiallySaved = false,
  className,
}: {
  assetType: string;
  assetId: string;
  assetSlug: string;
  assetName: string;
  initiallySaved?: boolean;
  className?: string;
}) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetType, assetId, assetSlug, assetName }),
      });
      const data = await res.json();
      setSaved(Boolean(data.saved));
      toast(data.saved ? "Saved to your list" : "Removed from saved", "success");
    } catch {
      toast("Could not update saved item", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      aria-label={saved ? "Remove bookmark" : "Save"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-navy hover:bg-bg disabled:opacity-60",
        className
      )}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
