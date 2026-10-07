import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";

export const dynamic = "force-dynamic";

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = await prisma.skill.findUnique({
    where: { slug },
    include: {
      agents: { include: { agent: true } },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });
  if (!skill) notFound();

  return (
    <div className="space-y-4">
      <Link href="/skills" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to skills
      </Link>
      <PageHeader
        title={skill.name}
        description={skill.description}
        actions={
          <SaveButton
            assetType="SKILL"
            assetId={skill.id}
            assetSlug={skill.slug}
            assetName={skill.name}
            initiallySaved={skill.savedItems.length > 0}
          />
        }
      />
      <StatusBadge tone="purple">{skill.category}</StatusBadge>
      <PropertyGrid
        items={[
          { label: "Owner", value: skill.owner },
          { label: "Version", value: `v${skill.version}` },
          { label: "Status", value: skill.status },
          { label: "Agents using it", value: skill.agents.length },
        ]}
      />
      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-navy">Used by agents</h2>
        <ul className="space-y-2">
          {skill.agents.map(({ agent }) => (
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
