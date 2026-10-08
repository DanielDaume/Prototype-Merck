import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";
import { parseTags, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DataProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.catalogDataProduct.findUnique({
    where: { slug },
    include: {
      domain: true,
      agents: { include: { agent: true } },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });
  if (!product) notFound();

  const tags = parseTags(product.tags);

  return (
    <div className="space-y-4">
      <Link
        href="/data-products"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to data products
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={product.name}
          description={product.description}
          actions={
            <div className="flex items-center gap-3">
              {product.rating > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {product.rating.toFixed(1)}
                </span>
              ) : null}
              <SaveButton
                assetType="DATA_PRODUCT"
                assetId={product.id}
                assetSlug={product.slug}
                assetName={product.name}
                initiallySaved={product.savedItems.length > 0}
              />
            </div>
          }
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="amber">{product.classification}</StatusBadge>
        <StatusBadge tone="gray">{product.domain?.name ?? product.domainName}</StatusBadge>
        {product.platform ? <StatusBadge tone="blue">{product.platform}</StatusBadge> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <PropertyGrid
            items={[
              { label: "Owner", value: product.owner },
              { label: "Owner email", value: product.ownerEmail },
              {
                label: "Domain",
                value: product.domain ? (
                  <Link
                    href={`/data-domains/${product.domain.slug}`}
                    className="text-primary hover:underline"
                  >
                    {product.domain.name}
                  </Link>
                ) : (
                  product.domainName
                ),
              },
              { label: "Classification", value: product.classification },
              { label: "Platform", value: product.platform ?? "—" },
              { label: "Last updated", value: relativeTime(product.updatedAt) },
            ]}
          />
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="rounded-[12px] border border-border bg-white p-4 shadow-sm h-fit">
          <h2 className="mb-3 text-sm font-semibold text-navy">Consumed by AI agents</h2>
          {product.agents.length === 0 ? (
            <p className="text-[13px] text-muted">No linked agents yet.</p>
          ) : (
            <ul className="space-y-3">
              {product.agents.map(({ agent, role }) => (
                <li key={agent.id}>
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {agent.name}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <StatusBadge tone="gray">{role}</StatusBadge>
                    <span className="text-[11px] text-muted">{agent.platform}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
