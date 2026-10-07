import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AgentDetailClient } from "@/components/agents/AgentDetailClient";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await prisma.agent.findUnique({
    where: { slug },
    include: {
      capabilities: true,
      dataAssets: true,
      knowledgeSources: true,
      faqItems: true,
      mcpServers: {
        include: {
          mcpServer: { include: { tools: true } },
        },
      },
      skills: { include: { skill: true } },
      rules: { include: { rule: true } },
      guides: { include: { guide: true } },
      hooks: { include: { hook: true } },
      dependencies: { include: { dependsOnAgent: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 12 },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });

  if (!agent) notFound();

  return (
    <AgentDetailClient
      agent={{
        ...agent,
        nextReviewAt: agent.nextReviewAt?.toISOString() ?? null,
        updatedAt: agent.updatedAt.toISOString(),
        createdAt: agent.createdAt.toISOString(),
        saved: agent.savedItems.length > 0,
        mcpServers: agent.mcpServers.map((m) => ({
          id: m.mcpServer.id,
          slug: m.mcpServer.slug,
          name: m.mcpServer.name,
          status: m.mcpServer.status,
          authType: m.mcpServer.authType,
          owner: m.mcpServer.owner,
          toolCount: m.mcpServer.toolCount,
          classification: m.mcpServer.classification,
          tools: m.mcpServer.tools,
        })),
        skills: agent.skills.map((s) => ({
          id: s.skill.id,
          slug: s.skill.slug,
          name: s.skill.name,
          shortDescription: s.skill.shortDescription,
        })),
        rules: agent.rules.map((r) => ({
          id: r.rule.id,
          slug: r.rule.slug,
          name: r.rule.name,
          shortDescription: r.rule.shortDescription,
          severity: r.rule.severity,
          scope: r.rule.scope,
          description: r.rule.description,
        })),
        guides: agent.guides.map((g) => ({
          id: g.guide.id,
          slug: g.guide.slug,
          name: g.guide.name,
        })),
        hooks: agent.hooks.map((h) => ({
          id: h.hook.id,
          slug: h.hook.slug,
          name: h.hook.name,
        })),
        dependencies: agent.dependencies.map((d) => ({
          id: d.dependsOnAgent.id,
          slug: d.dependsOnAgent.slug,
          name: d.dependsOnAgent.name,
        })),
        activities: agent.activities.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          actor: a.actor,
          createdAt: a.createdAt.toISOString(),
          assetType: a.assetType,
          assetName: a.assetName,
          assetSlug: a.assetSlug,
        })),
      }}
    />
  );
}
