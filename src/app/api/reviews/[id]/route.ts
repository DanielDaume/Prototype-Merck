import { NextRequest, NextResponse } from "next/server";
import { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const updated = await prisma.reviewItem.update({
    where: { id },
    data: { status: ReviewStatus.COMPLETED },
    include: { agent: true },
  });

  await prisma.activity.create({
    data: {
      title: "Review marked complete",
      description: `Review completed for ${updated.agent.name}.`,
      actor: "Christina H.",
      assetType: "AGENT",
      assetName: updated.agent.name,
      assetSlug: updated.agent.slug,
      agentId: updated.agentId,
    },
  });

  return NextResponse.json(updated);
}
