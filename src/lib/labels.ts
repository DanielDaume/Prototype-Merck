import type {
  AccessLevel,
  AssessmentStatus,
  AssetType,
  BusinessArea,
  LifecycleStage,
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
  NOT_ASSESSED: "Not assessed",
};

export const riskShortLabels: Record<RiskLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
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
  MCP_SERVER: "MCP Server",
  SKILL: "Skill",
  RULE: "Rule",
  GUIDE: "Guide",
  HOOK: "Hook",
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
