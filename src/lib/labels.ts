import type {
  AccessLevel,
  AssessmentStatus,
  AssetType,
  BusinessArea,
  IngestionMode,
  LifecycleStage,
  RepositoryStatus,
  RequestStatus,
  ReviewStatus,
  RiskLevel,
  Severity,
} from "@prisma/client";

export const businessAreaLabels: Record<BusinessArea, string> = {
  HEALTHCARE: "Healthcare",
  LIFE_SCIENCE: "Life Science",
  ELECTRONICS: "Electronics",
  ENABLING_FUNCTIONS: "Enabling Functions",
  GLOBAL_CROSS_SECTOR: "Global / Cross-Sector",
};

export const riskLabels: Record<RiskLevel, string> = {
  LOW: "Low Risk",
  MEDIUM: "Medium Risk",
  HIGH: "High Risk",
  MISSION_CRITICAL: "Mission-critical",
  NOT_ASSESSED: "Not assessed",
};

export const riskShortLabels: Record<RiskLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  MISSION_CRITICAL: "Mission-critical",
  NOT_ASSESSED: "Not assessed",
};

export const lifecycleLabels: Record<LifecycleStage, string> = {
  IDEA: "Idea",
  PILOT: "Pilot",
  PRODUCTION: "Production",
  RETIRING: "Retiring",
  RETIRED: "Retired",
};

export const assessmentLabels: Record<AssessmentStatus, string> = {
  ASSESSED: "Assessed",
  PENDING: "Pending",
  EXPIRED: "Expired",
};

export const accessLabels: Record<AccessLevel, string> = {
  OPEN: "Open",
  APPROVAL_REQUIRED: "Approval required",
  RESTRICTED: "Restricted",
};

export const assetTypeLabels: Record<AssetType, string> = {
  AGENT: "AI Agent",
  AGENT_PRODUCT: "Agent Product",
  MCP_SERVER: "MCP Server",
  SKILL: "Skill",
  RULE: "Rule",
  GUIDE: "Guide",
  HOOK: "Hook",
  USE_CASE: "Use Case",
  DATA_ASSET: "Data Asset",
  DATA_PRODUCT: "Data Product",
  GLOSSARY_TERM: "Glossary Term",
  DATA_DOMAIN: "Data Domain",
};

export const requestStatusLabels: Record<RequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  OPEN: "Open",
  DUE_SOON: "Due soon",
  OVERDUE: "Overdue",
  COMPLETED: "Completed",
};

export const severityLabels: Record<Severity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const repositoryStatusLabels: Record<RepositoryStatus, string> = {
  IN_SCOPE: "In Scope",
  CONTEXT_FEED: "Context Feed",
  TARGET_STATE: "Target State",
  PARKED: "Parked",
};

export const ingestionModeLabels: Record<IngestionMode, string> = {
  AUTOMATED: "Automated",
  MANUAL: "Manual",
  UNKNOWN: "Unknown",
  PLANNED: "Planned",
};

export const platforms = [
  "UPTIMIZE Foundry",
  "UPTIMIZE Agents",
  "myGPT",
  "HIVE",
  "Microsoft Copilot Studio",
  "Salesforce",
  "SAP Joule",
  "UiPath",
] as const;

export const capabilityCategories = [
  "Knowledge & Search",
  "Automation",
  "Data & Analytics",
  "Research",
  "Customer Operations",
  "HR & Productivity",
] as const;

export const agentPatterns = [
  "Standalone",
  "Orchestrator",
  "Sub-Agent",
  "Embedded",
  "Team Shared",
  "Private",
  "Code-based",
] as const;

export const solutionTypes = ["Agent Asset", "Agent Product", "Both"] as const;

export const originTypes = ["Internal", "External / Third Party"] as const;

export const usagePolicies = ["Unlimited use", "Usage limits may apply"] as const;

export const visibilityOptions = ["Enterprise Visible", "Restricted Visibility"] as const;
