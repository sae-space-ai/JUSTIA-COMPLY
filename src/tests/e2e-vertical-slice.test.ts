/**
 * JUSTIA COMPLY — E2E Vertical Slice Test
 * 
 * Tests the complete flow:
 * Legal Source → Requirement → Rule → RuleVersion → Test → Approval → Execution → Evidence → Audit
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { store, recordAuditEvent } from '../services/store';
import { evaluateRuleVersion } from '../core/rule-engine';
import type {
  LegalSource, Requirement, Rule, RuleVersion,
  RuleTest, ValidationRun, Evidence, AuditEvent
} from '../core/types';

const TENANT = 'test-e2e-tenant';

describe('E2E Vertical Slice', () => {
  beforeEach(() => {
    store.resetAll(TENANT);
  });

  it('completes full flow: source → requirement → rule → version → test → approve → execute → evidence → audit', () => {
    // 1. Create Legal Source
    const source = store.create<LegalSource>('legalSources', TENANT, {
      title: 'Test Regulation §42',
      jurisdiction: 'TEST',
      authority: 'Test Authority',
      effectiveDate: '2024-01-01',
      referenceId: 'TEST §42',
      summary: 'Test regulation for E2E validation.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
      isDemo: true,
    });
    expect(source.id).toBeDefined();
    expect(source.tenantId).toBe(TENANT);

    recordAuditEvent(TENANT, 'CREATE', 'LegalSource', source.id, 'user-1', { title: source.title });

    // 2. Create Requirement derived from source
    const requirement = store.create<Requirement>('requirements', TENANT, {
      legalSourceId: source.id,
      title: 'Maximum Processing Time',
      description: 'Processing must complete within 24 hours.',
      obligation: 'MUST',
      category: 'Performance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
      isDemo: true,
    });
    expect(requirement.legalSourceId).toBe(source.id);

    recordAuditEvent(TENANT, 'CREATE', 'Requirement', requirement.id, 'user-1', { title: requirement.title });

    // 3. Create Rule linked to requirement
    const rule = store.create<Rule>('rules', TENANT, {
      requirementId: requirement.id,
      name: 'Processing Time Check',
      description: 'Validates processing time ≤ 24 hours.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
      isDemo: true,
    });
    expect(rule.requirementId).toBe(requirement.id);

    // 4. Create RuleVersion (DRAFT)
    const draftVersion = store.create<RuleVersion>('ruleVersions', TENANT, {
      ruleId: rule.id,
      version: 1,
      status: 'DRAFT',
      operators: [
        { operator: 'required', field: 'processingHours' },
        { operator: 'type', field: 'processingHours', expectedType: 'number' },
        { operator: 'threshold', field: 'processingHours', threshold: 24, comparison: 'lte' },
      ],
      rationale: 'Implements TEST §42 processing time requirement.',
      provenance: {
        legalSourceId: source.id,
        requirementId: requirement.id,
      },
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
    });
    expect(draftVersion.status).toBe('DRAFT');
    expect(draftVersion.provenance.legalSourceId).toBe(source.id);

    // 5. Create RuleTest
    const test1 = store.create<RuleTest>('ruleTests', TENANT, {
      ruleVersionId: draftVersion.id,
      name: 'Valid 12-hour processing',
      inputs: { processingHours: 12 },
      expectedResult: 'PASS',
      description: '12 hours is within 24-hour limit.',
      createdAt: new Date().toISOString(),
      createdBy: 'user-1',
      isDemo: true,
    });

    const test2 = store.create<RuleTest>('ruleTests', TENANT, {
      ruleVersionId: draftVersion.id,
      name: 'Invalid 30-hour processing',
      inputs: { processingHours: 30 },
      expectedResult: 'FAIL',
      description: '30 hours exceeds 24-hour limit.',
      createdAt: new Date().toISOString(),
      createdBy: 'user-1',
      isDemo: true,
    });

    // 6. Run tests against DRAFT version (should get REVIEW since not approved)
    const draftResult = evaluateRuleVersion(draftVersion, test1.inputs);
    expect(draftResult.result).toBe('REVIEW'); // DRAFT cannot execute officially

    // 7. Move to REVIEW status
    store.update<RuleVersion>('ruleVersions', TENANT, draftVersion.id, { status: 'REVIEW' });
    recordAuditEvent(TENANT, 'EDIT', 'RuleVersion', draftVersion.id, 'user-1', { status: 'REVIEW' });

    // 8. Approve the rule version
    const approvedAt = new Date().toISOString();
    store.update<RuleVersion>('ruleVersions', TENANT, draftVersion.id, {
      status: 'APPROVED',
      approvedBy: 'user-2',
      approvedAt,
    });
    recordAuditEvent(TENANT, 'APPROVE', 'RuleVersion', draftVersion.id, 'user-2', { version: 1 });

    // Verify approved
    const approvedVersion = store.getById<RuleVersion>('ruleVersions', TENANT, draftVersion.id);
    expect(approvedVersion?.status).toBe('APPROVED');

    // 9. Execute validation with approved version
    const validation = evaluateRuleVersion(approvedVersion!, test1.inputs);
    expect(validation.result).toBe('PASS');
    expect(validation.ruleVersionId).toBe(draftVersion.id);

    // 10. Create ValidationRun record
    const validationRun = store.create<ValidationRun>('validationRuns', TENANT, {
      ruleVersionId: approvedVersion!.id,
      inputs: test1.inputs,
      result: validation.result,
      calculation: validation.calculation,
      evidenceRefs: [],
      timestamp: validation.timestamp,
      executedBy: 'user-2',
      isDemo: true,
    });
    recordAuditEvent(TENANT, 'EXECUTE', 'ValidationRun', validationRun.id, 'user-2', {
      result: validation.result,
      ruleVersionId: approvedVersion!.id,
    });

    // 11. Create Evidence
    const evidence = store.create<Evidence>('evidence', TENANT, {
      validationRunId: validationRun.id,
      ruleVersionId: approvedVersion!.id,
      type: 'OUTPUT',
      content: JSON.stringify(validation),
      metadata: { format: 'json', encoding: 'utf-8' },
      createdAt: new Date().toISOString(),
      createdBy: 'user-2',
      isDemo: true,
    });
    expect(evidence.validationRunId).toBe(validationRun.id);

    // Update validation run with evidence ref
    store.update<ValidationRun>('validationRuns', TENANT, validationRun.id, {
      evidenceRefs: [evidence.id],
    });

    // 12. Verify audit trail
    const auditEvents = store.getAuditEvents(TENANT);
    expect(auditEvents.length).toBeGreaterThanOrEqual(4); // CREATE source, CREATE req, EDIT version, APPROVE, EXECUTE
    
    const actions = auditEvents.map(e => e.action);
    expect(actions).toContain('CREATE');
    expect(actions).toContain('APPROVE');
    expect(actions).toContain('EXECUTE');

    // 13. Test versioning — create v2
    const v2 = store.create<RuleVersion>('ruleVersions', TENANT, {
      ruleId: rule.id,
      version: 2,
      status: 'DRAFT',
      operators: [
        { operator: 'required', field: 'processingHours' },
        { operator: 'threshold', field: 'processingHours', threshold: 12, comparison: 'lte' }, // Stricter
      ],
      rationale: 'Stricter threshold proposed by compliance team.',
      provenance: {
        legalSourceId: source.id,
        requirementId: requirement.id,
      },
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
    });
    expect(v2.version).toBe(2);

    // Verify version history
    const versions = store.getRuleVersionsByRule(TENANT, rule.id);
    expect(versions.length).toBe(2);
    expect(versions[0].version).toBe(2); // Sorted desc
    expect(versions[1].version).toBe(1);

    // 14. Test rollback — retire v2, keep v1 as approved
    store.update<RuleVersion>('ruleVersions', TENANT, v2.id, {
      status: 'RETIRED',
      retiredAt: new Date().toISOString(),
      retiredBy: 'user-2',
    });
    recordAuditEvent(TENANT, 'RETIRE', 'RuleVersion', v2.id, 'user-2', { version: 2 });

    // v1 should still be the active approved version
    const latestApproved = store.getLatestApprovedVersion(TENANT, rule.id);
    expect(latestApproved?.id).toBe(draftVersion.id);
    expect(latestApproved?.version).toBe(1);

    // 15. Test negative case — FAIL validation
    const failValidation = evaluateRuleVersion(approvedVersion!, test2.inputs);
    expect(failValidation.result).toBe('FAIL');

    // 16. Verify tenant isolation
    const otherTenantSources = store.list<LegalSource>('legalSources', 'other-tenant');
    expect(otherTenantSources.length).toBe(0);

    // 17. Verify provenance chain
    const reqs = store.getRequirementsBySource(TENANT, source.id);
    expect(reqs.length).toBe(1);
    expect(reqs[0].id).toBe(requirement.id);

    const rulesForReq = store.getRulesByRequirement(TENANT, requirement.id);
    expect(rulesForReq.length).toBe(1);
    expect(rulesForReq[0].id).toBe(rule.id);

    const evidenceForRun = store.getEvidenceByRun(TENANT, validationRun.id);
    expect(evidenceForRun.length).toBe(1);
    expect(evidenceForRun[0].id).toBe(evidence.id);
  });

  it('enforces tenant isolation', () => {
    store.create<LegalSource>('legalSources', 'tenant-a', {
      title: 'Source A', jurisdiction: 'A', authority: 'Auth A',
      effectiveDate: '2024-01-01', referenceId: 'A-1', summary: 'A',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: 'user-a', isDemo: true,
    });

    store.create<LegalSource>('legalSources', 'tenant-b', {
      title: 'Source B', jurisdiction: 'B', authority: 'Auth B',
      effectiveDate: '2024-01-01', referenceId: 'B-1', summary: 'B',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: 'user-b', isDemo: true,
    });

    expect(store.list<LegalSource>('legalSources', 'tenant-a').length).toBe(1);
    expect(store.list<LegalSource>('legalSources', 'tenant-b').length).toBe(1);
    expect(store.list<LegalSource>('legalSources', 'tenant-c').length).toBe(0);
  });
});
