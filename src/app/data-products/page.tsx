import Link from "next/link";
import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DataProductsPage() {
  const products = await prisma.catalogDataProduct.findMany({
    include: {
      agents: true,
      domain: true,
    },
    orderBy: [{ rating: "desc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Data Products"
        description="Data products consumed by enterprise AI agents."
      />
      {products.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-navy">No data products yet</p>
          <p className="mt-1 text-[13px] text-muted">
            Curated data products available to AI agents will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/data-products/${product.slug}`}
              className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-[16px] font-semibold text-navy">{product.name}</h3>
                {product.rating > 0 ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-navy">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {product.rating.toFixed(1)}
                  </span>
                ) : null}
              </div>
              <p className="mb-3 line-clamp-2 text-[13px] text-[#4A5568]">{product.shortDescription}</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                <StatusBadge tone="amber">{product.classification}</StatusBadge>
                <StatusBadge tone="gray">{product.domain?.name ?? product.domainName}</StatusBadge>
                {product.platform ? <StatusBadge tone="blue">{product.platform}</StatusBadge> : null}
              </div>
              <div className="text-[12px] text-muted">
                {product.owner} · {product.agents.length} AI agents · Updated{" "}
                {relativeTime(product.updatedAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
