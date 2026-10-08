import { NextRequest, NextResponse } from "next/server";
import { AssetType } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const agentId = String(body.agentId || "").trim();
  const issueType = String(body.issueType || "").trim();
  const comment = String(body.comment || "").trim();

  if (!agentId || !issueType || !comment) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const issue = await prisma.issueFlag.create({
    data: {
      agentId,
      issueType,
      comment,
      reporter: "Christina H.",
    },
  });

  await prisma.activity.create({
    data: {
      title: "Issue flagged",
      description: `${issueType}: ${comment.slice(0, 160)}`,
      actor: "Christina H.",
      assetType: AssetType.AGENT,
      assetName: agent.name,
      assetSlug: agent.slug,
      agentId: agent.id,
    },
  });

  return NextResponse.json(issue);
}
