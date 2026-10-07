import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SaveButton } from "@/components/actions/SaveButton";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: { savedItems: { where: { userKey: "demo-user" }, take: 1 } },
  });
  if (!guide) notFound();

  const paragraphs = guide.content.split("\n").filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/guides" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to guides
      </Link>
      <PageHeader
        title={guide.name}
        description={guide.shortDescription}
        actions={
          <SaveButton
            assetType="GUIDE"
            assetId={guide.id}
            assetSlug={guide.slug}
            assetName={guide.name}
            initiallySaved={guide.savedItems.length > 0}
          />
        }
      />
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="blue">{guide.category}</StatusBadge>
        <StatusBadge tone="gray">{guide.audience}</StatusBadge>
        <span className="text-[12px] text-muted">
          {guide.readingTimeMin} min · Updated {relativeTime(guide.updatedAt)}
        </span>
      </div>
      <article className="rounded-[12px] border border-border bg-white p-6 shadow-sm prose-sm">
        {paragraphs.map((line, idx) => {
          if (line.startsWith("## ")) {
            return (
              <h2 key={idx} className="mb-2 mt-5 text-base font-semibold text-navy">
                {line.replace("## ", "")}
              </h2>
            );
          }
          if (line.startsWith("- ") || /^\d+\./.test(line)) {
            return (
              <p key={idx} className="ml-3 text-[14px] text-[#4A5568]">
                {line}
              </p>
            );
          }
          return (
            <p key={idx} className="mb-2 text-[14px] leading-relaxed text-[#4A5568]">
              {line}
            </p>
          );
        })}
      </article>
    </div>
  );
}
