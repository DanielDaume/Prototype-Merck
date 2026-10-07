import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { ActivityTimeline } from "@/components/activity/ActivityTimeline";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div>
      <PageHeader
        title="Activity"
        description="Repository-wide audit feed for registration, governance and access events."
      />
      <ActivityTimeline items={activities} />
    </div>
  );
}
