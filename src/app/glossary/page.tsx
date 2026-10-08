import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { parseTags } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GlossaryPage() {
  const terms = await prisma.glossaryTerm.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Glossary Terms"
        description="Shared AI and agentic terminology for the repository."
      />
      {terms.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-navy">No glossary terms yet</p>
          <p className="mt-1 text-[13px] text-muted">
            Shared definitions for AI and agentic concepts will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {terms.map((term) => {
            const tags = parseTags(term.tags);
            const related = parseTags(term.relatedTerms);
            return (
              <Link
                key={term.id}
                href={`/glossary/${term.slug}`}
                className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-[16px] font-semibold text-navy">{term.name}</h3>
                  <StatusBadge tone="purple">{term.category}</StatusBadge>
                </div>
                <p className="mb-3 line-clamp-3 text-[13px] text-[#4A5568]">{term.definition}</p>
                {related.length > 0 ? (
                  <div className="mb-2 text-[12px] text-muted">
                    Related: {related.slice(0, 3).join(", ")}
                    {related.length > 3 ? "…" : ""}
                  </div>
                ) : null}
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
