import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";
import { parseTags, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DataAssetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const asset = await prisma.catalogDataAsset.findUnique({
    where: { slug },
    include: {
      domain: true,
      agents: { include: { agent: true } },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });
  if (!asset) notFound();

  const tags = parseTags(asset.tags);

  return (
    <div className="space-y-4">
      <Link
        href="/data-assets"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to data assets
      </Link>
      <PageHeader
        title={asset.name}
        description={asset.description}
        actions={
          <SaveButton
            assetType="DATA_ASSET"
            assetId={asset.id}
            assetSlug={asset.slug}
            assetName={asset.name}
            initiallySaved={asset.savedItems.length > 0}
          />
        }
      />
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="blue">{asset.assetType}</StatusBadge>
        <StatusBadge tone="amber">{asset.classification}</StatusBadge>
        {asset.sensitivity ? <StatusBadge tone="red">{asset.sensitivity}</StatusBadge> : null}
        <StatusBadge tone="gray">{asset.domain?.name ?? asset.domainName}</StatusBadge>
      </div>
      <PropertyGrid
        items={[
          { label: "Owner", value: asset.owner },
          { label: "Owner email", value: asset.ownerEmail },
          { label: "Source system", value: asset.sourceSystem },
          {
            label: "Domain",
            value: asset.domain ? (
              <Link href={`/data-domains/${asset.domain.slug}`} className="text-primary hover:underline">
                {asset.domain.name}
              </Link>
            ) : (
              asset.domainName
            ),
          },
          { label: "Classification", value: asset.classification },
          { label: "Agents using it", value: asset.agents.length },
          { label: "Last updated", value: relativeTime(asset.updatedAt) },
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
      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-navy">Used by agents</h2>
        {asset.agents.length === 0 ? (
          <p className="text-[13px] text-muted">No agents currently reference this asset.</p>
        ) : (
          <ul className="space-y-2">
            {asset.agents.map(({ agent, role }) => (
              <li key={agent.id} className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/agents/${agent.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {agent.name}
                </Link>
                <StatusBadge tone="gray">{role}</StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-navy">Notes</h2>
        <p className="text-[13px] text-[#4A5568]">
          What is this asset used for? Agents consume it as a governed input for retrieval,
          grounding, or decision support. Contact the owner for access and refresh cadence.
        </p>
      </section>
    </div>
  );
}
