import Link from "next/link";
import { Activity, ClipboardCheck, Shield, Webhook } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { CabWorkspaceClient } from "@/components/cab/CabWorkspaceClient";

export const dynamic = "force-dynamic";

export default async function CabWorkspacePage() {
  const [changes, openReviews, ruleCount, hookCount] = await Promise.all([
    prisma.cabChange.findMany({
      include: { agent: true },
      orderBy: [{ submittedAt: "desc" }],
    }),
    prisma.reviewItem.count({ where: { status: { in: ["OPEN", "DUE_SOON", "OVERDUE"] } } }),
    prisma.rule.count(),
    prisma.hook.count(),
  ]);

  return (
    <div>
      <PageHeader
        title="CAB Workspace"
        description="AI change and governance reviews requiring attention."
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/rules", label: "Rules & Guardrails", icon: Shield, hint: `${ruleCount} active policies` },
          { href: "/hooks", label: "Hooks", icon: Webhook, hint: `${hookCount} lifecycle automations` },
          { href: "/reviews", label: "Reviews", icon: ClipboardCheck, hint: `${openReviews} open reviews` },
          { href: "/activity", label: "Activity", icon: Activity, hint: "Audit & change history" },
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

      <CabWorkspaceClient
        changes={changes.map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          changeSummary: c.changeSummary,
          changeType: c.changeType,
          riskImpact: c.riskImpact,
          submittedBy: c.submittedBy,
          reviewGroup: c.reviewGroup,
          status: c.status,
          submittedAt: c.submittedAt.toISOString(),
          agent: c.agent
            ? {
                name: c.agent.name,
                slug: c.agent.slug,
              }
            : null,
        }))}
      />
    </div>
  );
}
