"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Flag,
  Star,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CertificationBadge } from "@/components/ui/CertificationBadge";
import { LifecycleBadge } from "@/components/ui/LifecycleBadge";
import { UsagePolicyBadge } from "@/components/ui/UsagePolicyBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";
import { RequestAccessModal } from "@/components/modals/RequestAccessModal";
import { FlagIssueModal } from "@/components/modals/FlagIssueModal";
import {
  DependencyGraph,
  type DependencyEdge,
  type DependencyNode,
} from "@/components/agents/DependencyGraph";
import { ActivityTimeline } from "@/components/activity/ActivityTimeline";
import { MetadataCompleteness } from "@/components/governance/MetadataCompleteness";
import { useToast } from "@/components/providers/ToastProvider";
import { computeMetadataCompleteness } from "@/lib/metadata-requirements";
import {
  accessLabels,
  assessmentLabels,
  businessAreaLabels,
} from "@/lib/labels";
import { daysUntil, formatNumber, initials, parseTags, relativeTime } from "@/lib/utils";
import type {
  AccessLevel,
  AssessmentStatus,
  BusinessArea,
  LifecycleStage,
  RiskLevel,
  Severity,
} from "@prisma/client";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "technical", label: "Technical" },
  { id: "capabilities", label: "Capabilities" },
  { id: "tools", label: "Tools & MCP" },
  { id: "data", label: "Data & Knowledge" },
  { id: "governance", label: "Governance" },
  { id: "dependencies", label: "Dependencies" },
  { id: "qa", label: "Q&A" },
  { id: "activity", label: "Activity" },
];

type AgentDetail = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  agentId: string;
  solutionType: string;
  agentPattern: string;
  originType: string;
  visibility: string;
  usagePolicy: string;
  repositoryEligibility: string;
  useCaseBindingStatus: string;
  reusableStatus: string;
  businessArea: BusinessArea;
  businessUnit: string | null;
  businessCapability: string;
  useCase: string;
  businessCriticality: string;
  valueBenefit: string;
  costNote: string | null;
  actualCost: string | null;
  costModel: string | null;
  costCenter: string | null;
  costPer1kRuns: string | null;
  platform: string;
  lifecycleStage: LifecycleStage;
  registrationStatus: string;
  approvalStatus: string;
  businessOwner: string;
  businessOwnerEmail: string;
  technicalOwner: string;
  technicalOwnerEmail: string;
  backupOwner: string | null;
  backupOwnerEmail: string | null;
  supportContact: string | null;
  targetPersonas: string | null;
  riskLevel: RiskLevel;
  riskAssessmentStatus: AssessmentStatus;
  dataClassification: string;
  personalData: boolean;
  gxpRelevant: boolean;
  cyberReviewStatus: string;
  responsibleAiStatus: AssessmentStatus;
  humanOversight: string;
  regulatoryScope: string | null;
  certified: boolean;
  accessLevel: AccessLevel;
  accessLeadTime: string | null;
  version: string;
  framework: string | null;
  model: string | null;
  runtime: string | null;
  autonomyLevel: string | null;
  invocationType: string | null;
  environments: string;
  declaredResourcesSummary: string | null;
  observedResourcesSummary: string | null;
  observabilityNotes: string | null;
  autoDiscoveryMode: string | null;
  notificationPolicy: string | null;
  escalationPolicy: string | null;
  auditLoggingPolicy: string | null;
  emergencyShutdownStrategy: string | null;
  shutdownProcedureStatus: string | null;
  shutdownLastTestedAt: string | null;
  emergencyContact: string | null;
  monthlyRuns: number;
  successRate: number;
  averageLatencyMs: number;
  monthlyCost: string | null;
  rating: number;
  ratingCount: number;
  subscriberCount: number;
  reviewCadence: string | null;
  nextReviewAt: string | null;
  tags: string;
  usageLimitations: string | null;
  firstRegisteredBy: string | null;
  lastModifiedBy: string | null;
  updatedAt: string;
  createdAt: string;
  saved: boolean;
  linkedUseCase: { id: string; slug: string; name: string; useCaseId: string } | null;
  productMemberships: {
    role: string;
    agentProduct: { id: string; slug: string; name: string; lifecycleStage: LifecycleStage };
  }[];
  capabilities: { id: string; name: string; description: string }[];
  dataAssets: {
    id: string;
    name: string;
    description: string;
    direction: string;
    classification: string | null;
    sensitivity: string | null;
    sourceType: string | null;
  }[];
  knowledgeSources: {
    id: string;
    name: string;
    description: string;
    classification: string | null;
    sourceType: string | null;
  }[];
  faqItems: { id: string; question: string; answer: string }[];
  mcpServers: {
    id: string;
    slug: string;
    name: string;
    status: string;
    authType: string;
    owner: string;
    origin: string;
    toolCount: number;
    classification: string;
    tools: { id: string; name: string; description: string; observed: boolean }[];
  }[];
  skills: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    status?: string;
  }[];
  rules: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    severity: Severity;
    scope: string;
    description: string;
    status?: string;
  }[];
  guides: { id: string; slug: string; name: string }[];
  hooks: { id: string; slug: string; name: string }[];
  dependencies: {
    id: string;
    slug: string;
    name: string;
    relationLabel?: string | null;
    lifecycleStage?: LifecycleStage;
  }[];
  dependents: {
    id: string;
    slug: string;
    name: string;
    relationLabel?: string | null;
    lifecycleStage?: LifecycleStage;
  }[];
  dependencyGraph: { nodes: DependencyNode[]; edges: DependencyEdge[] };
  activities: {
    id: string;
    title: string;
    description: string;
    actor: string;
    createdAt: string;
    assetType:
      | "AGENT"
      | "AGENT_PRODUCT"
      | "MCP_SERVER"
      | "SKILL"
      | "RULE"
      | "GUIDE"
      | "HOOK"
      | "USE_CASE"
      | "DATA_ASSET"
      | "DATA_PRODUCT"
      | "GLOSSARY_TERM"
      | "DATA_DOMAIN"
      | null;
    assetName: string | null;
    assetSlug: string | null;
  }[];
};

function OwnerRow({ name, email, role }: { name: string; email: string; role: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
        {initials(name)}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted">{role}</div>
        <div className="truncate text-sm font-medium text-navy">{name}</div>
        {email ? (
          <a href={`mailto:${email}`} className="truncate text-[12px] text-primary hover:underline">
            {email}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-sm font-semibold text-navy">{children}</h3>;
}

export function AgentDetailClient({ agent }: { agent: AgentDetail }) {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [requestOpen, setRequestOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [rating, setRating] = useState(agent.rating);
  const [ratingCount, setRatingCount] = useState(agent.ratingCount);
  const days = daysUntil(agent.nextReviewAt);
  const ctaLabel = agent.accessLevel === "OPEN" ? "Use agent" : "Request access";

  const completeness = useMemo(
    () =>
      computeMetadataCompleteness({
        ...agent,
        rulesCount: agent.rules.length,
        dependenciesCount: agent.dependencies.length,
      }),
    [agent]
  );

  const onPrimary = () => {
    if (agent.accessLevel === "OPEN") {
      toast("Available in production version");
      return;
    }
    setRequestOpen(true);
  };

  const submitRating = async () => {
    setRatingBusy(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selectedRating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setRating(data.rating);
      setRatingCount(data.ratingCount);
      toast("Thanks for your rating", "success");
      setRatingOpen(false);
    } catch {
      toast("Could not submit rating", "error");
    } finally {
      setRatingBusy(false);
    }
  };

  const checklist = [
    { ok: !!agent.businessOwner, label: "Business owner assigned" },
    { ok: !!agent.backupOwner && agent.backupOwner !== "To be assigned", label: "Backup owner assigned" },
    { ok: agent.riskAssessmentStatus === "ASSESSED", label: "Risk assessment completed" },
    { ok: agent.responsibleAiStatus === "ASSESSED", label: "Responsible AI assessment completed" },
    {
      ok:
        agent.cyberReviewStatus === "Approved" ||
        agent.cyberReviewStatus.toLowerCase().includes("reviewed"),
      label: "Cyber Security reviewed",
    },
    { ok: !!agent.humanOversight, label: "Human oversight defined" },
    { ok: !!agent.dataClassification, label: "Data classification documented" },
    { ok: !!agent.linkedUseCase || !!agent.useCase, label: "Use case linked" },
    {
      ok:
        agent.approvalStatus === "Approved" ||
        agent.approvalStatus.toLowerCase().includes("approved"),
      label: "Approval / sign-off present",
    },
    {
      ok: !!agent.emergencyShutdownStrategy,
      label: "Emergency shutdown documented",
    },
  ];

  return (
    <div className="space-y-4">
      <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to agents
      </Link>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-[12px] border border-border bg-white p-5 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-navy">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {rating > 0 ? rating.toFixed(1) : "—"}
                <span className="text-muted">({ratingCount})</span>
              </span>
              <StatusBadge tone="blue">AI AGENT</StatusBadge>
              <LifecycleBadge stage={agent.lifecycleStage} />
              <CertificationBadge certified={agent.certified} />
              <StatusBadge tone="navy">{agent.solutionType}</StatusBadge>
              <StatusBadge tone="teal">{agent.agentPattern}</StatusBadge>
              <StatusBadge tone="purple">{agent.originType}</StatusBadge>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
                Prototype — demo data
              </span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-3xl">
                <h1 className="text-[28px] font-semibold tracking-tight text-navy">{agent.name}</h1>
                <p className="mt-2 text-[14px] leading-relaxed text-[#4A5568]">{agent.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right text-[12px] text-muted">
                <SaveButton
                  assetType="AGENT"
                  assetId={agent.id}
                  assetSlug={agent.slug}
                  assetName={agent.name}
                  initiallySaved={agent.saved}
                />
                <div className="font-medium text-navy">{formatNumber(agent.monthlyRuns)} runs / month</div>
                <div className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {formatNumber(agent.subscriberCount)} subscribers
                </div>
                <div>v{agent.version}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Business Area", value: businessAreaLabels[agent.businessArea] },
                { label: "Business Capability", value: agent.businessCapability },
                { label: "Platform", value: agent.platform },
                { label: "Updated", value: relativeTime(agent.updatedAt) },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{m.label}</div>
                  <div className="mt-0.5 text-sm font-medium text-navy">{m.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {parseTags(agent.tags).map((tag) => (
                <span key={tag} className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onPrimary}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                {ctaLabel}
              </button>
              <button
                type="button"
                onClick={() => toast("Available in production version")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-bg"
              >
                <BookOpen className="h-4 w-4" />
                View documentation
              </button>
              <button
                type="button"
                onClick={() => setFlagOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-bg"
              >
                <Flag className="h-4 w-4" />
                Flag issue
              </button>
              <button
                type="button"
                onClick={() => setRatingOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-bg"
              >
                <Star className="h-4 w-4" />
                Rate agent
              </button>
            </div>
          </section>

          <section className="rounded-[12px] border border-border bg-white shadow-sm">
            <div className="px-4 pt-2">
              <Tabs tabs={tabs} active={tab} onChange={setTab} />
            </div>
            <div className="p-5">
              {tab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <SectionTitle>Business context</SectionTitle>
                    <PropertyGrid
                      items={[
                        {
                          label: "Use case",
                          value: agent.linkedUseCase ? (
                            <span>
                              {agent.linkedUseCase.name}
                              <span className="mt-0.5 block text-[11px] font-normal text-muted">
                                {agent.linkedUseCase.useCaseId}
                              </span>
                            </span>
                          ) : (
                            agent.useCase
                          ),
                        },
                        { label: "Business unit", value: agent.businessUnit },
                        { label: "Business capability", value: agent.businessCapability },
                        { label: "Criticality", value: agent.businessCriticality },
                        { label: "Value / benefit", value: agent.valueBenefit },
                        { label: "Cost", value: agent.actualCost || agent.costNote || agent.monthlyCost },
                        { label: "Cost center", value: agent.costCenter },
                        { label: "Target personas", value: agent.targetPersonas },
                        {
                          label: "Usage policy",
                          value: <UsagePolicyBadge policy={agent.usagePolicy} />,
                        },
                      ]}
                    />
                  </div>
                  <div>
                    <SectionTitle>Ownership</SectionTitle>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <OwnerRow name={agent.businessOwner} email={agent.businessOwnerEmail} role="Business Owner" />
                      <OwnerRow name={agent.technicalOwner} email={agent.technicalOwnerEmail} role="Technical Owner" />
                      {agent.backupOwner ? (
                        <OwnerRow
                          name={agent.backupOwner}
                          email={agent.backupOwnerEmail || ""}
                          role="Backup Owner"
                        />
                      ) : null}
                      {agent.supportContact ? (
                        <div className="rounded-lg border border-border bg-[#FAFBFC] px-3 py-2.5">
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted">
                            Support contact
                          </div>
                          <a className="mt-1 block text-sm font-medium text-primary hover:underline" href={`mailto:${agent.supportContact}`}>
                            {agent.supportContact}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <SectionTitle>Lifecycle & registration</SectionTitle>
                    <p className="mb-3 text-[12px] text-muted">
                      Registration status reflects repository onboarding. Lifecycle stage reflects runtime maturity.
                    </p>
                    <PropertyGrid
                      items={[
                        {
                          label: "Lifecycle stage",
                          value: <LifecycleBadge stage={agent.lifecycleStage} />,
                        },
                        { label: "Registration status", value: agent.registrationStatus },
                        { label: "Approval status", value: agent.approvalStatus },
                        {
                          label: "Created",
                          value: new Date(agent.createdAt).toLocaleDateString(),
                        },
                        {
                          label: "Updated",
                          value: relativeTime(agent.updatedAt),
                        },
                        {
                          label: "Next review",
                          value: agent.nextReviewAt
                            ? `${new Date(agent.nextReviewAt).toLocaleDateString()} (${days ?? "?"} days)`
                            : "—",
                        },
                      ]}
                    />
                  </div>
                </div>
              )}

              {tab === "technical" && (
                <PropertyGrid
                  items={[
                    { label: "Agent ID", value: agent.agentId },
                    { label: "Version", value: `v${agent.version}` },
                    { label: "Framework", value: agent.framework },
                    { label: "Model", value: agent.model },
                    { label: "Runtime", value: agent.runtime },
                    { label: "Agent pattern", value: agent.agentPattern },
                    { label: "Autonomy level", value: agent.autonomyLevel },
                    { label: "Invocation type", value: agent.invocationType },
                    { label: "Environments", value: agent.environments },
                    { label: "Declared resources", value: agent.declaredResourcesSummary },
                    { label: "Observed resources", value: agent.observedResourcesSummary },
                    { label: "Observability metrics", value: agent.observabilityNotes },
                    { label: "Auto discovery", value: agent.autoDiscoveryMode },
                    { label: "Platform", value: agent.platform },
                    { label: "Origin", value: agent.originType },
                  ]}
                />
              )}

              {tab === "capabilities" && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {agent.capabilities.map((c) => (
                      <div key={c.id} className="rounded-[10px] border border-border bg-[#FAFBFC] p-4">
                        <h4 className="text-sm font-semibold text-navy">{c.name}</h4>
                        <p className="mt-1 text-[13px] text-muted">{c.description}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <SectionTitle>Associated skills</SectionTitle>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {agent.skills.map((s) => (
                        <Link
                          key={s.id}
                          href={`/skills/${s.slug}`}
                          className="rounded-lg border border-border px-3 py-2 hover:border-primary/40"
                        >
                          <div className="text-sm font-medium text-primary">{s.name}</div>
                          <div className="text-[12px] text-muted">{s.shortDescription}</div>
                        </Link>
                      ))}
                      {agent.skills.length === 0 ? (
                        <p className="text-sm text-muted">No skills linked.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {tab === "tools" && (
                <div className="space-y-4">
                  {agent.mcpServers.length === 0 ? (
                    <p className="text-sm text-muted">No MCP servers linked.</p>
                  ) : (
                    agent.mcpServers.map((mcp) => {
                      const declared = mcp.tools.filter((t) => !t.observed);
                      const observed = mcp.tools.filter((t) => t.observed);
                      return (
                        <div key={mcp.id} className="overflow-hidden rounded-[12px] border border-border">
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#243443] px-4 py-3 text-white">
                            <div>
                              <Link href={`/mcp-servers/${mcp.slug}`} className="text-sm font-semibold hover:underline">
                                {mcp.name}
                              </Link>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/75">
                                <span>Origin: {mcp.origin}</span>
                                <span>Status: {mcp.status}</span>
                                <span>Owner: {mcp.owner}</span>
                                <span>Auth: {mcp.authType}</span>
                                <span>Class: {mcp.classification}</span>
                                <span>{mcp.toolCount} tools</span>
                              </div>
                            </div>
                          </div>
                          {observed.length > 0 ? (
                            <div>
                              <div className="border-b border-border bg-[#FAFBFC] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                                Observed tools
                              </div>
                              <div className="divide-y divide-border bg-white">
                                {observed.map((tool) => (
                                  <div key={tool.id} className="grid grid-cols-[160px_1fr] gap-3 px-4 py-2.5 text-[13px]">
                                    <code className="font-medium text-navy">{tool.name}</code>
                                    <span className="text-muted">{tool.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {declared.length > 0 ? (
                            <div>
                              <div className="border-b border-border bg-[#FAFBFC] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                                Declared tools
                              </div>
                              <div className="divide-y divide-border bg-white">
                                {declared.map((tool) => (
                                  <div key={tool.id} className="grid grid-cols-[160px_1fr] gap-3 px-4 py-2.5 text-[13px]">
                                    <code className="font-medium text-navy">{tool.name}</code>
                                    <span className="text-muted">{tool.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {mcp.tools.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-muted">No tools listed.</div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {tab === "data" && (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[12px] border border-border p-4">
                      <SectionTitle>Inputs</SectionTitle>
                      <ul className="space-y-2">
                        {agent.dataAssets
                          .filter((d) => d.direction === "INPUT")
                          .map((d) => (
                            <li key={d.id} className="rounded-lg bg-[#FAFBFC] px-3 py-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-sm font-medium text-navy">{d.name}</div>
                                {d.classification ? (
                                  <StatusBadge tone="gray">{d.classification}</StatusBadge>
                                ) : null}
                              </div>
                              <div className="text-[12px] text-muted">{d.description}</div>
                              {d.sourceType ? (
                                <div className="mt-0.5 text-[11px] text-muted">Source: {d.sourceType}</div>
                              ) : null}
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div className="rounded-[12px] border border-border p-4">
                      <SectionTitle>Outputs</SectionTitle>
                      <ul className="space-y-2">
                        {agent.dataAssets
                          .filter((d) => d.direction === "OUTPUT")
                          .map((d) => (
                            <li key={d.id} className="rounded-lg bg-[#FAFBFC] px-3 py-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-sm font-medium text-navy">{d.name}</div>
                                {d.classification ? (
                                  <StatusBadge tone="gray">{d.classification}</StatusBadge>
                                ) : null}
                              </div>
                              <div className="text-[12px] text-muted">{d.description}</div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <SectionTitle>Knowledge sources</SectionTitle>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {agent.knowledgeSources.map((k) => (
                        <div key={k.id} className="rounded-lg border border-border px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-medium text-navy">{k.name}</div>
                            {k.classification ? (
                              <StatusBadge tone="gray">{k.classification}</StatusBadge>
                            ) : null}
                          </div>
                          <div className="text-[12px] text-muted">{k.description}</div>
                        </div>
                      ))}
                      {agent.knowledgeSources.length === 0 ? (
                        <p className="text-sm text-muted">No knowledge sources listed.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {tab === "governance" && (
                <div className="space-y-5">
                  <div className="rounded-[12px] border border-border p-4">
                    <SectionTitle>Governance checklist</SectionTitle>
                    <ul className="space-y-2 text-sm">
                      {checklist.map((item) => (
                        <li key={item.label} className="flex items-center gap-2">
                          {item.ok ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                          )}
                          {item.label}
                        </li>
                      ))}
                      <li className="flex items-center gap-2 text-muted">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                        Next review due in {days ?? "—"} days
                      </li>
                    </ul>
                  </div>

                  <div>
                    <SectionTitle>Risk & compliance</SectionTitle>
                    <PropertyGrid
                      items={[
                        { label: "Risk level", value: <RiskBadge level={agent.riskLevel} /> },
                        {
                          label: "Risk assessment",
                          value: assessmentLabels[agent.riskAssessmentStatus],
                        },
                        { label: "Data classification", value: agent.dataClassification },
                        { label: "Personal data", value: agent.personalData ? "Yes" : "No" },
                        { label: "GxP relevant", value: agent.gxpRelevant ? "Yes" : "No" },
                        {
                          label: "Responsible AI",
                          value: assessmentLabels[agent.responsibleAiStatus],
                        },
                        { label: "Cyber review", value: agent.cyberReviewStatus },
                        { label: "Human oversight", value: agent.humanOversight },
                        { label: "Regulatory scope", value: agent.regulatoryScope },
                        {
                          label: "Certification",
                          value: <CertificationBadge certified={agent.certified} />,
                        },
                      ]}
                    />
                  </div>

                  <div>
                    <SectionTitle>Guardrails</SectionTitle>
                    <div className="space-y-2">
                      {agent.rules.length === 0 ? (
                        <p className="text-sm text-muted">No guardrail rules linked.</p>
                      ) : (
                        agent.rules.map((rule) => (
                          <Link
                            key={rule.id}
                            href={`/rules/${rule.slug}`}
                            className="block rounded-[10px] border border-border p-3 hover:border-primary/40"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-navy">{rule.name}</span>
                              <StatusBadge
                                tone={
                                  rule.severity === "CRITICAL" || rule.severity === "HIGH"
                                    ? "red"
                                    : rule.severity === "MEDIUM"
                                      ? "amber"
                                      : "green"
                                }
                              >
                                {rule.severity}
                              </StatusBadge>
                            </div>
                            <p className="mt-1 text-[12px] text-muted">{rule.scope}</p>
                            <p className="mt-1 text-[13px] text-[#4A5568]">{rule.description}</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[12px] border border-border p-4">
                    <SectionTitle>Emergency controls</SectionTitle>
                    <p className="mb-3 text-[12px] text-muted">
                      Documentation and contact only — no live shutdown action in this prototype.
                    </p>
                    <PropertyGrid
                      items={[
                        { label: "Shutdown strategy", value: agent.emergencyShutdownStrategy },
                        { label: "Procedure status", value: agent.shutdownProcedureStatus },
                        {
                          label: "Last tested",
                          value: agent.shutdownLastTestedAt
                            ? new Date(agent.shutdownLastTestedAt).toLocaleDateString()
                            : "—",
                        },
                        { label: "Emergency contact", value: agent.emergencyContact },
                      ]}
                    />
                  </div>

                  <div>
                    <SectionTitle>Audit & review</SectionTitle>
                    <PropertyGrid
                      items={[
                        { label: "Review cadence", value: agent.reviewCadence },
                        {
                          label: "Next review",
                          value: agent.nextReviewAt
                            ? new Date(agent.nextReviewAt).toLocaleDateString()
                            : "—",
                        },
                        { label: "Audit logging", value: agent.auditLoggingPolicy },
                        { label: "Notifications", value: agent.notificationPolicy },
                        { label: "Escalation", value: agent.escalationPolicy },
                        { label: "First registered by", value: agent.firstRegisteredBy },
                        { label: "Last modified by", value: agent.lastModifiedBy },
                      ]}
                    />
                  </div>

                  <MetadataCompleteness data={completeness} />
                </div>
              )}

              {tab === "dependencies" && (
                <DependencyGraph
                  nodes={agent.dependencyGraph.nodes}
                  edges={agent.dependencyGraph.edges}
                  agentDependencies={agent.dependencies}
                  dependents={agent.dependents}
                />
              )}

              {tab === "activity" && <ActivityTimeline items={agent.activities} />}

              {tab === "qa" && (
                <div className="space-y-3">
                  {agent.faqItems.length === 0 ? (
                    <p className="text-sm text-muted">No FAQ items yet.</p>
                  ) : (
                    agent.faqItems.map((faq) => (
                      <div key={faq.id} className="rounded-[10px] border border-border p-4">
                        <h4 className="text-sm font-semibold text-navy">{faq.question}</h4>
                        <p className="mt-1 text-[13px] text-[#4A5568]">{faq.answer}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
            <div className="mb-1 text-sm font-semibold text-navy">{agent.name}</div>
            <div className="mb-3 text-[12px] text-muted">{agent.platform}</div>
            <dl className="space-y-2.5 text-[13px]">
              <GovRow label="Risk classification" value={<RiskBadge level={agent.riskLevel} />} />
              <GovRow label="Data classification" value={<span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-warning" />{agent.dataClassification}</span>} />
              <GovRow label="Personal data" value={<span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${agent.personalData ? "bg-warning" : "bg-muted"}`} />{agent.personalData ? "Yes" : "No"}</span>} />
              <GovRow label="GxP relevant" value={agent.gxpRelevant ? "GxP" : "Non-GxP"} />
              <GovRow
                label="Responsible AI"
                value={
                  <StatusBadge tone={agent.responsibleAiStatus === "ASSESSED" ? "green" : "amber"} dot>
                    {assessmentLabels[agent.responsibleAiStatus]}
                  </StatusBadge>
                }
              />
            </dl>
            <div className="mt-3 rounded-md bg-warning-bg px-3 py-2 text-[12px] font-medium text-warning">
              {accessLabels[agent.accessLevel]}
              {agent.accessLeadTime ? ` · ${agent.accessLeadTime}` : ""}
            </div>
            <button
              type="button"
              onClick={onPrimary}
              className="mt-3 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              {agent.accessLevel === "OPEN" ? "Use agent" : "Request agent access"}
            </button>
            <div className="mt-2 text-center text-[11px] text-muted">
              Visibility: {agent.visibility}
            </div>
          </div>

          <div className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-navy">Ownership</h3>
            <OwnerRow name={agent.businessOwner} email={agent.businessOwnerEmail} role="Business Owner" />
            <OwnerRow name={agent.technicalOwner} email={agent.technicalOwnerEmail} role="Technical Owner" />
            {agent.backupOwner ? (
              <OwnerRow
                name={agent.backupOwner}
                email={agent.backupOwnerEmail || ""}
                role="Backup Owner"
              />
            ) : null}
            {agent.supportContact ? (
              <div className="mt-2 border-t border-border pt-2 text-[12px] text-muted">
                Support:{" "}
                <a className="text-primary hover:underline" href={`mailto:${agent.supportContact}`}>
                  {agent.supportContact}
                </a>
              </div>
            ) : null}
          </div>

          <div className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-navy">Related assets</h3>
            <ul className="space-y-2">
              {agent.productMemberships.map((pm) => (
                <RelatedLink
                  key={pm.agentProduct.id}
                  href={`/agent-products/${pm.agentProduct.slug}`}
                  label={`${pm.agentProduct.name} (${pm.role})`}
                  kind="Agent Product"
                />
              ))}
              {agent.linkedUseCase ? (
                <RelatedLink
                  href="#"
                  label={agent.linkedUseCase.name}
                  kind="Use Case"
                />
              ) : null}
              {agent.mcpServers.slice(0, 3).map((m) => (
                <RelatedLink key={m.id} href={`/mcp-servers/${m.slug}`} label={m.name} kind="MCP Server" />
              ))}
              {agent.skills.slice(0, 3).map((s) => (
                <RelatedLink key={s.id} href={`/skills/${s.slug}`} label={s.name} kind="Skill" />
              ))}
              {agent.rules.slice(0, 3).map((r) => (
                <RelatedLink key={r.id} href={`/rules/${r.slug}`} label={r.name} kind="Rule" />
              ))}
              {agent.guides.slice(0, 2).map((g) => (
                <RelatedLink key={g.id} href={`/guides/${g.slug}`} label={g.name} kind="Guide" />
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <RequestAccessModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        assetName={agent.name}
        assetSlug={agent.slug}
        agentId={agent.id}
      />
      <FlagIssueModal
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        agentId={agent.id}
        agentName={agent.name}
      />

      {ratingOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div className="w-full max-w-sm rounded-[12px] border border-border bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-navy">Rate agent</h2>
            <p className="mt-1 text-sm text-muted">How useful is {agent.name}?</p>
            <div className="mt-4 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSelectedRating(n)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                    selectedRating === n
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border text-navy hover:bg-bg"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRatingOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={ratingBusy}
                onClick={submitRating}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GovRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-navy">{value}</dd>
    </div>
  );
}

function RelatedLink({ href, label, kind }: { href: string; label: string; kind: string }) {
  const content = (
    <>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted">{kind}</div>
        <div className="text-sm font-medium text-navy group-hover:text-primary">{label}</div>
      </div>
      {href !== "#" ? <ExternalLink className="mt-1 h-3.5 w-3.5 text-muted" /> : null}
    </>
  );
  return (
    <li>
      {href === "#" ? (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-border px-3 py-2">
          {content}
        </div>
      ) : (
        <Link
          href={href}
          className="group flex items-start justify-between gap-2 rounded-lg border border-border px-3 py-2 hover:border-primary/40"
        >
          {content}
        </Link>
      )}
    </li>
  );
}
