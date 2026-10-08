import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { businessAreaLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function DataDomainsPage() {
  const domains = await prisma.dataDomain.findMany({
    include: {
      _count: { select: { dataAssets: true, dataProducts: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Data Domains"
        description="Enterprise domains with AI asset coverage."
      />
      {domains.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-navy">No data domains yet</p>
          <p className="mt-1 text-[13px] text-muted">
            Enterprise data domains and their AI coverage will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {domains.map((domain) => (
            <Link
              key={domain.id}
              href={`/data-domains/${domain.slug}`}
              className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-[16px] font-semibold text-navy">{domain.name}</h3>
                {domain.businessArea ? (
                  <StatusBadge tone="blue">{businessAreaLabels[domain.businessArea]}</StatusBadge>
                ) : null}
              </div>
              <p className="mb-3 line-clamp-2 text-[13px] text-[#4A5568]">{domain.description}</p>
              <div className="text-[12px] text-muted">
                {domain._count.dataAssets} data assets · {domain._count.dataProducts} data products ·{" "}
                {domain.owner}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
