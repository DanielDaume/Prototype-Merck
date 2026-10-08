"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { MetadataCompleteness } from "@/components/governance/MetadataCompleteness";
import { useToast } from "@/components/providers/ToastProvider";
import { computeMetadataCompleteness } from "@/lib/metadata-requirements";
import {
  agentPatterns,
  originTypes,
  platforms,
  usagePolicies,
  visibilityOptions,
} from "@/lib/labels";

const STEPS = [
  { id: 1, label: "Business & Reuse" },
  { id: 2, label: "Governance" },
  { id: 3, label: "Technical" },
  { id: 4, label: "Review" },
] as const;

const SIMILAR_ASSETS = [
  {
    name: "Invoice Triage Agent",
    slug: "invoice-triage-agent",
    summary: "Classifies invoices and routes AP exceptions.",
  },
  {
    name: "Finance Operations Assistant",
    slug: "finance-operations-assistant",
    summary: "Composable finance product for invoice operations.",
  },
  {
    name: "Vendor Matching Agent",
    slug: "vendor-matching-agent",
    summary: "Matches invoice vendors to SAP master data.",
  },
];

type FormState = {
  name: string;
  description: string;
  useCase: string;
  businessArea: string;
  businessCapability: string;
  businessOwner: string;
  technicalOwner: string;
  targetPersonas: string;
  valueBenefit: string;
  riskLevel: string;
  riskAssessmentStatus: string;
  businessCriticality: string;
  dataClassification: string;
  personalData: string;
  gxpRelevant: string;
  responsibleAiStatus: string;
  cyberReviewStatus: string;
  humanOversight: string;
  regulatoryScope: string;
  accessLevel: string;
  visibility: string;
  usagePolicy: string;
  emergencyShutdownStrategy: string;
  platform: string;
  agentId: string;
  framework: string;
  model: string;
  autonomyLevel: string;
  invocationType: string;
  environments: string;
  declaredResourcesSummary: string;
  observedResourcesSummary: string;
  mcpNotes: string;
  dependenciesNotes: string;
  guardrailsNotes: string;
  agentPattern: string;
  originType: string;
  repositoryEligibility: string;
};

const initial: FormState = {
  name: "",
  description: "",
  useCase: "",
  businessArea: "ENABLING_FUNCTIONS",
  businessCapability: "",
  businessOwner: "",
  technicalOwner: "",
  targetPersonas: "",
  valueBenefit: "",
  riskLevel: "NOT_ASSESSED",
  riskAssessmentStatus: "PENDING",
  businessCriticality: "Medium",
  dataClassification: "Internal",
  personalData: "No",
  gxpRelevant: "No",
  responsibleAiStatus: "PENDING",
  cyberReviewStatus: "Pending",
  humanOversight: "Required",
  regulatoryScope: "",
  accessLevel: "APPROVAL_REQUIRED",
  visibility: "Enterprise Visible",
  usagePolicy: "Unlimited use",
  emergencyShutdownStrategy: "",
  platform: "UPTIMIZE Foundry",
  agentId: "",
  framework: "",
  model: "",
  autonomyLevel: "Advisory",
  invocationType: "Chat",
  environments: "Dev",
  declaredResourcesSummary: "",
  observedResourcesSummary: "",
  mcpNotes: "",
  dependenciesNotes: "",
  guardrailsNotes: "",
  agentPattern: "Standalone",
  originType: "Internal",
  repositoryEligibility: "Eligible",
};

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[12px] font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary";

export function RegistrationWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [busy, setBusy] = useState(false);
  const [continueAnyway, setContinueAnyway] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const showSimilar = useMemo(() => {
    const n = form.name.toLowerCase();
    return /invoice|assistant|finance/.test(n);
  }, [form.name]);

  const completeness = useMemo(
    () =>
      computeMetadataCompleteness({
        name: form.name,
        lifecycleStage: "IDEA",
        businessOwner: form.businessOwner,
        useCase: form.useCase,
        businessCriticality: form.businessCriticality,
        riskAssessmentStatus: form.riskAssessmentStatus,
        agentId: form.agentId,
        declaredResourcesSummary: form.declaredResourcesSummary,
        observedResourcesSummary: form.observedResourcesSummary || form.mcpNotes,
        autonomyLevel: form.autonomyLevel,
        environments: form.environments,
        registrationStatus: "Registered",
        approvalStatus: "Pending",
        dataClassification: form.dataClassification,
        cyberReviewStatus: form.cyberReviewStatus,
        responsibleAiStatus: form.responsibleAiStatus,
        humanOversight: form.humanOversight,
        emergencyShutdownStrategy: form.emergencyShutdownStrategy,
        businessCapability: form.businessCapability,
        valueBenefit: form.valueBenefit,
        framework: form.framework,
        model: form.model,
        targetPersonas: form.targetPersonas,
        solutionType: "Agent Asset",
        invocationType: form.invocationType,
        rulesCount: form.guardrailsNotes.trim() ? 1 : 0,
        dependenciesCount: form.dependenciesNotes.trim() ? 1 : 0,
      }),
    [form]
  );

  const validateStep = (s: number) => {
    if (s === 1) {
      if (!form.name.trim() || !form.description.trim() || !form.businessOwner.trim()) {
        toast("Please fill name, description and business owner", "warning");
        return false;
      }
      if (showSimilar && !continueAnyway) {
        toast("Review similar capabilities or choose Continue anyway", "warning");
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((v) => Math.min(4, v + 1));
  };

  const back = () => setStep((v) => Math.max(1, v - 1));

  const submit = async () => {
    if (!validateStep(1)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          personalData: form.personalData === "Yes",
          gxpRelevant: form.gxpRelevant === "Yes",
          observedResourcesSummary:
            form.observedResourcesSummary || form.mcpNotes || undefined,
          lifecycleStage: "IDEA",
          registrationStatus: "Registered",
          approvalStatus: "Pending",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      toast("Agent registered successfully", "success");
      router.push(`/agents/${data.slug}`);
      router.refresh();
    } catch {
      toast("Could not register agent", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to agents
      </Link>

      <div className="rounded-[12px] border border-border bg-white p-5 shadow-sm">
        <h1 className="text-[24px] font-semibold tracking-tight text-navy">Register agent</h1>
        <p className="mt-1 text-sm text-muted">
          Four-step workshop registration with reuse checks and metadata completeness.
        </p>

        <ol className="mt-5 flex flex-wrap gap-2">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium ${
                step === s.id
                  ? "bg-primary text-white"
                  : step > s.id
                    ? "bg-success-bg text-success"
                    : "bg-[#EEF2F6] text-muted"
              }`}
            >
              {s.id}. {s.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-[12px] border border-border bg-white p-5 shadow-sm">
        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Agent name" className="md:col-span-2">
              <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label="Use case" className="md:col-span-2">
              <input className={inputClass} value={form.useCase} onChange={(e) => set("useCase", e.target.value)} />
            </Field>
            <Field label="Business area">
              <select
                className={inputClass}
                value={form.businessArea}
                onChange={(e) => set("businessArea", e.target.value)}
              >
                <option value="HEALTHCARE">Healthcare</option>
                <option value="LIFE_SCIENCE">Life Science</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="ENABLING_FUNCTIONS">Enabling Functions</option>
                <option value="GLOBAL_CROSS_SECTOR">Global / Cross-Sector</option>
              </select>
            </Field>
            <Field label="Business capability">
              <input
                className={inputClass}
                value={form.businessCapability}
                onChange={(e) => set("businessCapability", e.target.value)}
              />
            </Field>
            <Field label="Business owner">
              <input
                className={inputClass}
                value={form.businessOwner}
                onChange={(e) => set("businessOwner", e.target.value)}
              />
            </Field>
            <Field label="Technical owner">
              <input
                className={inputClass}
                value={form.technicalOwner}
                onChange={(e) => set("technicalOwner", e.target.value)}
              />
            </Field>
            <Field label="Target personas">
              <input
                className={inputClass}
                value={form.targetPersonas}
                onChange={(e) => set("targetPersonas", e.target.value)}
              />
            </Field>
            <Field label="Value / benefit">
              <input
                className={inputClass}
                value={form.valueBenefit}
                onChange={(e) => set("valueBenefit", e.target.value)}
              />
            </Field>

            {showSimilar ? (
              <div className="md:col-span-2 rounded-[12px] border border-warning/40 bg-warning-bg p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  Similar capabilities already exist
                </div>
                <p className="mb-3 text-[13px] text-[#4A5568]">
                  Before registering a new agent, review reuse candidates in the repository.
                </p>
                <ul className="space-y-2">
                  {SIMILAR_ASSETS.map((a) => (
                    <li
                      key={a.slug}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
                    >
                      <div>
                        <div className="text-sm font-medium text-navy">{a.name}</div>
                        <div className="text-[12px] text-muted">{a.summary}</div>
                      </div>
                      <Link
                        href={`/agents/${a.slug}`}
                        className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-navy hover:bg-bg"
                      >
                        View existing
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setContinueAnyway(true)}
                  className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    continueAnyway
                      ? "bg-success-bg text-success"
                      : "border border-border bg-white text-navy hover:bg-bg"
                  }`}
                >
                  {continueAnyway ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Continuing anyway
                    </span>
                  ) : (
                    "Continue anyway"
                  )}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Risk level">
              <select className={inputClass} value={form.riskLevel} onChange={(e) => set("riskLevel", e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="NOT_ASSESSED">Not assessed</option>
              </select>
            </Field>
            <Field label="Risk assessment">
              <select
                className={inputClass}
                value={form.riskAssessmentStatus}
                onChange={(e) => set("riskAssessmentStatus", e.target.value)}
              >
                <option value="ASSESSED">Assessed</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </Field>
            <Field label="Business criticality">
              <select
                className={inputClass}
                value={form.businessCriticality}
                onChange={(e) => set("businessCriticality", e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </Field>
            <Field label="Data classification">
              <select
                className={inputClass}
                value={form.dataClassification}
                onChange={(e) => set("dataClassification", e.target.value)}
              >
                <option>Public</option>
                <option>Internal</option>
                <option>Confidential</option>
                <option>Restricted</option>
              </select>
            </Field>
            <Field label="Personal data">
              <select
                className={inputClass}
                value={form.personalData}
                onChange={(e) => set("personalData", e.target.value)}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>
            <Field label="GxP relevant">
              <select
                className={inputClass}
                value={form.gxpRelevant}
                onChange={(e) => set("gxpRelevant", e.target.value)}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>
            <Field label="Responsible AI">
              <select
                className={inputClass}
                value={form.responsibleAiStatus}
                onChange={(e) => set("responsibleAiStatus", e.target.value)}
              >
                <option value="ASSESSED">Assessed</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </Field>
            <Field label="Cyber review">
              <select
                className={inputClass}
                value={form.cyberReviewStatus}
                onChange={(e) => set("cyberReviewStatus", e.target.value)}
              >
                <option>Approved</option>
                <option>Pending</option>
                <option>In progress</option>
              </select>
            </Field>
            <Field label="Human oversight">
              <input
                className={inputClass}
                value={form.humanOversight}
                onChange={(e) => set("humanOversight", e.target.value)}
              />
            </Field>
            <Field label="Regulatory scope">
              <input
                className={inputClass}
                value={form.regulatoryScope}
                onChange={(e) => set("regulatoryScope", e.target.value)}
              />
            </Field>
            <Field label="Access level">
              <select
                className={inputClass}
                value={form.accessLevel}
                onChange={(e) => set("accessLevel", e.target.value)}
              >
                <option value="OPEN">Open</option>
                <option value="APPROVAL_REQUIRED">Approval required</option>
                <option value="RESTRICTED">Restricted</option>
              </select>
            </Field>
            <Field label="Visibility">
              <select
                className={inputClass}
                value={form.visibility}
                onChange={(e) => set("visibility", e.target.value)}
              >
                {visibilityOptions.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Usage policy">
              <select
                className={inputClass}
                value={form.usagePolicy}
                onChange={(e) => set("usagePolicy", e.target.value)}
              >
                {usagePolicies.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Emergency shutdown strategy" className="md:col-span-2">
              <textarea
                className={inputClass}
                rows={3}
                value={form.emergencyShutdownStrategy}
                onChange={(e) => set("emergencyShutdownStrategy", e.target.value)}
                placeholder="Describe kill-switch / shutdown procedure…"
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Platform">
              <select className={inputClass} value={form.platform} onChange={(e) => set("platform", e.target.value)}>
                {platforms.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Agent ID">
              <input
                className={inputClass}
                value={form.agentId}
                onChange={(e) => set("agentId", e.target.value)}
                placeholder="AGT-…"
              />
            </Field>
            <Field label="Framework">
              <input className={inputClass} value={form.framework} onChange={(e) => set("framework", e.target.value)} />
            </Field>
            <Field label="Model">
              <input className={inputClass} value={form.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field label="Autonomy level">
              <input
                className={inputClass}
                value={form.autonomyLevel}
                onChange={(e) => set("autonomyLevel", e.target.value)}
              />
            </Field>
            <Field label="Invocation type">
              <input
                className={inputClass}
                value={form.invocationType}
                onChange={(e) => set("invocationType", e.target.value)}
              />
            </Field>
            <Field label="Environments">
              <input
                className={inputClass}
                value={form.environments}
                onChange={(e) => set("environments", e.target.value)}
              />
            </Field>
            <Field label="Agent pattern">
              <select
                className={inputClass}
                value={form.agentPattern}
                onChange={(e) => set("agentPattern", e.target.value)}
              >
                {agentPatterns.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Origin">
              <select
                className={inputClass}
                value={form.originType}
                onChange={(e) => set("originType", e.target.value)}
              >
                {originTypes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Data resources (declared)" className="md:col-span-2">
              <textarea
                className={inputClass}
                rows={2}
                value={form.declaredResourcesSummary}
                onChange={(e) => set("declaredResourcesSummary", e.target.value)}
              />
            </Field>
            <Field label="Tools / MCP notes" className="md:col-span-2">
              <textarea
                className={inputClass}
                rows={2}
                value={form.mcpNotes}
                onChange={(e) => set("mcpNotes", e.target.value)}
              />
            </Field>
            <Field label="Dependencies" className="md:col-span-2">
              <textarea
                className={inputClass}
                rows={2}
                value={form.dependenciesNotes}
                onChange={(e) => set("dependenciesNotes", e.target.value)}
              />
            </Field>
            <Field label="Guardrails" className="md:col-span-2">
              <textarea
                className={inputClass}
                rows={2}
                value={form.guardrailsNotes}
                onChange={(e) => set("guardrailsNotes", e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-[12px] border border-border bg-[#FAFBFC] p-4">
              <h3 className="text-sm font-semibold text-navy">Repository eligibility</h3>
              <p className="mt-1 text-[13px] text-[#4A5568]">
                Status: <span className="font-medium text-navy">{form.repositoryEligibility}</span>
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Prototype registration creates an Idea-stage agent record for workshop demonstration.
              </p>
            </div>

            <MetadataCompleteness data={completeness} />

            {completeness.high.missing.length > 0 ? (
              <div className="rounded-lg border border-warning/30 bg-warning-bg px-3 py-2 text-[13px] text-[#4A5568]">
                <span className="font-semibold text-warning">Warning: </span>
                High-priority metadata is incomplete. You can still complete registration for the prototype.
              </div>
            ) : null}

            {showSimilar ? (
              <div className="rounded-[12px] border border-border p-4">
                <h3 className="mb-2 text-sm font-semibold text-navy">Similar assets reviewed</h3>
                <ul className="space-y-1 text-[13px] text-muted">
                  {SIMILAR_ASSETS.map((a) => (
                    <li key={a.slug}>• {a.name}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-[12px] border border-border p-4">
              <h3 className="mb-2 text-sm font-semibold text-navy">Summary</h3>
              <dl className="grid gap-2 text-[13px] sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Name</dt>
                  <dd className="font-medium text-navy">{form.name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Platform</dt>
                  <dd className="font-medium text-navy">{form.platform}</dd>
                </div>
                <div>
                  <dt className="text-muted">Owner</dt>
                  <dd className="font-medium text-navy">{form.businessOwner || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Risk</dt>
                  <dd className="font-medium text-navy">{form.riskLevel}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-navy hover:bg-bg disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              Complete registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
