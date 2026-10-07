import { NextRequest, NextResponse } from "next/server";
import {
  AccessLevel,
  AssessmentStatus,
  AssetType,
  BusinessArea,
  LifecycleStage,
  RiskLevel,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const businessOwner = String(body.businessOwner || "").trim();

  if (!name || !description || !businessOwner) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let slug = slugify(name);
  const existing = await prisma.agent.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const agent = await prisma.agent.create({
    data: {
      slug,
      name,
      shortDescription: description.slice(0, 180),
      description,
      agentId: `AGT-DEMO-${Date.now().toString().slice(-5)}`,
      businessArea: (body.businessArea as BusinessArea) || BusinessArea.ENABLING_FUNCTIONS,
      businessCapability: "General",
      useCase: description.slice(0, 120),
      businessCriticality: "Medium",
      valueBenefit: "Registered via workshop prototype",
      platform: String(body.platform || "UPTIMIZE Foundry"),
      lifecycleStage: (body.lifecycleStage as LifecycleStage) || LifecycleStage.IDEA,
      businessOwner,
      businessOwnerEmail: `${slugify(businessOwner)}@example.com`,
      technicalOwner: businessOwner,
      technicalOwnerEmail: `${slugify(businessOwner)}@example.com`,
      backupOwner: "To be assigned",
      backupOwnerEmail: "backup@example.com",
      supportContact: "support@example.com",
      riskLevel: (body.riskLevel as RiskLevel) || RiskLevel.NOT_ASSESSED,
      riskAssessmentStatus: AssessmentStatus.PENDING,
      dataClassification: "Internal",
      personalData: false,
      gxpRelevant: false,
      cyberReviewStatus: "Pending",
      responsibleAiStatus: AssessmentStatus.PENDING,
      humanOversight: "Required",
      certified: false,
      accessLevel: (body.accessLevel as AccessLevel) || AccessLevel.APPROVAL_REQUIRED,
      accessLeadTime: "2–5 business days",
      version: "0.1",
      framework: "Prototype",
      model: "Not specified",
      autonomyLevel: "Advisory",
      invocationType: "Chat",
      environments: "Dev",
      monthlyRuns: 0,
      successRate: 0,
      averageLatencyMs: 0,
      monthlyCost: "n/a",
      rating: 0,
      ratingCount: 0,
      subscriberCount: 0,
      reviewCadence: "Annual",
      nextReviewAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      tags: "Prototype,Registered",
      capabilityCategory: "Automation",
      usageLimitations: "Demo record created in workshop prototype",
      capabilities: {
        create: [{ name: "Initial capability", description: "To be refined by owner" }],
      },
      faqItems: {
        create: [
          {
            question: "What is this agent intended for?",
            answer: description,
          },
          {
            question: "How do I request access?",
            answer: "Use Request access on the agent detail page.",
          },
        ],
      },
    },
  });

  await prisma.activity.create({
    data: {
      title: "Agent registered",
      description: `${agent.name} was registered via the prototype form.`,
      actor: "Christina H.",
      assetType: AssetType.AGENT,
      assetName: agent.name,
      assetSlug: agent.slug,
      agentId: agent.id,
    },
  });

  return NextResponse.json({ id: agent.id, slug: agent.slug });
}
