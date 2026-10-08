"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bot,
  Boxes,
  Briefcase,
  Server,
  Sparkles,
  Shield,
  BookOpen,
  Webhook,
  Loader2,
  Grid3X3,
  Package,
  BookMarked,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { assetTypeLabels } from "@/lib/labels";

type SearchResult = {
  type:
    | "AGENT"
    | "AGENT_PRODUCT"
    | "USE_CASE"
    | "MCP_SERVER"
    | "SKILL"
    | "RULE"
    | "GUIDE"
    | "HOOK"
    | "DATA_ASSET"
    | "DATA_PRODUCT"
    | "GLOSSARY_TERM"
    | "DATA_DOMAIN";
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  href: string;
};

const icons = {
  AGENT: Bot,
  AGENT_PRODUCT: Boxes,
  USE_CASE: Briefcase,
  MCP_SERVER: Server,
  SKILL: Sparkles,
  RULE: Shield,
  GUIDE: BookOpen,
  HOOK: Webhook,
  DATA_ASSET: Grid3X3,
  DATA_PRODUCT: Package,
  GLOSSARY_TERM: BookMarked,
  DATA_DOMAIN: Target,
};

export function GlobalSearch({
  className,
  large = false,
  placeholder = "Search agents, MCP servers, skills...",
}: {
  className?: string;
  large?: boolean;
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => window.clearTimeout(handle);
  }, [query]);

  const hint = useMemo(() => (typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "⌘K" : "Ctrl K"), []);

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-white shadow-sm",
          large ? "h-12 px-4" : "h-10 px-3"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted"
        />
        {!large ? (
          <kbd className="hidden rounded border border-border bg-bg px-1.5 py-0.5 text-[10px] text-muted sm:inline">
            {hint}
          </kbd>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (query.trim()) router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark",
            large && "px-4 py-2 text-sm"
          )}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          Search
        </button>
      </div>

      {open && query.trim() ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[12px] border border-border bg-white shadow-xl">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-6 text-center text-sm text-muted">No matching assets found.</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((r) => {
                const Icon = icons[r.type];
                return (
                  <li key={`${r.type}-${r.id}`}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-bg"
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                        router.push(r.href);
                      }}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-navy">{r.name}</span>
                          <span className="rounded bg-[#EEF2F6] px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted">
                            {assetTypeLabels[r.type]}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted">{r.shortDescription}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
