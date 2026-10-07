import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReviewsClient } from "@/components/reviews/ReviewsClient";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.reviewItem.findMany({
    include: { agent: true },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Governance review inbox for lifecycle and risk reassessment."
      />
      <ReviewsClient
        reviews={reviews.map((r) => ({
          id: r.id,
          reason: r.reason,
          dueDate: r.dueDate.toISOString(),
          status: r.status,
          agent: {
            name: r.agent.name,
            slug: r.agent.slug,
            businessOwner: r.agent.businessOwner,
            riskLevel: r.agent.riskLevel,
          },
        }))}
      />
    </div>
  );
}
