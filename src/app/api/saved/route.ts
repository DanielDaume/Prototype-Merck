import { NextRequest, NextResponse } from "next/server";
import { AssetType } from "@prisma/client";
import { prisma } from "@/lib/db";

const USER = "demo-user";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const assetType = body.assetType as AssetType;
  const assetId = String(body.assetId);
  const assetSlug = String(body.assetSlug);
  const assetName = String(body.assetName);

  const existing = await prisma.savedItem.findUnique({
    where: {
      userKey_assetType_assetId: {
        userKey: USER,
        assetType,
        assetId,
      },
    },
  });

  if (existing) {
    await prisma.savedItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  const data: {
    userKey: string;
    assetType: AssetType;
    assetId: string;
    assetSlug: string;
    assetName: string;
    agentId?: string;
    agentProductId?: string;
    mcpServerId?: string;
    skillId?: string;
    ruleId?: string;
    guideId?: string;
    hookId?: string;
    useCaseId?: string;
    dataAssetId?: string;
    dataProductId?: string;
    glossaryTermId?: string;
    dataDomainId?: string;
  } = {
    userKey: USER,
    assetType,
    assetId,
    assetSlug,
    assetName,
  };

  if (assetType === "AGENT") data.agentId = assetId;
  if (assetType === "AGENT_PRODUCT") data.agentProductId = assetId;
  if (assetType === "MCP_SERVER") data.mcpServerId = assetId;
  if (assetType === "SKILL") data.skillId = assetId;
  if (assetType === "RULE") data.ruleId = assetId;
  if (assetType === "GUIDE") data.guideId = assetId;
  if (assetType === "HOOK") data.hookId = assetId;
  if (assetType === "USE_CASE") data.useCaseId = assetId;
  if (assetType === "DATA_ASSET") data.dataAssetId = assetId;
  if (assetType === "DATA_PRODUCT") data.dataProductId = assetId;
  if (assetType === "GLOSSARY_TERM") data.glossaryTermId = assetId;
  if (assetType === "DATA_DOMAIN") data.dataDomainId = assetId;

  await prisma.savedItem.create({ data });
  return NextResponse.json({ saved: true });
}
