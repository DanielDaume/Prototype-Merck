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

function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  return fallback;
}

function str(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "Yes") return true;
  if (value === "false" || value === "No") return false;
  return fallback;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = str(body.name);
  const description = str(body.description);
  const businessOwner = str(body.businessOwner);

  if (!name || !description || !businessOwner) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let slug = slugify(name);
  const existing = await prisma.agent.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const technicalOwner = str(body.technicalOwner, businessOwner);
  const ownerEmailFallback = `${slugify(businessOwner)}@example.com`;

  const agent = await prisma.agent.create({
    data: {
      slug,
      name,
      shortDescription: description.slice(0, 180),
      description,
      agentId: str(body.agentId, `AGT-DEMO-${Date.now().toString().slice(-5)}`),
      solutionType: str(body.solutionType, "Agent Asset"),
      agentPattern: str(body.agentPattern, "Standalone"),
      originType: str(body.originType, "Internal"),
      visibility: str(body.visibility, "Enterprise Visible"),
      usagePolicy: str(body.usagePolicy, "Unlimited use"),
      repositoryEligibility: str(body.repositoryEligibility, "Eligible"),
      useCaseBindingStatus: str(body.useCaseBindingStatus, body.useCase ? "Linked" : "Pending"),
      reusableStatus: str(body.reusableStatus, "Yes"),
      businessArea: asEnum(
        body.businessArea,
        Object.values(BusinessArea),
        BusinessArea.ENABLING_FUNCTIONS
      ),
      businessUnit: str(body.businessUnit) || null,
      businessCapability: str(body.businessCapability, "General"),
      useCase: str(body.useCase, description.slice(0, 120)),
      businessCriticality: str(body.businessCriticality, "Medium"),
      valueBenefit: str(body.valueBenefit, "Registered via workshop prototype"),
      costNote: str(body.costNote) || null,
      actualCost: str(body.actualCost) || null,
      costCenter: str(body.costCenter) || null,
      platform: str(body.platform, "UPTIMIZE Foundry"),
      lifecycleStage: asEnum(
        body.lifecycleStage,
        Object.values(LifecycleStage),
        LifecycleStage.IDEA
      ),
      registrationStatus: str(body.registrationStatus, "Registered"),
      approvalStatus: str(body.approvalStatus, "Pending"),
      businessOwner,
      businessOwnerEmail: str(body.businessOwnerEmail, ownerEmailFallback),
      technicalOwner,
      technicalOwnerEmail: str(
        body.technicalOwnerEmail,
        `${slugify(technicalOwner)}@example.com`
      ),
      backupOwner: str(body.backupOwner) || "To be assigned",
      backupOwnerEmail: str(body.backupOwnerEmail) || "backup@example.com",
      supportContact: str(body.supportContact) || "support@example.com",
      targetPersonas: str(body.targetPersonas) || null,
      riskLevel: asEnum(body.riskLevel, Object.values(RiskLevel), RiskLevel.NOT_ASSESSED),
      riskAssessmentStatus: asEnum(
        body.riskAssessmentStatus,
        Object.values(AssessmentStatus),
        AssessmentStatus.PENDING
      ),
      dataClassification: str(body.dataClassification, "Internal"),
      personalData: bool(body.personalData, false),
      gxpRelevant: bool(body.gxpRelevant, false),
      cyberReviewStatus: str(body.cyberReviewStatus, "Pending"),
      responsibleAiStatus: asEnum(
        body.responsibleAiStatus,
        Object.values(AssessmentStatus),
        AssessmentStatus.PENDING
      ),
      humanOversight: str(body.humanOversight, "Required"),
      regulatoryScope: str(body.regulatoryScope) || null,
      certified: bool(body.certified, false),
      accessLevel: asEnum(
        body.accessLevel,
        Object.values(AccessLevel),
        AccessLevel.APPROVAL_REQUIRED
      ),
      accessLeadTime: str(body.accessLeadTime, "2–5 business days"),
      version: str(body.version, "0.1"),
      framework: str(body.framework) || "Prototype",
      model: str(body.model) || "Not specified",
      runtime: str(body.runtime) || null,
      autonomyLevel: str(body.autonomyLevel) || "Advisory",
      invocationType: str(body.invocationType) || "Chat",
      environments: str(body.environments, "Dev"),
      declaredResourcesSummary: str(body.declaredResourcesSummary) || null,
      observedResourcesSummary: str(body.observedResourcesSummary) || null,
      observabilityNotes: str(body.observabilityNotes) || null,
      autoDiscoveryMode: str(body.autoDiscoveryMode) || null,
      notificationPolicy: str(body.notificationPolicy) || null,
      escalationPolicy: str(body.escalationPolicy) || null,
      auditLoggingPolicy: str(body.auditLoggingPolicy) || null,
      emergencyShutdownStrategy: str(body.emergencyShutdownStrategy) || null,
      shutdownProcedureStatus: str(body.shutdownProcedureStatus) || null,
      emergencyContact: str(body.emergencyContact) || null,
      monthlyRuns: 0,
      successRate: 0,
      averageLatencyMs: 0,
      monthlyCost: str(body.monthlyCost) || "n/a",
      rating: 0,
      ratingCount: 0,
      subscriberCount: 0,
      reviewCadence: str(body.reviewCadence, "Annual"),
      nextReviewAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      tags: str(body.tags, "Prototype,Registered"),
      capabilityCategory: str(body.capabilityCategory, "Automation"),
      usageLimitations: str(body.usageLimitations) || "Demo record created in workshop prototype",
      firstRegisteredBy: "Christina H.",
      lastModifiedBy: "Christina H.",
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
      description: `${agent.name} was registered via the registration wizard.`,
      actor: "Christina H.",
      assetType: AssetType.AGENT,
      assetName: agent.name,
      assetSlug: agent.slug,
      agentId: agent.id,
    },
  });

  return NextResponse.json({ id: agent.id, slug: agent.slug });
}
