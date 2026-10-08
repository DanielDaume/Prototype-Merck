import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  const contains = { contains: q, mode: "insensitive" as const };

  const [
    agents,
    products,
    useCases,
    mcps,
    skills,
    rules,
    guides,
    hooks,
    dataAssets,
    dataProducts,
    glossaryTerms,
    dataDomains,
  ] = await Promise.all([
    prisma.agent.findMany({
      where: {
        OR: [
          { name: contains },
          { shortDescription: contains },
          { tags: contains },
          { businessCapability: contains },
        ],
      },
      take: 6,
      orderBy: { rating: "desc" },
    }),
    prisma.agentProduct.findMany({
      where: {
        OR: [
          { name: contains },
          { shortDescription: contains },
          { tags: contains },
          { businessCapability: contains },
        ],
      },
      take: 4,
      orderBy: { rating: "desc" },
    }),
    prisma.useCase.findMany({
      where: {
        OR: [
          { name: contains },
          { useCaseId: contains },
          { description: contains },
          { tags: contains },
          { businessCapability: contains },
        ],
      },
      take: 4,
      orderBy: { useCaseId: "asc" },
    }),
    prisma.mcpServer.findMany({
      where: {
        OR: [{ name: contains }, { shortDescription: contains }, { tags: contains }],
      },
      take: 4,
    }),
    prisma.skill.findMany({
      where: {
        OR: [{ name: contains }, { shortDescription: contains }, { tags: contains }],
      },
      take: 4,
    }),
    prisma.rule.findMany({
      where: {
        OR: [{ name: contains }, { shortDescription: contains }, { tags: contains }],
      },
      take: 3,
    }),
    prisma.guide.findMany({
      where: {
        OR: [{ name: contains }, { shortDescription: contains }, { tags: contains }],
      },
      take: 3,
    }),
    prisma.hook.findMany({
      where: {
        OR: [{ name: contains }, { shortDescription: contains }, { tags: contains }],
      },
      take: 3,
    }),
    prisma.catalogDataAsset.findMany({
      where: {
        OR: [
          { name: contains },
          { shortDescription: contains },
          { description: contains },
          { tags: contains },
          { domainName: contains },
          { assetType: contains },
        ],
      },
      take: 4,
      orderBy: { name: "asc" },
    }),
    prisma.catalogDataProduct.findMany({
      where: {
        OR: [
          { name: contains },
          { shortDescription: contains },
          { description: contains },
          { tags: contains },
          { domainName: contains },
        ],
      },
      take: 4,
      orderBy: { rating: "desc" },
    }),
    prisma.glossaryTerm.findMany({
      where: {
        OR: [
          { name: contains },
          { shortDescription: contains },
          { definition: contains },
          { tags: contains },
          { category: contains },
        ],
      },
      take: 4,
      orderBy: { name: "asc" },
    }),
    prisma.dataDomain.findMany({
      where: {
        OR: [{ name: contains }, { description: contains }, { tags: contains }],
      },
      take: 4,
      orderBy: { name: "asc" },
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
    ...products.map((a) => ({
      type: "AGENT_PRODUCT" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/agent-products/${a.slug}`,
    })),
    ...useCases.map((a) => ({
      type: "USE_CASE" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: `${a.useCaseId} — ${a.description}`,
      href: `/use-cases/${a.slug}`,
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
    ...dataAssets.map((a) => ({
      type: "DATA_ASSET" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/data-assets/${a.slug}`,
    })),
    ...dataProducts.map((a) => ({
      type: "DATA_PRODUCT" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/data-products/${a.slug}`,
    })),
    ...glossaryTerms.map((a) => ({
      type: "GLOSSARY_TERM" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.shortDescription,
      href: `/glossary/${a.slug}`,
    })),
    ...dataDomains.map((a) => ({
      type: "DATA_DOMAIN" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      shortDescription: a.description,
      href: `/data-domains/${a.slug}`,
    })),
  ];

  return NextResponse.json({ results });
}
