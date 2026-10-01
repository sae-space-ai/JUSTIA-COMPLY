// JUSTIA COMPLY — Core Type System
// All domain models for the compliance vertical slice.

// ============ ENUMS ============

export type RuleVersionStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'RETIRED';

export type ValidationResult = 'PASS' | 'FAIL' | 'REVIEW';

export type AuditAction = 'CREATE' | 'EDIT' | 'TEST' | 'APPROVE' | 'EXECUTE' | 'ROLLBACK' | 'REJECT' | 'RETIRE';

export type UserRole = 'ADMIN' | 'LEGAL_EXPERT' | 'COMPLIANCE_OFFICER' | 'AUDITOR';

export type AIOutputClassification = 'GENERATED' | 'DRAFT';

export type RuleOperator = 
  | 'required' 
  | 'type' 
  | 'range' 
  | 'threshold' 
  | 'equality' 
  | 'enum' 
  | 'formula';

// ============ ENTITIES ============

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  active: boolean;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface LegalSource {
  id: string;
  tenantId: string;
  title: string;
  jurisdiction: string;
  authority: string;
  effectiveDate: string;
  referenceId: string; // e.g., "GDPR Art. 17"
  url?: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // userId
  // DEMO marker
  isDemo: boolean;
}

export interface Requirement {
  id: string;
  tenantId: string;
  legalSourceId: string;
  title: string;
  description: string;
  obligation: 'MUST' | 'SHOULD' | 'MAY';
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDemo: boolean;
}

export interface Rule {
  id: string;
  tenantId: string;
  requirementId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDemo: boolean;
}

export interface RuleOperatorConfig {
  operator: RuleOperator;
  field: string;
  // Operator-specific params
  expectedType?: string;           // for 'type'
  min?: number;                    // for 'range', 'threshold'
  max?: number;                    // for 'range'
  threshold?: number;              // for 'threshold'
  comparison?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'; // for 'equality', 'threshold'
  value?: string | number | boolean; // for 'equality'
  allowedValues?: string[];        // for 'enum'
  formula?: string;                // for 'formula' — restricted DSL, NOT eval()
}

export interface RuleVersion {
  id: string;
  tenantId: string;
  ruleId: string;
  version: number;
  status: RuleVersionStatus;
  operators: RuleOperatorConfig[];
  rationale: string;
  provenance: {
    legalSourceId: string;
    requirementId: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  retiredAt?: string;
  retiredBy?: string;
  // AI provenance if applicable
  aiGenerated?: boolean;
  aiProvider?: string;
  aiSessionId?: string;
  isDemo: boolean;
}

export interface RuleTest {
  id: string;
  tenantId: string;
  ruleVersionId: string;
  name: string;
  inputs: Record<string, unknown>;
  expectedResult: ValidationResult;
  description: string;
  createdAt: string;
  createdBy: string;
  isDemo: boolean;
}

export interface ValidationRun {
  id: string;
  tenantId: string;
  ruleVersionId: string;
  inputs: Record<string, unknown>;
  result: ValidationResult;
  calculation: string; // human-readable explanation
  evidenceRefs: string[];
  timestamp: string;
  executedBy: string;
  isDemo: boolean;
}

export interface Evidence {
  id: string;
  tenantId: string;
  validationRunId?: string;
  ruleVersionId?: string;
  type: 'INPUT' | 'CALCULATION' | 'OUTPUT' | 'DOCUMENT' | 'SCREENSHOT';
  content: string;
  metadata: Record<string, string>;
  createdAt: string;
  createdBy: string;
  isDemo: boolean;
}

export interface Approval {
  id: string;
  tenantId: string;
  ruleVersionId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  reviewerId: string;
  comment: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  tenantId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  actorId: string;
  timestamp: string;
  details: Record<string, unknown>;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
}

// ============ AI COPILOT ============

export interface CopilotRequest {
  id: string;
  tenantId: string;
  type: 'EXTRACT_REQUIREMENTS' | 'DRAFT_RULE' | 'MAPPING' | 'EXPLANATION';
  input: Record<string, unknown>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'UNAVAILABLE';
  output?: string;
  classification: AIOutputClassification;
  provider?: string;
  model?: string;
  sessionId: string;
  createdBy: string;
  createdAt: string;
  errorMessage?: string;
}

// ============ API RESPONSES ============

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
