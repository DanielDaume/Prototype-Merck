import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  const [agents, mcps, skills, rules, guides, hooks] = await Promise.all([
    prisma.agent.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { shortDescription: { contains: q } },
          { tags: { contains: q } },
          { businessCapability: { contains: q } },
        ],
      },
      take: 6,
      orderBy: { rating: "desc" },
    }),
    prisma.mcpServer.findMany({
      where: {
        OR: [{ name: { contains: q } }, { shortDescription: { contains: q } }, { tags: { contains: q } }],
      },
      take: 4,
    }),
    prisma.skill.findMany({
      where: {
        OR: [{ name: { contains: q } }, { shortDescription: { contains: q } }, { tags: { contains: q } }],
      },
      take: 4,
    }),
    prisma.rule.findMany({
      where: {
        OR: [{ name: { contains: q } }, { shortDescription: { contains: q } }, { tags: { contains: q } }],
      },
      take: 3,
    }),
    prisma.guide.findMany({
      where: {
        OR: [{ name: { contains: q } }, { shortDescription: { contains: q } }, { tags: { contains: q } }],
      },
      take: 3,
    }),
    prisma.hook.findMany({
      where: {
        OR: [{ name: { contains: q } }, { shortDescription: { contains: q } }, { tags: { contains: q } }],
      },
      take: 3,
    }),
  ]);

  const results = [
    ...agents.map((a) => ({
      type: "AGENT" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/agents/${a.slug}`,
    })),
    ...mcps.map((a) => ({
      type: "MCP_SERVER" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/mcp-servers/${a.slug}`,
    })),
    ...skills.map((a) => ({
      type: "SKILL" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/skills/${a.slug}`,
    })),
    ...rules.map((a) => ({
      type: "RULE" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/rules/${a.slug}`,
    })),
    ...guides.map((a) => ({
      type: "GUIDE" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/guides/${a.slug}`,
    })),
    ...hooks.map((a) => ({
      type: "HOOK" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/hooks/${a.slug}`,
    })),
  ];

  return NextResponse.json({ results });
}
