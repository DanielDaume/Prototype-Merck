import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const guides = await prisma.guide.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Guides"
        description="Standards and practical guidance for building, publishing and operating AI agents."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.slug}`}
            className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-2 flex flex-wrap gap-2">
              <StatusBadge tone="blue">{guide.category}</StatusBadge>
              <StatusBadge tone="gray">{guide.audience}</StatusBadge>
            </div>
            <h3 className="text-[16px] font-semibold text-navy">{guide.name}</h3>
            <p className="mt-1 text-[13px] text-[#4A5568]">{guide.shortDescription}</p>
            <div className="mt-3 text-[12px] text-muted">
              {guide.readingTimeMin} min read · Updated {relativeTime(guide.updatedAt)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
