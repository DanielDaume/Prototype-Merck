import { prisma } from "@/lib/db";
import { businessAreaLabels } from "@/lib/labels";
import { UseCasesClient } from "@/components/use-cases/UseCasesClient";

export const dynamic = "force-dynamic";

export default async function UseCasesPage() {
  const useCases = await prisma.useCase.findMany({
    orderBy: { useCaseId: "asc" },
    include: {
      _count: { select: { agents: true, products: true } },
    },
  });

  return (
    <UseCasesClient
      useCases={useCases.map((uc) => ({
        id: uc.id,
        slug: uc.slug,
        useCaseId: uc.useCaseId,
        name: uc.name,
        description: uc.description,
        businessArea: businessAreaLabels[uc.businessArea],
        businessCapability: uc.businessCapability,
        riskLevel: uc.riskLevel,
        riskAssessmentStatus: uc.riskAssessmentStatus,
        gxpRelevant: uc.gxpRelevant,
        lifecycle: uc.lifecycle,
        agentCount: uc._count.agents,
        productCount: uc._count.products,
        owner: uc.owner,
        platform: uc.platform,
      }))}
    />
  );
}
