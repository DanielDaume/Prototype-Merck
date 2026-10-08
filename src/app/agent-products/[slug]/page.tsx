import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AgentProductDetailClient } from "@/components/products/AgentProductDetailClient";

export const dynamic = "force-dynamic";

export default async function AgentProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.agentProduct.findUnique({
    where: { slug },
    include: {
      linkedUseCase: true,
      agents: {
        orderBy: { sortOrder: "asc" },
        include: { agent: true },
      },
      activities: { orderBy: { createdAt: "desc" }, take: 12 },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });

  if (!product) notFound();

  return (
    <AgentProductDetailClient
      product={{
        id: product.id,
        slug: product.slug,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        businessArea: product.businessArea,
        businessCapability: product.businessCapability,
        businessOwner: product.businessOwner,
        businessOwnerEmail: product.businessOwnerEmail,
        lifecycleStage: product.lifecycleStage,
        riskLevel: product.riskLevel,
        accessLevel: product.accessLevel,
        certified: product.certified,
        rating: product.rating,
        ratingCount: product.ratingCount,
        valueBenefit: product.valueBenefit,
        usagePolicy: product.usagePolicy,
        platform: product.platform,
        tags: product.tags,
        updatedAt: product.updatedAt.toISOString(),
        createdAt: product.createdAt.toISOString(),
        saved: product.savedItems.length > 0,
        linkedUseCase: product.linkedUseCase
          ? {
              id: product.linkedUseCase.id,
              slug: product.linkedUseCase.slug,
              useCaseId: product.linkedUseCase.useCaseId,
              name: product.linkedUseCase.name,
            }
          : null,
        agents: product.agents.map((m) => ({
          id: m.agent.id,
          slug: m.agent.slug,
          name: m.agent.name,
          shortDescription: m.agent.shortDescription,
          platform: m.agent.platform,
          riskLevel: m.agent.riskLevel,
          certified: m.agent.certified,
          lifecycleStage: m.agent.lifecycleStage,
          role: m.role,
          sortOrder: m.sortOrder,
        })),
        activities: product.activities.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          actor: a.actor,
          createdAt: a.createdAt.toISOString(),
          assetType: a.assetType,
          assetName: a.assetName,
          assetSlug: a.assetSlug,
        })),
      }}
    />
  );
}
