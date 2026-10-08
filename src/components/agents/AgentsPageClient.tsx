"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Boxes, Plus, Search, Server, Sparkles, Bookmark } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CertificationBadge } from "@/components/ui/CertificationBadge";
import { AccessBadge } from "@/components/ui/AccessBadge";
import { LifecycleBadge } from "@/components/ui/LifecycleBadge";
import { UsagePolicyBadge } from "@/components/ui/UsagePolicyBadge";
import { useToast } from "@/components/providers/ToastProvider";
import type { AccessLevel, LifecycleStage, RiskLevel } from "@prisma/client";

type AgentListItem = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  businessCapability: string;
  businessArea: string;
  tags: string;
  rating: number;
  platform: string;
  riskLevel: RiskLevel;
  certified: boolean;
  saved: boolean;
  lifecycleStage: LifecycleStage;
  accessLevel: AccessLevel;
  usagePolicy: string;
  businessOwner: string;
  monthlyCost: string | null;
};

export function AgentsPageClient({ agents }: { agents: AgentListItem[] }) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>(
    Object.fromEntries(agents.map((a) => [a.id, a.saved]))
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        a.platform.toLowerCase().includes(q) ||
        a.tags.toLowerCase().includes(q) ||
        a.businessCapability.toLowerCase().includes(q)
    );
  }, [agents, query]);

  const toggleSave = async (agent: AgentListItem) => {
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType: "AGENT",
          assetId: agent.id,
          assetSlug: agent.slug,
          assetName: agent.name,
        }),
      });
      const data = await res.json();
      setSavedMap((prev) => ({ ...prev, [agent.id]: Boolean(data.saved) }));
      toast(data.saved ? "Saved to your list" : "Removed from saved", "success");
    } catch {
      toast("Could not update saved item", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Agents"
        description="Discover reusable AI agents across platforms and business areas."
        actions={
          <Link
            href="/agents/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Register agent
          </Link>
        }
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/agent-products", label: "Agent Products", icon: Boxes, hint: "Composed capabilities" },
          { href: "/mcp-servers", label: "MCP Servers", icon: Server, hint: "Tools & integrations" },
          { href: "/skills", label: "Skills", icon: Sparkles, hint: "Reusable building blocks" },
          { href: "/guides", label: "Guides", icon: BookOpen, hint: "How-to & checklists" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center gap-3 rounded-[10px] border border-border bg-white px-3 py-2.5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-navy">{s.label}</div>
                <div className="text-[11px] text-muted">{s.hint}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter agents..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((agent) => (
          <div
            key={agent.id}
            className="group relative rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <Link href={`/agents/${agent.slug}`} className="absolute inset-0 z-0 rounded-[12px]" aria-label={agent.name} />
            <div className="relative z-10 pointer-events-none">
              <div className="mb-1 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold text-navy group-hover:text-primary">{agent.name}</h3>
                  <p className="mt-1 text-[12px] text-muted">
                    {agent.businessCapability} · {agent.businessArea}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={savedMap[agent.id] ? "Remove bookmark" : "Save"}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSave(agent);
                  }}
                  className="pointer-events-auto rounded-md p-1.5 text-muted hover:bg-bg hover:text-primary"
                >
                  <Bookmark className={`h-4 w-4 ${savedMap[agent.id] ? "fill-primary text-primary" : ""}`} />
                </button>
              </div>
              <p className="mb-3 line-clamp-2 text-[13px] text-[#4A5568]">{agent.shortDescription}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <LifecycleBadge stage={agent.lifecycleStage} />
                <RiskBadge level={agent.riskLevel} />
                <CertificationBadge certified={agent.certified} />
                <AccessBadge level={agent.accessLevel} />
                <UsagePolicyBadge policy={agent.usagePolicy} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-[12px] text-muted">
                <span className="font-medium text-navy">{agent.platform}</span>
                <span>Owner {agent.businessOwner}</span>
                {agent.monthlyCost ? <span>{agent.monthlyCost}</span> : null}
                {agent.rating > 0 ? <StatusBadge tone="amber">{agent.rating.toFixed(1)} ★</StatusBadge> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
