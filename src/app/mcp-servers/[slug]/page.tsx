import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function McpDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const server = await prisma.mcpServer.findUnique({
    where: { slug },
    include: {
      tools: true,
      agents: { include: { agent: true } },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });
  if (!server) notFound();

  return (
    <div className="space-y-4">
      <Link href="/mcp-servers" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to MCP servers
      </Link>
      <PageHeader
        title={server.name}
        description={server.description}
        actions={
          <SaveButton
            assetType="MCP_SERVER"
            assetId={server.id}
            assetSlug={server.slug}
            assetName={server.name}
            initiallySaved={server.savedItems.length > 0}
          />
        }
      />
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="blue">{server.origin}</StatusBadge>
        <StatusBadge tone="green">{server.status}</StatusBadge>
        <RiskBadge level={server.riskLevel} />
        <StatusBadge tone="gray">{server.classification}</StatusBadge>
      </div>
      <PropertyGrid
        items={[
          { label: "Owner", value: server.owner },
          { label: "Authentication", value: server.authType },
          { label: "Environments", value: server.environments },
          { label: "Version", value: `v${server.version}` },
          { label: "Tool count", value: server.toolCount },
          { label: "Connected agents", value: server.agents.length },
          { label: "Endpoint", value: server.endpoint },
          { label: "Last updated", value: relativeTime(server.updatedAt) },
        ]}
      />
      <section className="rounded-[12px] border border-border bg-white shadow-sm overflow-hidden">
        <div className="border-b border-border bg-[#243443] px-4 py-3 text-sm font-semibold text-white">
          Available Tools
        </div>
        <div className="divide-y divide-border">
          {server.tools.map((tool) => (
            <div key={tool.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[200px_1fr]">
              <code className="text-sm font-medium text-navy">{tool.name}</code>
              <span className="text-[13px] text-muted">{tool.description}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-navy">Connected agents</h2>
        <ul className="space-y-2">
          {server.agents.map(({ agent }) => (
            <li key={agent.id}>
              <Link href={`/agents/${agent.slug}`} className="text-sm font-medium text-primary hover:underline">
                {agent.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
