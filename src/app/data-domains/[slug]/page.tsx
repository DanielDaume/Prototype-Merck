import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";
import { businessAreaLabels } from "@/lib/labels";
import { parseTags, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DataDomainDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const domain = await prisma.dataDomain.findUnique({
    where: { slug },
    include: {
      dataAssets: { orderBy: { name: "asc" }, take: 20 },
      dataProducts: { orderBy: { name: "asc" }, take: 20 },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });
  if (!domain) notFound();

  const tags = parseTags(domain.tags);

  const relatedAgents = await prisma.agent.findMany({
    where: {
      OR: [
        { businessCapability: { contains: domain.name, mode: "insensitive" } },
        { tags: { contains: domain.name, mode: "insensitive" } },
        ...(domain.businessArea ? [{ businessArea: domain.businessArea }] : []),
      ],
    },
    take: 12,
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <Link
        href="/data-domains"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to data domains
      </Link>
      <PageHeader
        title={domain.name}
        description={domain.description}
        actions={
          <SaveButton
            assetType="DATA_DOMAIN"
            assetId={domain.id}
            assetSlug={domain.slug}
            assetName={domain.name}
            initiallySaved={domain.savedItems.length > 0}
          />
        }
      />
      <div className="flex flex-wrap gap-2">
        {domain.businessArea ? (
          <StatusBadge tone="blue">{businessAreaLabels[domain.businessArea]}</StatusBadge>
        ) : null}
        <StatusBadge tone="gray">{domain.dataAssets.length} assets</StatusBadge>
        <StatusBadge tone="gray">{domain.dataProducts.length} products</StatusBadge>
      </div>
      <PropertyGrid
        items={[
          { label: "Owner", value: domain.owner },
          { label: "Owner email", value: domain.ownerEmail },
          {
            label: "Business area",
            value: domain.businessArea ? businessAreaLabels[domain.businessArea] : "—",
          },
          { label: "Data assets", value: domain.dataAssets.length },
          { label: "Data products", value: domain.dataProducts.length },
          { label: "Related agents", value: relatedAgents.length },
          { label: "Last updated", value: relativeTime(domain.updatedAt) },
        ]}
      />
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-navy">Linked data assets</h2>
          {domain.dataAssets.length === 0 ? (
            <p className="text-[13px] text-muted">No linked data assets.</p>
          ) : (
            <ul className="space-y-2">
              {domain.dataAssets.map((asset) => (
                <li key={asset.id}>
                  <Link
                    href={`/data-assets/${asset.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {asset.name}
                  </Link>
                  <div className="text-[12px] text-muted">{asset.assetType}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-navy">Linked data products</h2>
          {domain.dataProducts.length === 0 ? (
            <p className="text-[13px] text-muted">No linked data products.</p>
          ) : (
            <ul className="space-y-2">
              {domain.dataProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/data-products/${product.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {product.name}
                  </Link>
                  <div className="text-[12px] text-muted">{product.classification}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-navy">Related AI agents</h2>
        {relatedAgents.length === 0 ? (
          <p className="text-[13px] text-muted">
            No agents matched this domain by capability or business area yet.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {relatedAgents.map((agent) => (
              <li key={agent.id}>
                <Link
                  href={`/agents/${agent.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {agent.name}
                </Link>
                <div className="text-[12px] text-muted">{agent.businessCapability}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
