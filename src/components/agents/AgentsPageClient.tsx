"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AssetCard } from "@/components/cards/AssetCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { RegisterAgentModal } from "@/components/modals/RegisterAgentModal";
import { useToast } from "@/components/providers/ToastProvider";
import type { RiskLevel } from "@prisma/client";

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
};

export function AgentsPageClient({ agents }: { agents: AgentListItem[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
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
        a.tags.toLowerCase().includes(q)
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
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Register agent
          </button>
        }
      />

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
          <AssetCard
            key={agent.id}
            href={`/agents/${agent.slug}`}
            name={agent.name}
            typeLabel="AI Agent"
            subtitle={`${agent.businessCapability} · ${agent.businessArea}`}
            description={agent.shortDescription}
            tags={agent.tags}
            rating={agent.rating}
            platform={agent.platform}
            riskLevel={agent.riskLevel}
            certified={agent.certified}
            saved={savedMap[agent.id]}
            onToggleSave={() => toggleSave(agent)}
          />
        ))}
      </div>

      <RegisterAgentModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
