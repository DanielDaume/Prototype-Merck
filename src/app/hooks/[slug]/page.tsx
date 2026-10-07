import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SaveButton } from "@/components/actions/SaveButton";

export const dynamic = "force-dynamic";

export default async function HookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hook = await prisma.hook.findUnique({
    where: { slug },
    include: {
      agents: { include: { agent: true } },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });
  if (!hook) notFound();

  return (
    <div className="space-y-4">
      <Link href="/hooks" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to hooks
      </Link>
      <PageHeader
        title={hook.name}
        description={hook.description}
        actions={
          <SaveButton
            assetType="HOOK"
            assetId={hook.id}
            assetSlug={hook.slug}
            assetName={hook.name}
            initiallySaved={hook.savedItems.length > 0}
          />
        }
      />
      <StatusBadge tone={hook.enabled ? "green" : "gray"}>{hook.enabled ? "Enabled" : "Disabled"}</StatusBadge>
      <PropertyGrid
        items={[
          { label: "Trigger", value: hook.triggerEvent },
          { label: "Action", value: hook.action },
          { label: "Owner", value: hook.owner },
          { label: "Status", value: hook.status },
          { label: "Scope", value: hook.scope },
        ]}
      />
      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-navy">Linked agents</h2>
        <ul className="space-y-2">
          {hook.agents.map(({ agent }) => (
            <li key={agent.id}>
              <Link href={`/agents/${agent.slug}`} className="text-sm font-medium text-primary hover:underline">
                {agent.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
