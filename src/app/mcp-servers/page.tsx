import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function McpServersPage() {
  const servers = await prisma.mcpServer.findMany({
    include: { agents: true, tools: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="MCP Servers"
        description="Discover reusable enterprise tools and system integrations available to AI agents."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {servers.map((server) => (
          <Link
            key={server.id}
            href={`/mcp-servers/${server.slug}`}
            className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-[16px] font-semibold text-navy">{server.name}</h3>
              <StatusBadge tone={server.status === "Active" ? "green" : "gray"}>{server.status}</StatusBadge>
            </div>
            <p className="mb-3 line-clamp-2 text-[13px] text-[#4A5568]">{server.shortDescription}</p>
            <div className="flex flex-wrap gap-2 text-[12px]">
              <StatusBadge tone="blue">{server.origin}</StatusBadge>
              <RiskBadge level={server.riskLevel} />
              <span className="text-muted">{server.toolCount} tools</span>
              <span className="text-muted">{server.agents.length} agents</span>
            </div>
            <div className="mt-3 border-t border-border pt-3 text-[12px] text-muted">
              {server.owner} · v{server.version} · Updated {relativeTime(server.updatedAt)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
