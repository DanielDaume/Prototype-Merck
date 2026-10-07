import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function HooksPage() {
  const hooks = await prisma.hook.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Hooks"
        description="Automated actions triggered by lifecycle, governance and runtime events."
      />
      <div className="space-y-3">
        {hooks.map((hook) => (
          <Link
            key={hook.id}
            href={`/hooks/${hook.slug}`}
            className="block rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] font-semibold text-navy">{hook.name}</h3>
              <StatusBadge tone={hook.enabled ? "green" : "gray"}>
                {hook.enabled ? "Enabled" : "Disabled"}
              </StatusBadge>
            </div>
            <p className="mb-3 text-[13px] text-[#4A5568]">{hook.shortDescription}</p>
            <div className="grid gap-2 text-[12px] sm:grid-cols-2">
              <div>
                <span className="text-muted">Trigger: </span>
                <code className="rounded bg-[#EEF2F6] px-1.5 py-0.5 text-navy">{hook.triggerEvent}</code>
              </div>
              <div>
                <span className="text-muted">Action: </span>
                <span className="text-navy">{hook.action}</span>
              </div>
            </div>
            <div className="mt-2 text-[12px] text-muted">
              Owner {hook.owner} · Scope {hook.scope}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
