import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DataAssetsPage() {
  const assets = await prisma.catalogDataAsset.findMany({
    include: {
      agents: true,
      domain: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Data Assets"
        description="Data and knowledge assets used by AI agents."
      />
      {assets.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-navy">No data assets yet</p>
          <p className="mt-1 text-[13px] text-muted">
            Catalogued datasets, documents, and knowledge sources will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              href={`/data-assets/${asset.slug}`}
              className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-[16px] font-semibold text-navy">{asset.name}</h3>
                <StatusBadge tone="blue">{asset.assetType}</StatusBadge>
              </div>
              <p className="mb-3 line-clamp-2 text-[13px] text-[#4A5568]">{asset.shortDescription}</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                <StatusBadge tone="amber">{asset.classification}</StatusBadge>
                <StatusBadge tone="gray">{asset.domain?.name ?? asset.domainName}</StatusBadge>
              </div>
              <div className="text-[12px] text-muted">
                {asset.owner} · {asset.sourceSystem} · {asset.agents.length} agents · Updated{" "}
                {relativeTime(asset.updatedAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
