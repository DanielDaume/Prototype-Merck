import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";
import { parseTags, relativeTime, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GlossaryTermDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = await prisma.glossaryTerm.findUnique({
    where: { slug },
    include: {
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });
  if (!term) notFound();

  const tags = parseTags(term.tags);
  const relatedNames = parseTags(term.relatedTerms);
  const relatedSlugs = relatedNames.map(slugify);
  const relatedTerms =
    relatedSlugs.length > 0
      ? await prisma.glossaryTerm.findMany({
          where: {
            OR: [
              { slug: { in: relatedSlugs } },
              ...relatedNames.map((name) => ({
                name: { equals: name, mode: "insensitive" as const },
              })),
            ],
          },
        })
      : [];
  const relatedByKey = new Map(
    relatedTerms.flatMap((t) => [
      [t.slug, t] as const,
      [t.name.toLowerCase(), t] as const,
    ])
  );

  return (
    <div className="space-y-4">
      <Link
        href="/glossary"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to glossary
      </Link>
      <PageHeader
        title={term.name}
        description={term.shortDescription}
        actions={
          <SaveButton
            assetType="GLOSSARY_TERM"
            assetId={term.id}
            assetSlug={term.slug}
            assetName={term.name}
            initiallySaved={term.savedItems.length > 0}
          />
        }
      />
      <StatusBadge tone="purple">{term.category}</StatusBadge>
      <PropertyGrid
        items={[
          { label: "Category", value: term.category },
          { label: "Last updated", value: relativeTime(term.updatedAt) },
          { label: "Related terms", value: relatedNames.length || "—" },
        ]}
      />
      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-navy">Definition</h2>
        <p className="text-[14px] leading-relaxed text-[#4A5568]">{term.definition}</p>
      </section>
      {relatedNames.length > 0 ? (
        <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-navy">Related terms</h2>
          <div className="flex flex-wrap gap-2">
            {relatedNames.map((name) => {
              const match =
                relatedByKey.get(slugify(name)) ?? relatedByKey.get(name.toLowerCase());
              if (match) {
                return (
                  <Link
                    key={name}
                    href={`/glossary/${match.slug}`}
                    className="rounded-md border border-border bg-[#FAFBFC] px-2.5 py-1 text-[12px] font-medium text-primary hover:border-primary/40"
                  >
                    {match.name}
                  </Link>
                );
              }
              return (
                <span
                  key={name}
                  className="rounded-md border border-border bg-[#FAFBFC] px-2.5 py-1 text-[12px] text-muted"
                >
                  {name}
                </span>
              );
            })}
          </div>
        </section>
      ) : null}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
