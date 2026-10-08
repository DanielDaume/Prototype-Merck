import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AgentDetailClient } from "@/components/agents/AgentDetailClient";
import type { DependencyEdge, DependencyNode } from "@/components/agents/DependencyGraph";

export const dynamic = "force-dynamic";

function buildDependencyGraph(input: {
  agent: { id: string; name: string; slug: string; lifecycleStage: string };
  mcpServers: { id: string; slug: string; name: string; status: string }[];
  skills: { id: string; slug: string; name: string; status?: string }[];
  rules: { id: string; slug: string; name: string }[];
  dependencies: { id: string; slug: string; name: string; lifecycleStage?: string }[];
  dependents: { id: string; slug: string; name: string; lifecycleStage?: string }[];
}): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
  const nodes: DependencyNode[] = [];
  const edges: DependencyEdge[] = [];
  const seen = new Set<string>();

  const add = (node: DependencyNode) => {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    nodes.push(node);
  };

  // Upstream: MCP servers (and a system node when SAP-related)
  const hasSap = input.mcpServers.some((m) => m.name.toLowerCase().includes("sap"));
  if (hasSap) {
    add({
      id: "sys-sap",
      label: "SAP S/4HANA",
      tone: "system",
      kind: "System",
      side: "upstream",
    });
    edges.push({ from: "sys-sap", to: "agent" });
  }
  for (const mcp of input.mcpServers) {
    add({
      id: `mcp-${mcp.id}`,
      label: mcp.name,
      href: `/mcp-servers/${mcp.slug}`,
      tone: "mcp",
      kind: "MCP Server",
      status: mcp.status,
      side: "upstream",
    });
    edges.push({ from: `mcp-${mcp.id}`, to: "agent", label: "feeds" });
  }

  add({
    id: "agent",
    label: input.agent.name,
    href: `/agents/${input.agent.slug}`,
    tone: "agent",
    kind: "AI Agent",
    status: input.agent.lifecycleStage,
    side: "center",
  });

  // Downstream: dependent agents, skills, rules
  for (const dep of input.dependencies) {
    add({
      id: `agent-dep-${dep.id}`,
      label: dep.name,
      href: `/agents/${dep.slug}`,
      tone: "agent",
      kind: "Agent",
      status: dep.lifecycleStage,
      side: "downstream",
    });
    edges.push({ from: "agent", to: `agent-dep-${dep.id}`, label: "depends on" });
  }
  for (const dep of input.dependents) {
    add({
      id: `dep-${dep.id}`,
      label: dep.name,
      href: `/agents/${dep.slug}`,
      tone: "agent",
      kind: "Downstream agent",
      status: dep.lifecycleStage,
      side: "downstream",
    });
    edges.push({ from: "agent", to: `dep-${dep.id}`, label: "used by" });
  }
  for (const skill of input.skills.slice(0, 2)) {
    add({
      id: `skill-${skill.id}`,
      label: skill.name,
      href: `/skills/${skill.slug}`,
      tone: "skill",
      kind: "Skill",
      status: skill.status,
      side: "downstream",
    });
    edges.push({ from: "agent", to: `skill-${skill.id}` });
  }
  for (const rule of input.rules.slice(0, 2)) {
    add({
      id: `rule-${rule.id}`,
      label: rule.name,
      href: `/rules/${rule.slug}`,
      tone: "rule",
      kind: "Rule",
      side: "downstream",
    });
    edges.push({ from: "agent", to: `rule-${rule.id}` });
  }

  return { nodes, edges };
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await prisma.agent.findUnique({
    where: { slug },
    include: {
      linkedUseCase: true,
      capabilities: true,
      dataAssets: true,
      knowledgeSources: true,
      faqItems: true,
      productMemberships: {
        include: { agentProduct: true },
        orderBy: { sortOrder: "asc" },
      },
      mcpServers: {
        include: {
          mcpServer: { include: { tools: true } },
        },
      },
      skills: { include: { skill: true } },
      rules: { include: { rule: true } },
      guides: { include: { guide: true } },
      hooks: { include: { hook: true } },
      dependencies: { include: { dependsOnAgent: true } },
      dependents: { include: { agent: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 12 },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });

  if (!agent) notFound();

  const mcpServers = agent.mcpServers.map((m) => ({
    id: m.mcpServer.id,
    slug: m.mcpServer.slug,
    name: m.mcpServer.name,
    status: m.mcpServer.status,
    authType: m.mcpServer.authType,
    owner: m.mcpServer.owner,
    origin: m.mcpServer.origin,
    toolCount: m.mcpServer.toolCount,
    classification: m.mcpServer.classification,
    tools: m.mcpServer.tools.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      observed: t.observed,
    })),
  }));

  const skills = agent.skills.map((s) => ({
    id: s.skill.id,
    slug: s.skill.slug,
    name: s.skill.name,
    shortDescription: s.skill.shortDescription,
    status: s.skill.status,
  }));

  const rules = agent.rules.map((r) => ({
    id: r.rule.id,
    slug: r.rule.slug,
    name: r.rule.name,
    shortDescription: r.rule.shortDescription,
    severity: r.rule.severity,
    scope: r.rule.scope,
    description: r.rule.description,
    status: r.rule.status,
  }));

  const dependencies = agent.dependencies.map((d) => ({
    id: d.dependsOnAgent.id,
    slug: d.dependsOnAgent.slug,
    name: d.dependsOnAgent.name,
    relationLabel: d.relationLabel,
    lifecycleStage: d.dependsOnAgent.lifecycleStage,
  }));

  const dependents = agent.dependents.map((d) => ({
    id: d.agent.id,
    slug: d.agent.slug,
    name: d.agent.name,
    relationLabel: d.relationLabel,
    lifecycleStage: d.agent.lifecycleStage,
  }));

  const graph = buildDependencyGraph({
    agent: {
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      lifecycleStage: agent.lifecycleStage,
    },
    mcpServers,
    skills,
    rules,
    dependencies,
    dependents,
  });

  return (
    <AgentDetailClient
      agent={{
        id: agent.id,
        slug: agent.slug,
        name: agent.name,
        shortDescription: agent.shortDescription,
        description: agent.description,
        agentId: agent.agentId,
        solutionType: agent.solutionType,
        agentPattern: agent.agentPattern,
        originType: agent.originType,
        visibility: agent.visibility,
        usagePolicy: agent.usagePolicy,
        repositoryEligibility: agent.repositoryEligibility,
        useCaseBindingStatus: agent.useCaseBindingStatus,
        reusableStatus: agent.reusableStatus,
        businessArea: agent.businessArea,
        businessUnit: agent.businessUnit,
        businessCapability: agent.businessCapability,
        useCase: agent.useCase,
        businessCriticality: agent.businessCriticality,
        valueBenefit: agent.valueBenefit,
        costNote: agent.costNote,
        actualCost: agent.actualCost,
        costModel: agent.costModel,
        costCenter: agent.costCenter,
        costPer1kRuns: agent.costPer1kRuns,
        platform: agent.platform,
        lifecycleStage: agent.lifecycleStage,
        registrationStatus: agent.registrationStatus,
        approvalStatus: agent.approvalStatus,
        businessOwner: agent.businessOwner,
        businessOwnerEmail: agent.businessOwnerEmail,
        technicalOwner: agent.technicalOwner,
        technicalOwnerEmail: agent.technicalOwnerEmail,
        backupOwner: agent.backupOwner,
        backupOwnerEmail: agent.backupOwnerEmail,
        supportContact: agent.supportContact,
        targetPersonas: agent.targetPersonas,
        riskLevel: agent.riskLevel,
        riskAssessmentStatus: agent.riskAssessmentStatus,
        dataClassification: agent.dataClassification,
        personalData: agent.personalData,
        gxpRelevant: agent.gxpRelevant,
        cyberReviewStatus: agent.cyberReviewStatus,
        responsibleAiStatus: agent.responsibleAiStatus,
        humanOversight: agent.humanOversight,
        regulatoryScope: agent.regulatoryScope,
        certified: agent.certified,
        accessLevel: agent.accessLevel,
        accessLeadTime: agent.accessLeadTime,
        version: agent.version,
        framework: agent.framework,
        model: agent.model,
        runtime: agent.runtime,
        autonomyLevel: agent.autonomyLevel,
        invocationType: agent.invocationType,
        environments: agent.environments,
        declaredResourcesSummary: agent.declaredResourcesSummary,
        observedResourcesSummary: agent.observedResourcesSummary,
        observabilityNotes: agent.observabilityNotes,
        autoDiscoveryMode: agent.autoDiscoveryMode,
        notificationPolicy: agent.notificationPolicy,
        escalationPolicy: agent.escalationPolicy,
        auditLoggingPolicy: agent.auditLoggingPolicy,
        emergencyShutdownStrategy: agent.emergencyShutdownStrategy,
        shutdownProcedureStatus: agent.shutdownProcedureStatus,
        shutdownLastTestedAt: agent.shutdownLastTestedAt?.toISOString() ?? null,
        emergencyContact: agent.emergencyContact,
        monthlyRuns: agent.monthlyRuns,
        successRate: agent.successRate,
        averageLatencyMs: agent.averageLatencyMs,
        monthlyCost: agent.monthlyCost,
        rating: agent.rating,
        ratingCount: agent.ratingCount,
        subscriberCount: agent.subscriberCount,
        reviewCadence: agent.reviewCadence,
        nextReviewAt: agent.nextReviewAt?.toISOString() ?? null,
        tags: agent.tags,
        usageLimitations: agent.usageLimitations,
        firstRegisteredBy: agent.firstRegisteredBy,
        lastModifiedBy: agent.lastModifiedBy,
        updatedAt: agent.updatedAt.toISOString(),
        createdAt: agent.createdAt.toISOString(),
        saved: agent.savedItems.length > 0,
        linkedUseCase: agent.linkedUseCase
          ? {
              id: agent.linkedUseCase.id,
              slug: agent.linkedUseCase.slug,
              name: agent.linkedUseCase.name,
              useCaseId: agent.linkedUseCase.useCaseId,
            }
          : null,
        productMemberships: agent.productMemberships.map((pm) => ({
          role: pm.role,
          agentProduct: {
            id: pm.agentProduct.id,
            slug: pm.agentProduct.slug,
            name: pm.agentProduct.name,
            lifecycleStage: pm.agentProduct.lifecycleStage,
          },
        })),
        capabilities: agent.capabilities,
        dataAssets: agent.dataAssets.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          direction: d.direction,
          classification: d.classification,
          sensitivity: d.sensitivity,
          sourceType: d.sourceType,
        })),
        knowledgeSources: agent.knowledgeSources.map((k) => ({
          id: k.id,
          name: k.name,
          description: k.description,
          classification: k.classification,
          sourceType: k.sourceType,
        })),
        faqItems: agent.faqItems,
        mcpServers,
        skills,
        rules,
        guides: agent.guides.map((g) => ({
          id: g.guide.id,
          slug: g.guide.slug,
          name: g.guide.name,
        })),
        hooks: agent.hooks.map((h) => ({
          id: h.hook.id,
          slug: h.hook.slug,
          name: h.hook.name,
        })),
        dependencies,
        dependents,
        dependencyGraph: graph,
        activities: agent.activities.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          actor: a.actor,
          createdAt: a.createdAt.toISOString(),
          assetType: a.assetType,
          assetName: a.assetName,
          assetSlug: a.assetSlug,
        })),
      }}
    />
  );
}
