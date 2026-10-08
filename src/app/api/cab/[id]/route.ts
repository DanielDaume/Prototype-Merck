import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const updated = await prisma.cabChange.update({
    where: { id },
    data: {
      status: "Completed",
      reviewedAt: new Date(),
    },
    include: { agent: true },
  });

  await prisma.activity.create({
    data: {
      title: "CAB change reviewed",
      description: `CAB change "${updated.title}" marked complete.`,
      actor: "Christina H.",
      ...(updated.agent
        ? {
            assetType: "AGENT" as const,
            assetName: updated.agent.name,
            assetSlug: updated.agent.slug,
            agentId: updated.agentId!,
          }
        : {
            assetName: updated.title,
            assetSlug: updated.slug,
          }),
    },
  });

  return NextResponse.json(updated);
}
