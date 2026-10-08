import Link from "next/link";
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
        description="Lifecycle and risk reassessment inbox. For AI change governance, use the CAB Workspace as the primary review surface."
      />
      <p className="mb-4 text-[13px] text-muted">
        Looking for change approvals?{" "}
        <Link href="/cab" className="font-medium text-primary hover:underline">
          Open CAB Workspace
        </Link>
      </p>
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
