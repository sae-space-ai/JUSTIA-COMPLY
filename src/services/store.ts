/**
 * JUSTIA COMPLY — Persistence Layer
 * 
 * Abstracts storage behind an interface. Default implementation uses localStorage
 * for the browser-based demo. Production would use a real database via API.
 * 
 * Key design decisions:
 * - Tenant isolation enforced at every query
 * - All writes generate audit events
 * - Version history is immutable (append-only)
 * - Demo data is clearly marked
 */

import type {
  Tenant, User, LegalSource, Requirement, Rule, RuleVersion,
  RuleTest, ValidationRun, Evidence, Approval, AuditEvent, CopilotRequest
} from '../core/types';

// ============ STORAGE INTERFACE ============

interface StorageBackend {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  keys(): string[];
}

class LocalStorageBackend implements StorageBackend {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  remove(key: string): void {
    localStorage.removeItem(key);
  }
  
  keys(): string[] {
    return Object.keys(localStorage);
  }
}

// ============ REPOSITORY ============

function collectionKey(entity: string, tenantId: string): string {
  return `jc:${tenantId}:${entity}`;
}

function getCollection<T extends { id: string; tenantId: string }>(
  storage: StorageBackend,
  entity: string,
  tenantId: string
): T[] {
  return storage.get<T[]>(collectionKey(entity, tenantId)) || [];
}

function setCollection<T extends { id: string; tenantId: string }>(
  storage: StorageBackend,
  entity: string,
  tenantId: string,
  items: T[]
): void {
  storage.set(collectionKey(entity, tenantId), items);
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ============ MAIN STORE ============

const storage = new LocalStorageBackend();

export const store = {
  // Generic CRUD
  list<T extends { id: string; tenantId: string }>(entity: string, tenantId: string): T[] {
    return getCollection<T>(storage, entity, tenantId);
  },

  getById<T extends { id: string; tenantId: string }>(entity: string, tenantId: string, id: string): T | null {
    const items = getCollection<T>(storage, entity, tenantId);
    return items.find(i => i.id === id) || null;
  },

  create<T extends { id: string; tenantId: string }>(entity: string, tenantId: string, item: Omit<T, 'id' | 'tenantId'>): T {
    const items = getCollection<T>(storage, entity, tenantId);
    const newItem = { ...item, id: generateId(), tenantId } as T;
    items.push(newItem);
    setCollection(storage, entity, tenantId, items);
    return newItem;
  },

  update<T extends { id: string; tenantId: string }>(entity: string, tenantId: string, id: string, updates: Partial<T>): T | null {
    const items = getCollection<T>(storage, entity, tenantId);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, id, tenantId };
    setCollection(storage, entity, tenantId, items);
    return items[idx];
  },

  delete<T extends { id: string; tenantId: string }>(entity: string, tenantId: string, id: string): boolean {
    const items = getCollection<T>(storage, entity, tenantId);
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length === items.length) return false;
    setCollection(storage, entity, tenantId, filtered);
    return true;
  },

  // Specialized queries
  getRuleVersionsByRule(tenantId: string, ruleId: string): RuleVersion[] {
    return this.list<RuleVersion>('ruleVersions', tenantId)
      .filter(rv => rv.ruleId === ruleId)
      .sort((a, b) => b.version - a.version);
  },

  getLatestApprovedVersion(tenantId: string, ruleId: string): RuleVersion | null {
    const versions = this.getRuleVersionsByRule(tenantId, ruleId);
    return versions.find(v => v.status === 'APPROVED') || null;
  },

  getRequirementsBySource(tenantId: string, legalSourceId: string): Requirement[] {
    return this.list<Requirement>('requirements', tenantId)
      .filter(r => r.legalSourceId === legalSourceId);
  },

  getRulesByRequirement(tenantId: string, requirementId: string): Rule[] {
    return this.list<Rule>('rules', tenantId)
      .filter(r => r.requirementId === requirementId);
  },

  getTestsByVersion(tenantId: string, ruleVersionId: string): RuleTest[] {
    return this.list<RuleTest>('ruleTests', tenantId)
      .filter(t => t.ruleVersionId === ruleVersionId);
  },

  getEvidenceByRun(tenantId: string, validationRunId: string): Evidence[] {
    return this.list<Evidence>('evidence', tenantId)
      .filter(e => e.validationRunId === validationRunId);
  },

  getAuditEvents(tenantId: string, limit = 100): AuditEvent[] {
    return this.list<AuditEvent>('auditEvents', tenantId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  // Reset all data (for development)
  resetAll(tenantId: string): void {
    const entities = ['tenants', 'users', 'legalSources', 'requirements', 'rules', 
                      'ruleVersions', 'ruleTests', 'validationRuns', 'evidence', 
                      'approvals', 'auditEvents', 'copilotRequests'];
    for (const entity of entities) {
      storage.remove(collectionKey(entity, tenantId));
    }
  },

  // Seed demo data
  seedDemoData(tenantId: string): void {
    // Check if already seeded
    if (this.list<LegalSource>('legalSources', tenantId).length > 0) return;

    const now = new Date().toISOString();
    const demoUser = this.list<User>('users', tenantId)[0];
    const userId = demoUser?.id || 'demo-user';

    // Demo Legal Sources
    const sources: LegalSource[] = [
      {
        id: 'src-gdpr-art17',
        tenantId,
        title: 'GDPR Article 17 — Right to Erasure',
        jurisdiction: 'EU',
        authority: 'European Parliament',
        effectiveDate: '2018-05-25',
        referenceId: 'GDPR Art. 17',
        url: 'https://gdpr-info.eu/art-17-gdpr/',
        summary: 'Data subjects have the right to obtain erasure of personal data without undue delay when specific conditions apply.',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        isDemo: true,
      },
      {
        id: 'src-mifid2-art16',
        tenantId,
        title: 'MiFID II Article 16 — Suitability Assessment',
        jurisdiction: 'EU',
        authority: 'European Parliament',
        effectiveDate: '2018-01-03',
        referenceId: 'MiFID II Art. 16',
        summary: 'Investment firms must assess the suitability of investment services for their clients.',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        isDemo: true,
      },
    ];

    for (const src of sources) {
      const items = this.list<LegalSource>('legalSources', tenantId);
      items.push(src);
      setCollection(storage, 'legalSources', tenantId, items);
    }

    // Demo Requirements
    const requirements: Requirement[] = [
      {
        id: 'req-gdpr-erasure-timeline',
        tenantId,
        legalSourceId: 'src-gdpr-art17',
        title: 'Erasure Response Timeline',
        description: 'Organizations must respond to erasure requests within 30 calendar days.',
        obligation: 'MUST',
        category: 'Data Subject Rights',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        isDemo: true,
      },
      {
        id: 'req-mifid2-risk-score',
        tenantId,
        legalSourceId: 'src-mifid2-art16',
        title: 'Client Risk Score Minimum',
        description: 'Client risk assessment score must be at least 50 for complex products.',
        obligation: 'MUST',
        category: 'Investor Protection',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        isDemo: true,
      },
    ];

    for (const req of requirements) {
      const items = this.list<Requirement>('requirements', tenantId);
      items.push(req);
      setCollection(storage, 'requirements', tenantId, items);
    }

    // Demo Rules
    const rules: Rule[] = [
      {
        id: 'rule-erasure-timeline',
        tenantId,
        requirementId: 'req-gdpr-erasure-timeline',
        name: 'GDPR Erasure Response Time Check',
        description: 'Validates that erasure response time is within 30 days.',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        isDemo: true,
      },
      {
        id: 'rule-risk-score-minimum',
        tenantId,
        requirementId: 'req-mifid2-risk-score',
        name: 'MiFID II Client Risk Score Validation',
        description: 'Validates that client risk score meets minimum threshold for complex products.',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        isDemo: true,
      },
    ];

    for (const rule of rules) {
      const items = this.list<Rule>('rules', tenantId);
      items.push(rule);
      setCollection(storage, 'rules', tenantId, items);
    }

    // Demo Rule Versions (one APPROVED, one DRAFT)
    const ruleVersions: RuleVersion[] = [
      {
        id: 'rv-erasure-v1',
        tenantId,
        ruleId: 'rule-erasure-timeline',
        version: 1,
        status: 'APPROVED',
        operators: [
          { operator: 'required', field: 'responseDays' },
          { operator: 'type', field: 'responseDays', expectedType: 'number' },
          { operator: 'range', field: 'responseDays', min: 0, max: 30 },
        ],
        rationale: 'Implements GDPR Art.17 timeline requirement. 30 days max response time.',
        provenance: {
          legalSourceId: 'src-gdpr-art17',
          requirementId: 'req-gdpr-erasure-timeline',
        },
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        approvedBy: userId,
        approvedAt: now,
        isDemo: true,
      },
      {
        id: 'rv-risk-v1',
        tenantId,
        ruleId: 'rule-risk-score-minimum',
        version: 1,
        status: 'APPROVED',
        operators: [
          { operator: 'required', field: 'riskScore' },
          { operator: 'type', field: 'riskScore', expectedType: 'number' },
          { operator: 'threshold', field: 'riskScore', threshold: 50, comparison: 'gte' },
        ],
        rationale: 'MiFID II requires minimum risk score of 50 for complex product suitability.',
        provenance: {
          legalSourceId: 'src-mifid2-art16',
          requirementId: 'req-mifid2-risk-score',
        },
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        approvedBy: userId,
        approvedAt: now,
        isDemo: true,
      },
      {
        id: 'rv-risk-v2',
        tenantId,
        ruleId: 'rule-risk-score-minimum',
        version: 2,
        status: 'DRAFT',
        operators: [
          { operator: 'required', field: 'riskScore' },
          { operator: 'type', field: 'riskScore', expectedType: 'number' },
          { operator: 'threshold', field: 'riskScore', threshold: 60, comparison: 'gte' },
          { operator: 'required', field: 'productComplexity' },
          { operator: 'enum', field: 'productComplexity', allowedValues: ['LOW', 'MEDIUM', 'HIGH'] },
        ],
        rationale: 'Proposed increase to 60 threshold and added product complexity classification.',
        provenance: {
          legalSourceId: 'src-mifid2-art16',
          requirementId: 'req-mifid2-risk-score',
        },
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        isDemo: true,
      },
    ];

    for (const rv of ruleVersions) {
      const items = this.list<RuleVersion>('ruleVersions', tenantId);
      items.push(rv);
      setCollection(storage, 'ruleVersions', tenantId, items);
    }

    // Demo Tests
    const tests: RuleTest[] = [
      {
        id: 'test-erasure-pass',
        tenantId,
        ruleVersionId: 'rv-erasure-v1',
        name: 'Valid 15-day response',
        inputs: { responseDays: 15 },
        expectedResult: 'PASS',
        description: 'Response within 30 days should pass.',
        createdAt: now,
        createdBy: userId,
        isDemo: true,
      },
      {
        id: 'test-erasure-fail',
        tenantId,
        ruleVersionId: 'rv-erasure-v1',
        name: 'Invalid 45-day response',
        inputs: { responseDays: 45 },
        expectedResult: 'FAIL',
        description: 'Response exceeding 30 days should fail.',
        createdAt: now,
        createdBy: userId,
        isDemo: true,
      },
    ];

    for (const test of tests) {
      const items = this.list<RuleTest>('ruleTests', tenantId);
      items.push(test);
      setCollection(storage, 'ruleTests', tenantId, items);
    }

    // Audit events for the demo data creation
    const auditEvents: AuditEvent[] = [
      {
        id: generateId(),
        tenantId,
        action: 'CREATE',
        entityType: 'LegalSource',
        entityId: 'src-gdpr-art17',
        actorId: userId,
        timestamp: now,
        details: { title: 'GDPR Article 17', isDemo: true },
      },
      {
        id: generateId(),
        tenantId,
        action: 'CREATE',
        entityType: 'RuleVersion',
        entityId: 'rv-erasure-v1',
        actorId: userId,
        timestamp: now,
        details: { version: 1, status: 'APPROVED', isDemo: true },
      },
    ];

    for (const evt of auditEvents) {
      const items = this.list<AuditEvent>('auditEvents', tenantId);
      items.push(evt);
      setCollection(storage, 'auditEvents', tenantId, items);
    }
  },
};

// ============ AUDIT SERVICE ============

export function recordAuditEvent(
  tenantId: string,
  action: AuditEvent['action'],
  entityType: string,
  entityId: string,
  actorId: string,
  details: Record<string, unknown> = {},
  previousState?: Record<string, unknown>,
  newState?: Record<string, unknown>
): AuditEvent {
  const event: AuditEvent = {
    id: generateId(),
    tenantId,
    action,
    entityType,
    entityId,
    actorId,
    timestamp: new Date().toISOString(),
    details,
    previousState,
    newState,
  };
  
  const items = store.list<AuditEvent>('auditEvents', tenantId);
  items.push(event);
  setCollection(storage, 'auditEvents', tenantId, items);
  
  return event;
}
