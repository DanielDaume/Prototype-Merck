export type MetadataPriority = "HIGH" | "MEDIUM" | "LOW";

export type MetadataRequirement = {
  key: string;
  label: string;
  priority: MetadataPriority;
  section: string;
};

export const metadataRequirements: MetadataRequirement[] = [
  // HIGH — Business
  { key: "name", label: "Agent Name", priority: "HIGH", section: "Business" },
  { key: "lifecycleStage", label: "Lifecycle Stage", priority: "HIGH", section: "Business" },
  { key: "businessOwner", label: "Business Owner", priority: "HIGH", section: "Business" },
  { key: "useCase", label: "Use Case(s)", priority: "HIGH", section: "Business" },
  { key: "businessCriticality", label: "Business Criticality", priority: "HIGH", section: "Business" },
  { key: "riskAssessmentStatus", label: "Risk Assessment", priority: "HIGH", section: "Business" },
  // HIGH — Technical
  { key: "agentId", label: "Agent ID", priority: "HIGH", section: "Technical" },
  { key: "declaredResourcesSummary", label: "Resources – Data", priority: "HIGH", section: "Technical" },
  { key: "observedResourcesSummary", label: "Resources – Tools / APIs", priority: "HIGH", section: "Technical" },
  { key: "autonomyLevel", label: "Autonomy Level", priority: "HIGH", section: "Technical" },
  { key: "hasGuardrails", label: "Guardrails & Constraints", priority: "HIGH", section: "Technical" },
  { key: "environments", label: "Environments", priority: "HIGH", section: "Technical" },
  // HIGH — Process
  { key: "registrationStatus", label: "Registration Status", priority: "HIGH", section: "Process" },
  { key: "approvalStatus", label: "Approval / Sign-Off", priority: "HIGH", section: "Process" },
  // HIGH — Governance
  { key: "dataClassification", label: "Data Classification", priority: "HIGH", section: "Governance" },
  { key: "cyberReviewStatus", label: "Cyber Security & Compliance", priority: "HIGH", section: "Governance" },
  { key: "responsibleAiStatus", label: "Responsible AI / Ethics", priority: "HIGH", section: "Governance" },
  { key: "humanOversight", label: "Human Oversight", priority: "HIGH", section: "Governance" },
  { key: "emergencyShutdownStrategy", label: "Emergency Exit / Shutdown Strategy", priority: "HIGH", section: "Governance" },
  // MEDIUM — Business
  { key: "businessUnit", label: "Business Unit / Domain", priority: "MEDIUM", section: "Business" },
  { key: "businessCapability", label: "Business Capability", priority: "MEDIUM", section: "Business" },
  { key: "valueBenefit", label: "Value / Benefit", priority: "MEDIUM", section: "Business" },
  { key: "actualCost", label: "Cost (actual)", priority: "MEDIUM", section: "Business" },
  // MEDIUM — Technical
  { key: "version", label: "Version / Release", priority: "MEDIUM", section: "Technical" },
  { key: "framework", label: "Agent Type / Framework", priority: "MEDIUM", section: "Technical" },
  { key: "model", label: "Model / Platform", priority: "MEDIUM", section: "Technical" },
  { key: "hasDependencies", label: "Agent Dependencies", priority: "MEDIUM", section: "Technical" },
  { key: "observabilityNotes", label: "Observability / Performance", priority: "MEDIUM", section: "Technical" },
  // MEDIUM — Process
  { key: "reviewCadence", label: "Review Cadence / Next Review", priority: "MEDIUM", section: "Process" },
  { key: "notificationPolicy", label: "Notifications", priority: "MEDIUM", section: "Process" },
  { key: "escalationPolicy", label: "Consequences / Escalation", priority: "MEDIUM", section: "Process" },
  { key: "supportContact", label: "Support / Escalation Contact", priority: "MEDIUM", section: "Process" },
  // MEDIUM — Governance
  { key: "regulatoryScope", label: "Regulatory Scope", priority: "MEDIUM", section: "Governance" },
  { key: "auditLoggingPolicy", label: "Audit Trail / Logging", priority: "MEDIUM", section: "Governance" },
  { key: "createdAt", label: "Created / Last Updated", priority: "MEDIUM", section: "Personas / Meta" },
  { key: "solutionType", label: "Agent Solution Type", priority: "MEDIUM", section: "Technical / Governance" },
  // LOW
  { key: "invocationType", label: "Invocation Type", priority: "LOW", section: "Technical" },
  { key: "autoDiscoveryMode", label: "Auto Discovery & Trigger Curation", priority: "LOW", section: "Process" },
  { key: "targetPersonas", label: "Primary Users / Personas", priority: "LOW", section: "Personas / Meta" },
  { key: "tags", label: "Tags / Keywords", priority: "LOW", section: "Personas / Meta" },
  { key: "firstRegisteredBy", label: "First Registration Performed By", priority: "LOW", section: "Personas / Meta" },
  { key: "lastModifiedBy", label: "Modification Performed By", priority: "LOW", section: "Personas / Meta" },
  { key: "costCenter", label: "Agent Cost Center", priority: "LOW", section: "Business" },
];

export type CompletenessInput = {
  name?: string | null;
  lifecycleStage?: string | null;
  businessOwner?: string | null;
  useCase?: string | null;
  businessCriticality?: string | null;
  riskAssessmentStatus?: string | null;
  agentId?: string | null;
  declaredResourcesSummary?: string | null;
  observedResourcesSummary?: string | null;
  autonomyLevel?: string | null;
  environments?: string | null;
  registrationStatus?: string | null;
  approvalStatus?: string | null;
  dataClassification?: string | null;
  cyberReviewStatus?: string | null;
  responsibleAiStatus?: string | null;
  humanOversight?: string | null;
  emergencyShutdownStrategy?: string | null;
  businessUnit?: string | null;
  businessCapability?: string | null;
  valueBenefit?: string | null;
  actualCost?: string | null;
  monthlyCost?: string | null;
  version?: string | null;
  framework?: string | null;
  model?: string | null;
  observabilityNotes?: string | null;
  reviewCadence?: string | null;
  nextReviewAt?: string | Date | null;
  notificationPolicy?: string | null;
  escalationPolicy?: string | null;
  supportContact?: string | null;
  regulatoryScope?: string | null;
  auditLoggingPolicy?: string | null;
  createdAt?: string | Date | null;
  solutionType?: string | null;
  invocationType?: string | null;
  autoDiscoveryMode?: string | null;
  targetPersonas?: string | null;
  tags?: string | null;
  firstRegisteredBy?: string | null;
  lastModifiedBy?: string | null;
  costCenter?: string | null;
  rulesCount?: number;
  dependenciesCount?: number;
};

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0 && value !== "Pending";
  if (typeof value === "number") return true;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  return Boolean(value);
}

export function evaluateField(key: string, agent: CompletenessInput): boolean {
  switch (key) {
    case "hasGuardrails":
      return (agent.rulesCount ?? 0) > 0;
    case "hasDependencies":
      return (agent.dependenciesCount ?? 0) > 0 || isFilled(agent.observedResourcesSummary);
    case "actualCost":
      return isFilled(agent.actualCost) || isFilled(agent.monthlyCost);
    case "reviewCadence":
      return isFilled(agent.reviewCadence) || Boolean(agent.nextReviewAt);
    case "riskAssessmentStatus":
      return agent.riskAssessmentStatus === "ASSESSED";
    case "responsibleAiStatus":
      return agent.responsibleAiStatus === "ASSESSED";
    case "cyberReviewStatus":
      return agent.cyberReviewStatus === "Approved";
    default:
      return isFilled((agent as Record<string, unknown>)[key]);
  }
}

export function computeMetadataCompleteness(agent: CompletenessInput) {
  const groups = (["HIGH", "MEDIUM", "LOW"] as MetadataPriority[]).map((priority) => {
    const fields = metadataRequirements.filter((r) => r.priority === priority);
    const missing = fields.filter((f) => !evaluateField(f.key, agent));
    const complete = fields.length - missing.length;
    return {
      priority,
      complete,
      total: fields.length,
      missing: missing.map((m) => m.label),
      fields: fields.map((f) => ({
        ...f,
        complete: evaluateField(f.key, agent),
      })),
    };
  });

  return {
    groups,
    high: groups.find((g) => g.priority === "HIGH")!,
    medium: groups.find((g) => g.priority === "MEDIUM")!,
    low: groups.find((g) => g.priority === "LOW")!,
  };
}
