import { prisma } from "@/lib/db";
import { businessAreaLabels } from "@/lib/labels";
import { AgentProductsClient } from "@/components/products/AgentProductsClient";

export const dynamic = "force-dynamic";

export default async function AgentProductsPage() {
  const products = await prisma.agentProduct.findMany({
    orderBy: [{ featured: "desc" }, { rating: "desc" }],
    include: { _count: { select: { agents: true } } },
  });

  return (
    <AgentProductsClient
      products={products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        businessArea: businessAreaLabels[p.businessArea],
        businessCapability: p.businessCapability,
        lifecycleStage: p.lifecycleStage,
        riskLevel: p.riskLevel,
        accessLevel: p.accessLevel,
        certified: p.certified,
        usagePolicy: p.usagePolicy,
        businessOwner: p.businessOwner,
        componentCount: p._count.agents,
        platform: p.platform,
      }))}
    />
  );
}
