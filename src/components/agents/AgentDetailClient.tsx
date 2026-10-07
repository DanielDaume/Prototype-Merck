"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Star,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CertificationBadge } from "@/components/ui/CertificationBadge";
import { LifecycleBadge } from "@/components/ui/LifecycleBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";
import { RequestAccessModal } from "@/components/modals/RequestAccessModal";
import { DependencyGraph } from "@/components/agents/DependencyGraph";
import { ActivityTimeline } from "@/components/activity/ActivityTimeline";
import { useToast } from "@/components/providers/ToastProvider";
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
  { id: "capabilities", label: "Capabilities" },
  { id: "tools", label: "Tools & MCP" },
  { id: "data", label: "Data & Knowledge" },
  { id: "governance", label: "Governance" },
  { id: "dependencies", label: "Dependencies" },
  { id: "activity", label: "Activity" },
  { id: "qa", label: "Q&A" },
];

type AgentDetail = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  agentId: string;
  solutionType: string;
  businessArea: BusinessArea;
  businessCapability: string;
  useCase: string;
  businessCriticality: string;
  valueBenefit: string;
  costNote: string | null;
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
  riskLevel: RiskLevel;
  riskAssessmentStatus: AssessmentStatus;
  dataClassification: string;
  personalData: boolean;
  gxpRelevant: boolean;
  cyberReviewStatus: string;
  responsibleAiStatus: AssessmentStatus;
  humanOversight: string;
  certified: boolean;
  accessLevel: AccessLevel;
  accessLeadTime: string | null;
  version: string;
  framework: string | null;
  model: string | null;
  autonomyLevel: string | null;
  invocationType: string | null;
  environments: string;
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
  updatedAt: string;
  createdAt: string;
  saved: boolean;
  capabilities: { id: string; name: string; description: string }[];
  dataAssets: { id: string; name: string; description: string; direction: string }[];
  knowledgeSources: { id: string; name: string; description: string }[];
  faqItems: { id: string; question: string; answer: string }[];
  mcpServers: {
    id: string;
    slug: string;
    name: string;
    status: string;
    authType: string;
    owner: string;
    toolCount: number;
    classification: string;
    tools: { id: string; name: string; description: string }[];
  }[];
  skills: { id: string; slug: string; name: string; shortDescription: string }[];
  rules: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    severity: Severity;
    scope: string;
    description: string;
  }[];
  guides: { id: string; slug: string; name: string }[];
  hooks: { id: string; slug: string; name: string }[];
  dependencies: { id: string; slug: string; name: string }[];
  activities: {
    id: string;
    title: string;
    description: string;
    actor: string;
    createdAt: string;
    assetType: "AGENT" | "MCP_SERVER" | "SKILL" | "RULE" | "GUIDE" | "HOOK" | null;
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
        <a href={`mailto:${email}`} className="truncate text-[12px] text-primary hover:underline">
          {email}
        </a>
      </div>
    </div>
  );
}

export function AgentDetailClient({ agent }: { agent: AgentDetail }) {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [requestOpen, setRequestOpen] = useState(false);
  const days = daysUntil(agent.nextReviewAt);
  const ctaLabel = agent.accessLevel === "OPEN" ? "Use agent" : "Request access";

  const onPrimary = () => {
    if (agent.accessLevel === "OPEN") {
      toast("Available in production version");
      return;
    }
    setRequestOpen(true);
  };

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
                {agent.rating > 0 ? agent.rating.toFixed(1) : "—"}
                <span className="text-muted">({agent.ratingCount})</span>
              </span>
              <StatusBadge tone="blue">AI AGENT</StatusBadge>
              <LifecycleBadge stage={agent.lifecycleStage} />
              <CertificationBadge certified={agent.certified} />
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
                    <h3 className="mb-3 text-sm font-semibold text-navy">Business context</h3>
                    <PropertyGrid
                      items={[
                        { label: "Use case", value: agent.useCase },
                        { label: "Business capability", value: agent.businessCapability },
                        { label: "Value / benefit", value: agent.valueBenefit },
                        { label: "Criticality", value: agent.businessCriticality },
                        { label: "Cost", value: agent.costNote || "—" },
                        { label: "Usage limitations", value: agent.usageLimitations || "—" },
                      ]}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-navy">Technical properties</h3>
                    <PropertyGrid
                      items={[
                        { label: "Agent ID", value: agent.agentId },
                        { label: "Version", value: `v${agent.version}` },
                        { label: "Framework", value: agent.framework },
                        { label: "Model / platform", value: agent.model },
                        { label: "Autonomy level", value: agent.autonomyLevel },
                        { label: "Invocation type", value: agent.invocationType },
                        { label: "Environments", value: agent.environments },
                        { label: "Solution type", value: agent.solutionType },
                      ]}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-navy">Operational health</h3>
                    <PropertyGrid
                      items={[
                        { label: "Runs last 30 days", value: formatNumber(agent.monthlyRuns) },
                        { label: "Success rate", value: `${agent.successRate}%` },
                        { label: "Average latency", value: `${agent.averageLatencyMs} ms` },
                        { label: "Estimated monthly cost", value: agent.monthlyCost || "—" },
                      ]}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-navy">Review information</h3>
                    <PropertyGrid
                      items={[
                        { label: "Registration status", value: agent.registrationStatus },
                        { label: "Approval status", value: agent.approvalStatus },
                        { label: "Review cadence", value: agent.reviewCadence },
                        {
                          label: "Next review",
                          value: agent.nextReviewAt
                            ? `${new Date(agent.nextReviewAt).toLocaleDateString()} (${days ?? "?"} days)`
                            : "—",
                        },
                        { label: "Last updated", value: relativeTime(agent.updatedAt) },
                        { label: "Access", value: accessLabels[agent.accessLevel] },
                      ]}
                    />
                  </div>
                </div>
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
                    <h3 className="mb-2 text-sm font-semibold text-navy">Associated skills</h3>
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
                    </div>
                  </div>
                </div>
              )}

              {tab === "tools" && (
                <div className="space-y-4">
                  {agent.mcpServers.length === 0 ? (
                    <p className="text-sm text-muted">No MCP servers linked.</p>
                  ) : (
                    agent.mcpServers.map((mcp) => (
                      <div key={mcp.id} className="rounded-[12px] border border-border overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#243443] px-4 py-3 text-white">
                          <div>
                            <Link href={`/mcp-servers/${mcp.slug}`} className="text-sm font-semibold hover:underline">
                              {mcp.name}
                            </Link>
                            <div className="text-[11px] text-white/70">
                              {mcp.status} · {mcp.authType} · {mcp.owner}
                            </div>
                          </div>
                          <div className="text-[12px]">
                            {mcp.toolCount} tools · {mcp.classification}
                          </div>
                        </div>
                        <div className="divide-y divide-border bg-white">
                          {mcp.tools.map((tool) => (
                            <div key={tool.id} className="grid grid-cols-[160px_1fr] gap-3 px-4 py-2.5 text-[13px]">
                              <code className="font-medium text-navy">{tool.name}</code>
                              <span className="text-muted">{tool.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "data" && (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[12px] border border-border p-4">
                      <h3 className="mb-3 text-sm font-semibold text-navy">Inputs</h3>
                      <ul className="space-y-2">
                        {agent.dataAssets
                          .filter((d) => d.direction === "INPUT")
                          .map((d) => (
                            <li key={d.id} className="rounded-lg bg-[#FAFBFC] px-3 py-2">
                              <div className="text-sm font-medium text-navy">{d.name}</div>
                              <div className="text-[12px] text-muted">{d.description}</div>
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div className="rounded-[12px] border border-border p-4">
                      <h3 className="mb-3 text-sm font-semibold text-navy">Outputs</h3>
                      <ul className="space-y-2">
                        {agent.dataAssets
                          .filter((d) => d.direction === "OUTPUT")
                          .map((d) => (
                            <li key={d.id} className="rounded-lg bg-[#FAFBFC] px-3 py-2">
                              <div className="text-sm font-medium text-navy">{d.name}</div>
                              <div className="text-[12px] text-muted">{d.description}</div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-navy">Knowledge sources</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {agent.knowledgeSources.map((k) => (
                        <div key={k.id} className="rounded-lg border border-border px-3 py-2">
                          <div className="text-sm font-medium text-navy">{k.name}</div>
                          <div className="text-[12px] text-muted">{k.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "governance" && (
                <div className="space-y-5">
                  <div className="rounded-[12px] border border-border p-4">
                    <h3 className="mb-3 text-sm font-semibold text-navy">Governance checklist</h3>
                    <ul className="space-y-2 text-sm">
                      {[
                        { ok: !!agent.businessOwner, label: "Business owner assigned" },
                        {
                          ok: agent.riskAssessmentStatus === "ASSESSED",
                          label: "Risk assessment completed",
                        },
                        {
                          ok: agent.responsibleAiStatus === "ASSESSED",
                          label: "Responsible AI assessment completed",
                        },
                        { ok: agent.cyberReviewStatus === "Approved", label: "Cyber review approved" },
                        { ok: !!agent.humanOversight, label: "Human oversight defined" },
                        { ok: !!agent.dataClassification, label: "Data classification documented" },
                      ].map((item) => (
                        <li key={item.label} className="flex items-center gap-2">
                          {item.ok ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          )}
                          {item.label}
                        </li>
                      ))}
                      <li className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="h-4 w-4" />
                        Next review due in {days ?? "—"} days
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-navy">Guardrails & Rules</h3>
                    <div className="space-y-2">
                      {agent.rules.map((rule) => (
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
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "dependencies" && (
                <DependencyGraph
                  nodes={[
                    { id: "sys", label: "SAP S/4HANA", tone: "system" },
                    {
                      id: "mcp",
                      label: agent.mcpServers[0]?.name || "Enterprise MCP",
                      href: agent.mcpServers[0] ? `/mcp-servers/${agent.mcpServers[0].slug}` : undefined,
                      tone: "mcp",
                    },
                    { id: "agent", label: agent.name, tone: "agent" },
                    {
                      id: "skill",
                      label: agent.skills[0]?.name || "Skill",
                      href: agent.skills[0] ? `/skills/${agent.skills[0].slug}` : undefined,
                      tone: "skill",
                    },
                    {
                      id: "rule",
                      label: agent.rules[0]?.name || "Rule",
                      href: agent.rules[0] ? `/rules/${agent.rules[0].slug}` : undefined,
                      tone: "rule",
                    },
                  ]}
                  edges={[
                    { from: "sys", to: "mcp" },
                    { from: "mcp", to: "agent" },
                    { from: "agent", to: "skill" },
                    { from: "agent", to: "rule" },
                  ]}
                  agentDependencies={agent.dependencies}
                />
              )}

              {tab === "activity" && <ActivityTimeline items={agent.activities} />}

              {tab === "qa" && (
                <div className="space-y-3">
                  {agent.faqItems.map((faq) => (
                    <div key={faq.id} className="rounded-[10px] border border-border p-4">
                      <h4 className="text-sm font-semibold text-navy">{faq.question}</h4>
                      <p className="mt-1 text-[13px] text-[#4A5568]">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-navy">Governance</h3>
            <dl className="space-y-2.5 text-[13px]">
              <GovRow label="Risk classification" value={<RiskBadge level={agent.riskLevel} />} />
              <GovRow
                label="Risk assessment"
                value={<StatusBadge tone={agent.riskAssessmentStatus === "ASSESSED" ? "green" : "amber"} dot>{assessmentLabels[agent.riskAssessmentStatus]}</StatusBadge>}
              />
              <GovRow label="Data classification" value={agent.dataClassification} />
              <GovRow label="Personal data" value={agent.personalData ? "Yes" : "No"} />
              <GovRow label="GxP relevant" value={agent.gxpRelevant ? "Yes" : "No"} />
              <GovRow
                label="Responsible AI"
                value={<StatusBadge tone={agent.responsibleAiStatus === "ASSESSED" ? "green" : "amber"} dot>{assessmentLabels[agent.responsibleAiStatus]}</StatusBadge>}
              />
              <GovRow
                label="Cyber review"
                value={
                  <StatusBadge tone={agent.cyberReviewStatus === "Approved" ? "green" : "amber"} dot>
                    {agent.cyberReviewStatus}
                  </StatusBadge>
                }
              />
              <GovRow label="Human oversight" value={agent.humanOversight} />
              <GovRow label="Certification" value={<CertificationBadge certified={agent.certified} />} />
              <GovRow
                label="Next review"
                value={agent.nextReviewAt ? new Date(agent.nextReviewAt).toLocaleDateString() : "—"}
              />
            </dl>
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
              {agent.mcpServers.slice(0, 2).map((m) => (
                <RelatedLink key={m.id} href={`/mcp-servers/${m.slug}`} label={m.name} kind="MCP Server" />
              ))}
              {agent.skills.slice(0, 2).map((s) => (
                <RelatedLink key={s.id} href={`/skills/${s.slug}`} label={s.name} kind="Skill" />
              ))}
              {agent.rules.slice(0, 2).map((r) => (
                <RelatedLink key={r.id} href={`/rules/${r.slug}`} label={r.name} kind="Rule" />
              ))}
              {agent.guides.slice(0, 1).map((g) => (
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
  return (
    <li>
      <Link href={href} className="group flex items-start justify-between gap-2 rounded-lg border border-border px-3 py-2 hover:border-primary/40">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted">{kind}</div>
          <div className="text-sm font-medium text-navy group-hover:text-primary">{label}</div>
        </div>
        <ExternalLink className="mt-1 h-3.5 w-3.5 text-muted" />
      </Link>
    </li>
  );
}
