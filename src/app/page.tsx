import Link from "next/link";
import {
  BadgeCheck,
  Bot,
  Boxes,
  Layers,
  Server,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/cards/StatCard";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CertificationBadge } from "@/components/ui/CertificationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { businessAreaLabels, capabilityCategories } from "@/lib/labels";
import { formatNumber, parseTags, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    agents,
    mcpCount,
    productCount,
    platforms,
    featured,
    recent,
    riskGroups,
    lifecycleGroups,
    assessmentGroups,
    reuseCandidates,
  ] = await Promise.all([
    prisma.agent.findMany(),
    prisma.mcpServer.count(),
    prisma.agentProduct.count(),
    prisma.platformSource.count(),
    prisma.agent.findMany({
      where: { featured: true },
      orderBy: { rating: "desc" },
      take: 3,
    }),
    prisma.agent.findMany({ orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.agent.groupBy({ by: ["riskLevel"], _count: true }),
    prisma.agent.groupBy({ by: ["lifecycleStage"], _count: true }),
    prisma.agent.groupBy({ by: ["riskAssessmentStatus"], _count: true }),
    Promise.all([
      prisma.agent.findUnique({ where: { slug: "invoice-triage-agent" } }),
      prisma.agentProduct.findUnique({ where: { slug: "finance-operations-assistant" } }),
      prisma.agent.findUnique({ where: { slug: "vendor-matching-agent" } }),
    ]),
  ]);

  const certified = agents.filter((a) => a.certified).length;
  const total = agents.length || 1;

  const riskMap = Object.fromEntries(riskGroups.map((g) => [g.riskLevel, g._count]));
  const lifeMap = Object.fromEntries(lifecycleGroups.map((g) => [g.lifecycleStage, g._count]));
  const assessMap = Object.fromEntries(assessmentGroups.map((g) => [g.riskAssessmentStatus, g._count]));

  const [invoiceAgent, financeProduct, vendorAgent] = reuseCandidates;
  const reuseItems = [
    invoiceAgent
      ? {
          kind: "agent" as const,
          href: `/agents/${invoiceAgent.slug}`,
          name: invoiceAgent.name,
          description: invoiceAgent.shortDescription,
          meta: invoiceAgent.platform,
          riskLevel: invoiceAgent.riskLevel,
          certified: invoiceAgent.certified,
        }
      : null,
    financeProduct
      ? {
          kind: "product" as const,
          href: `/agent-products/${financeProduct.slug}`,
          name: financeProduct.name,
          description: financeProduct.shortDescription,
          meta: financeProduct.platform || "Agent Product",
          riskLevel: financeProduct.riskLevel,
          certified: financeProduct.certified,
        }
      : null,
    vendorAgent
      ? {
          kind: "agent" as const,
          href: `/agents/${vendorAgent.slug}`,
          name: vendorAgent.name,
          description: vendorAgent.shortDescription,
          meta: vendorAgent.platform,
          riskLevel: vendorAgent.riskLevel,
          certified: vendorAgent.certified,
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <section className="rounded-[14px] border border-border bg-white px-6 py-7 shadow-sm">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted">
          Prototype — demo data
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-navy">AI Agent Central</h1>
        <p className="mt-1 text-sm text-muted">Discover, assess and reuse enterprise AI capabilities.</p>
        <p className="mt-1 text-[13px] text-[#4A5568]">
          One place to discover and reuse AI capabilities.
        </p>
        <div className="mt-5 max-w-3xl">
          <GlobalSearch
            large
            placeholder="Search for invoice automation, clinical research, SAP knowledge..."
          />
          <p className="mt-2 text-[12px] text-muted">What do you want to accomplish?</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[12px]">
          <Link href="/agent-products" className="font-medium text-primary hover:underline">
            Browse agent products
          </Link>
          <span className="text-border">·</span>
          <Link href="/platforms" className="font-medium text-primary hover:underline">
            Platforms & coverage
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Featured agents</h2>
            <p className="text-sm text-muted">Trusted starting points for discovery and reuse.</p>
          </div>
          <Link href="/agents" className="text-sm font-medium text-primary hover:underline">
            View all agents
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {featured.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.slug}`}
              className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-[17px] font-semibold text-navy">{agent.name}</h3>
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {agent.rating.toFixed(1)}
                </span>
              </div>
              <p className="mb-3 line-clamp-2 text-[13px] text-[#4A5568]">{agent.shortDescription}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {parseTags(agent.tags).slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                <span className="font-medium text-navy">{agent.platform}</span>
                <span className="text-muted">{businessAreaLabels[agent.businessArea]}</span>
                <RiskBadge level={agent.riskLevel} />
                <CertificationBadge certified={agent.certified} />
              </div>
              <div className="mt-3 border-t border-border pt-3 text-[12px] text-muted">
                Owner {agent.businessOwner} · {formatNumber(agent.monthlyRuns)} runs / month
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Reuse before build</h2>
            <p className="text-sm text-muted">
              Check whether a reusable capability already exists before creating a new agent.
            </p>
          </div>
          <Link href="/agent-products" className="text-sm font-medium text-primary hover:underline">
            View products
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {reuseItems.map((item) =>
            item ? (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <StatusBadge tone={item.kind === "product" ? "purple" : "blue"}>
                    {item.kind === "product" ? "Agent Product" : "AI Agent"}
                  </StatusBadge>
                </div>
                <h3 className="text-[16px] font-semibold text-navy">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-[13px] text-[#4A5568]">{item.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="font-medium text-navy">{item.meta}</span>
                  <RiskBadge level={item.riskLevel} />
                  <CertificationBadge certified={item.certified} />
                </div>
              </Link>
            ) : null
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold text-navy">Browse by capability</h2>
        <p className="mb-3 text-sm text-muted">Start from a business outcome, not a platform.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilityCategories.map((cat) => {
            const count = agents.filter((a) => a.capabilityCategory === cat).length;
            return (
              <Link
                key={cat}
                href={`/browse?capability=${encodeURIComponent(cat)}`}
                className="rounded-[12px] border border-border bg-white px-4 py-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <div className="text-sm font-semibold text-navy">{cat}</div>
                <div className="mt-1 text-[12px] text-muted">{count} assets</div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-navy">Recently updated</h2>
          <ul className="divide-y divide-border">
            {recent.map((agent) => (
              <li key={agent.id}>
                <Link href={`/agents/${agent.slug}`} className="flex items-center justify-between gap-3 py-3 hover:bg-bg/60">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-navy">{agent.name}</div>
                    <div className="text-[12px] text-muted">
                      {agent.platform} · {businessAreaLabels[agent.businessArea]}
                    </div>
                  </div>
                  <div className="shrink-0 text-[12px] text-muted">{relativeTime(agent.updatedAt)}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Governance overview</h2>
            <Link href="/platforms" className="text-[12px] font-medium text-primary hover:underline">
              Coverage
            </Link>
          </div>
          <div className="space-y-4">
            <BarGroup
              title="Risk"
              items={[
                { label: "Low", value: riskMap.LOW || 0, color: "bg-success" },
                { label: "Medium", value: riskMap.MEDIUM || 0, color: "bg-warning" },
                { label: "High", value: riskMap.HIGH || 0, color: "bg-danger" },
              ]}
              total={total}
            />
            <BarGroup
              title="Lifecycle"
              items={[
                { label: "Pilot", value: lifeMap.PILOT || 0, color: "bg-primary" },
                { label: "Production", value: lifeMap.PRODUCTION || 0, color: "bg-accent" },
                { label: "Retiring", value: lifeMap.RETIRING || 0, color: "bg-warning" },
              ]}
              total={total}
            />
            <BarGroup
              title="Assessment"
              items={[
                { label: "Assessed", value: assessMap.ASSESSED || 0, color: "bg-success" },
                { label: "Pending", value: assessMap.PENDING || 0, color: "bg-warning" },
                { label: "Expired", value: assessMap.EXPIRED || 0, color: "bg-danger" },
              ]}
              total={total}
            />
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-semibold text-navy">Repository snapshot</h2>
            <p className="text-[12px] text-muted">Modest counts for orientation — not a live ops dashboard.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="AI Agents" value={agents.length} icon={Bot} />
          <StatCard label="Agent Products" value={productCount} icon={Boxes} />
          <StatCard label="MCP Servers" value={mcpCount} icon={Server} />
          <StatCard label="Certified Agents" value={certified} icon={BadgeCheck} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted">
          <Layers className="h-3.5 w-3.5" />
          <span>{platforms} platform sources tracked</span>
          <span>·</span>
          <Link href="/platforms" className="font-medium text-primary hover:underline">
            View coverage
          </Link>
        </div>
      </section>
    </div>
  );
}

function BarGroup({
  title,
  items,
  total,
}: {
  title: string;
  items: { label: string; value: number; color: string }[];
  total: number;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-0.5 flex justify-between text-[11px]">
              <span className="text-navy">{item.label}</span>
              <span className="text-muted">{item.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF2F6]">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${Math.max(4, (item.value / total) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
