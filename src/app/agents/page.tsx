import { AgentsPageClient } from "@/components/agents/AgentsPageClient";
import { prisma } from "@/lib/db";
import { businessAreaLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({ orderBy: [{ featured: "desc" }, { rating: "desc" }] });
  const saved = await prisma.savedItem.findMany({
    where: { userKey: "demo-user", assetType: "AGENT" },
    select: { assetId: true },
  });
  const savedIds = new Set(saved.map((s) => s.assetId));

  return (
    <AgentsPageClient
      agents={agents.map((a) => ({
        id: a.id,
        slug: a.slug,
        name: a.name,
        shortDescription: a.shortDescription,
        businessCapability: a.businessCapability,
        businessArea: businessAreaLabels[a.businessArea],
        tags: a.tags,
        rating: a.rating,
        platform: a.platform,
        riskLevel: a.riskLevel,
        certified: a.certified,
        saved: savedIds.has(a.id),
      }))}
    />
  );
}
