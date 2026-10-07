import { NextRequest, NextResponse } from "next/server";
import { AssetType } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.accessRequest.create({
    data: {
      assetType: (body.assetType as AssetType) || AssetType.AGENT,
      assetName: String(body.assetName),
      assetSlug: body.assetSlug ? String(body.assetSlug) : null,
      agentId: body.agentId ? String(body.agentId) : null,
      reason: String(body.reason || ""),
      businessCase: String(body.businessCase || ""),
      environment: String(body.environment || "Prod"),
      approver: "Pending assignment",
      expectedAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      requester: "Christina H.",
    },
  });

  await prisma.activity.create({
    data: {
      title: "Access request submitted",
      description: `Access requested for ${created.assetName}.`,
      actor: "Christina H.",
      assetType: created.assetType,
      assetName: created.assetName,
      assetSlug: created.assetSlug,
      agentId: created.agentId,
    },
  });

  return NextResponse.json(created);
}
