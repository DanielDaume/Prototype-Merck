import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { CoverageBadge } from "@/components/ui/CoverageBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ingestionModeLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const sources = await prisma.platformSource.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Platforms & Coverage"
        description="Understand repository coverage, metadata sources and known integration gaps."
      />

      <div className="rounded-[10px] border border-border bg-[#EEF2F6] px-4 py-2.5 text-[12px] text-navy">
        Workshop source coverage snapshot — prototype only
      </div>

      <div className="overflow-hidden rounded-[12px] border border-border bg-white shadow-sm">
        <div className="hidden border-b border-border bg-[#243443] px-4 py-2.5 text-[12px] font-semibold text-white xl:grid xl:grid-cols-[1.2fr_1.1fr_140px_120px_1fr_1fr_1fr] xl:gap-3">
          <span>Platform / Source</span>
          <span>Role</span>
          <span>Repository Status</span>
          <span>Ingestion Mode</span>
          <span>Metadata Available</span>
          <span>Known Gap</span>
          <span>Notes</span>
        </div>

        <ul className="divide-y divide-border">
          {sources.map((source) => (
            <li
              key={source.id}
              className="grid gap-3 px-4 py-4 xl:grid-cols-[1.2fr_1.1fr_140px_120px_1fr_1fr_1fr] xl:items-start xl:gap-3"
            >
              <div>
                <div className="text-sm font-semibold text-navy">{source.name}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <StatusBadge tone="gray">{source.category}</StatusBadge>
                </div>
                <p className="mt-1.5 text-[12px] text-muted xl:hidden">{source.summary}</p>
              </div>

              <div className="text-[13px] text-[#4A5568]">
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted xl:hidden">
                  Role
                </div>
                {source.role}
              </div>

              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted xl:hidden">
                  Repository Status
                </div>
                <CoverageBadge status={source.repositoryStatus} />
              </div>

              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted xl:hidden">
                  Ingestion Mode
                </div>
                <StatusBadge
                  tone={
                    source.ingestionMode === "AUTOMATED"
                      ? "blue"
                      : source.ingestionMode === "MANUAL"
                        ? "amber"
                        : source.ingestionMode === "PLANNED"
                          ? "purple"
                          : "gray"
                  }
                >
                  {ingestionModeLabels[source.ingestionMode]}
                </StatusBadge>
              </div>

              <div className="text-[13px] text-[#4A5568]">
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted xl:hidden">
                  Metadata Available
                </div>
                {source.metadataAvailable}
              </div>

              <div className="text-[13px] text-[#4A5568]">
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted xl:hidden">
                  Known Gap
                </div>
                {source.knownGap || (
                  <span className="text-muted">None recorded</span>
                )}
                {source.caveat ? (
                  <div className="mt-1 text-[11px] text-muted">{source.caveat}</div>
                ) : null}
              </div>

              <div className="text-[13px] text-[#4A5568]">
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted xl:hidden">
                  Notes
                </div>
                {source.notes || source.summary}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {sources.length === 0 ? (
        <p className="text-sm text-muted">No platform sources have been seeded yet.</p>
      ) : null}
    </div>
  );
}
