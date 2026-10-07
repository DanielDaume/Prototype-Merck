import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { BrowseClient, type BrowseItem } from "@/components/browse/BrowseClient";
import {
  accessLabels,
  assessmentLabels,
  businessAreaLabels,
  lifecycleLabels,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const [agents, mcps, skills, rules, guides, hooks] = await Promise.all([
    prisma.agent.findMany({ orderBy: { rating: "desc" } }),
    prisma.mcpServer.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.skill.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.rule.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.guide.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.hook.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  const items: BrowseItem[] = [
    ...agents.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      type: "AGENT" as const,
      typeLabel: "AI Agent",
      href: `/agents/${a.slug}`,
      subtitle: `${a.businessCapability} · ${businessAreaLabels[a.businessArea]}`,
      description: a.shortDescription,
      tags: a.tags,
      rating: a.rating,
      platform: a.platform,
      riskLevel: a.riskLevel,
      certified: a.certified,
      businessArea: businessAreaLabels[a.businessArea],
      lifecycle: lifecycleLabels[a.lifecycleStage],
      access: accessLabels[a.accessLevel],
      trust: a.certified
        ? "Certified"
        : a.riskAssessmentStatus === "ASSESSED"
          ? "Assessed"
          : "Verification pending",
      updatedAt: a.updatedAt.toISOString(),
      monthlyRuns: a.monthlyRuns,
    })),
    ...mcps.map((m) => ({
      id: m.id,
      slug: m.slug,
      name: m.name,
      type: "MCP_SERVER" as const,
      typeLabel: "MCP Server",
      href: `/mcp-servers/${m.slug}`,
      subtitle: `${m.origin} · ${m.status}`,
      description: m.shortDescription,
      tags: m.tags,
      platform: m.platform || undefined,
      riskLevel: m.riskLevel,
      businessArea: undefined,
      lifecycle: m.status,
      access: undefined,
      trust: assessmentLabels[m.riskLevel === "NOT_ASSESSED" ? "PENDING" : "ASSESSED"] === "Assessed" ? "Assessed" : "Verification pending",
      updatedAt: m.updatedAt.toISOString(),
    })),
    ...skills.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      type: "SKILL" as const,
      typeLabel: "Skill",
      href: `/skills/${s.slug}`,
      subtitle: `${s.category} · ${s.status}`,
      description: s.shortDescription,
      tags: s.tags,
      updatedAt: s.updatedAt.toISOString(),
      trust: s.status === "Production" ? "Assessed" : "Verification pending",
    })),
    ...rules.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      type: "RULE" as const,
      typeLabel: "Rule",
      href: `/rules/${r.slug}`,
      subtitle: `${r.policyCategory} · ${r.status}`,
      description: r.shortDescription,
      tags: r.tags,
      updatedAt: r.updatedAt.toISOString(),
      trust: "Assessed",
    })),
    ...guides.map((g) => ({
      id: g.id,
      slug: g.slug,
      name: g.name,
      type: "GUIDE" as const,
      typeLabel: "Guide",
      href: `/guides/${g.slug}`,
      subtitle: `${g.category} · ${g.audience}`,
      description: g.shortDescription,
      tags: g.tags,
      updatedAt: g.updatedAt.toISOString(),
    })),
    ...hooks.map((h) => ({
      id: h.id,
      slug: h.slug,
      name: h.name,
      type: "HOOK" as const,
      typeLabel: "Hook",
      href: `/hooks/${h.slug}`,
      subtitle: `${h.scope} · ${h.status}`,
      description: h.shortDescription,
      tags: h.tags,
      updatedAt: h.updatedAt.toISOString(),
    })),
  ];

  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading browse…</div>}>
      <BrowseClient items={items} />
    </Suspense>
  );
}
