import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const rating = Number(body.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be an integer from 1 to 5" }, { status: 400 });
  }

  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const nextCount = agent.ratingCount + 1;
  const nextRating = (agent.rating * agent.ratingCount + rating) / nextCount;

  const updated = await prisma.agent.update({
    where: { id },
    data: {
      rating: Math.round(nextRating * 10) / 10,
      ratingCount: nextCount,
    },
  });

  return NextResponse.json({
    rating: updated.rating,
    ratingCount: updated.ratingCount,
  });
}
