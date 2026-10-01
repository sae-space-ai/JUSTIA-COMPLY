/**
 * JUSTIA COMPLY — Version Management & Rollback Tests
 * 
 * Tests specific to:
 * - Version creation and numbering
 * - Status transitions (DRAFT → REVIEW → APPROVED → RETIRED)
 * - Rollback scenarios
 * - Immutability of approved versions
 * - Provenance tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { store, recordAuditEvent } from '../services/store';
import type { Rule, RuleVersion, LegalSource, Requirement } from '../core/types';

const TENANT = 'test-version-tenant';

describe('Version Management & Rollback', () => {
  let ruleId: string;
  let legalSourceId: string;
  let requirementId: string;

  beforeEach(() => {
    store.resetAll(TENANT);
    
    // Setup prerequisites
    const source = store.create<LegalSource>('legalSources', TENANT, {
      title: 'Test Source', jurisdiction: 'TEST', authority: 'Test Auth',
      effectiveDate: '2024-01-01', referenceId: 'TEST-001', summary: 'Test',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: 'user-1', isDemo: true,
    });
    legalSourceId = source.id;

    const req = store.create<Requirement>('requirements', TENANT, {
      legalSourceId, title: 'Test Req', description: 'Test', obligation: 'MUST',
      category: 'Test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: 'user-1', isDemo: true,
    });
    requirementId = req.id;

    const rule = store.create<Rule>('rules', TENANT, {
      requirementId, name: 'Test Rule', description: 'Test',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: 'user-1', isDemo: true,
    });
    ruleId = rule.id;
  });

  describe('Version Creation', () => {
    it('creates first version with number 1', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'DRAFT', operators: [],
        rationale: 'Initial version', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });
      expect(v1.version).toBe(1);
      expect(v1.ruleId).toBe(ruleId);
    });

    it('increments version numbers correctly', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'DRAFT', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      const v2 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 2, status: 'DRAFT', operators: [],
        rationale: 'v2', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      const v3 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 3, status: 'DRAFT', operators: [],
        rationale: 'v3', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      const versions = store.getRuleVersionsByRule(TENANT, ruleId);
      expect(versions.length).toBe(3);
      expect(versions[0].version).toBe(3); // Sorted desc
      expect(versions[1].version).toBe(2);
      expect(versions[2].version).toBe(1);
    });

    it('maintains provenance across versions', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'DRAFT', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      const v2 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 2, status: 'DRAFT', operators: [],
        rationale: 'v2', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      expect(v1.provenance.legalSourceId).toBe(legalSourceId);
      expect(v1.provenance.requirementId).toBe(requirementId);
      expect(v2.provenance.legalSourceId).toBe(legalSourceId);
      expect(v2.provenance.requirementId).toBe(requirementId);
    });
  });

  describe('Status Transitions', () => {
    it('transitions DRAFT → REVIEW', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'DRAFT', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      store.update<RuleVersion>('ruleVersions', TENANT, v1.id, { status: 'REVIEW' });
      const updated = store.getById<RuleVersion>('ruleVersions', TENANT, v1.id);
      expect(updated?.status).toBe('REVIEW');
    });

    it('transitions REVIEW → APPROVED with approval metadata', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'REVIEW', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      const approvedAt = new Date().toISOString();
      store.update<RuleVersion>('ruleVersions', TENANT, v1.id, {
        status: 'APPROVED',
        approvedBy: 'user-2',
        approvedAt,
      });

      const updated = store.getById<RuleVersion>('ruleVersions', TENANT, v1.id);
      expect(updated?.status).toBe('APPROVED');
      expect(updated?.approvedBy).toBe('user-2');
      expect(updated?.approvedAt).toBe(approvedAt);
    });

    it('transitions APPROVED → RETIRED with retirement metadata', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'APPROVED', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      const retiredAt = new Date().toISOString();
      store.update<RuleVersion>('ruleVersions', TENANT, v1.id, {
        status: 'RETIRED',
        retiredAt,
        retiredBy: 'user-3',
      });

      const updated = store.getById<RuleVersion>('ruleVersions', TENANT, v1.id);
      expect(updated?.status).toBe('RETIRED');
      expect(updated?.retiredAt).toBe(retiredAt);
      expect(updated?.retiredBy).toBe('user-3');
    });
  });

  describe('Rollback Scenarios', () => {
    it('rollback by retiring current version keeps previous approved', () => {
      // Create v1 and approve
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'APPROVED', operators: [{ operator: 'required', field: 'x' }],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      // Create v2 and approve
      const v2 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 2, status: 'APPROVED', operators: [{ operator: 'required', field: 'y' }],
        rationale: 'v2', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      // Rollback: retire v2
      store.update<RuleVersion>('ruleVersions', TENANT, v2.id, {
        status: 'RETIRED',
        retiredAt: new Date().toISOString(),
        retiredBy: 'user-3',
      });

      // v1 should still be the active approved version
      const latestApproved = store.getLatestApprovedVersion(TENANT, ruleId);
      expect(latestApproved?.id).toBe(v1.id);
      expect(latestApproved?.version).toBe(1);
    });

    it('multiple rollbacks maintain version history', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'APPROVED', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      const v2 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 2, status: 'APPROVED', operators: [],
        rationale: 'v2', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      const v3 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 3, status: 'APPROVED', operators: [],
        rationale: 'v3', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      // Retire v3
      store.update<RuleVersion>('ruleVersions', TENANT, v3.id, { status: 'RETIRED' });
      let latest = store.getLatestApprovedVersion(TENANT, ruleId);
      expect(latest?.version).toBe(2);

      // Retire v2
      store.update<RuleVersion>('ruleVersions', TENANT, v2.id, { status: 'RETIRED' });
      latest = store.getLatestApprovedVersion(TENANT, ruleId);
      expect(latest?.version).toBe(1);

      // All versions still exist in history
      const allVersions = store.getRuleVersionsByRule(TENANT, ruleId);
      expect(allVersions.length).toBe(3);
    });
  });

  describe('Audit Trail for Version Operations', () => {
    it('records CREATE event for new version', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'DRAFT', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      recordAuditEvent(TENANT, 'CREATE', 'RuleVersion', v1.id, 'user-1', { version: 1 });

      const events = store.getAuditEvents(TENANT);
      const createEvent = events.find(e => e.action === 'CREATE' && e.entityId === v1.id);
      expect(createEvent).toBeDefined();
      expect(createEvent?.details.version).toBe(1);
    });

    it('records APPROVE event', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'REVIEW', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      store.update<RuleVersion>('ruleVersions', TENANT, v1.id, { status: 'APPROVED' });
      recordAuditEvent(TENANT, 'APPROVE', 'RuleVersion', v1.id, 'user-2', {});

      const events = store.getAuditEvents(TENANT);
      const approveEvent = events.find(e => e.action === 'APPROVE' && e.entityId === v1.id);
      expect(approveEvent).toBeDefined();
    });

    it('records RETIRE event for rollback', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'APPROVED', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      store.update<RuleVersion>('ruleVersions', TENANT, v1.id, { status: 'RETIRED' });
      recordAuditEvent(TENANT, 'RETIRE', 'RuleVersion', v1.id, 'user-3', { version: 1 });

      const events = store.getAuditEvents(TENANT);
      const retireEvent = events.find(e => e.action === 'RETIRE' && e.entityId === v1.id);
      expect(retireEvent).toBeDefined();
    });
  });

  describe('getLatestApprovedVersion', () => {
    it('returns null when no approved versions exist', () => {
      store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'DRAFT', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), isDemo: true,
      });

      const latest = store.getLatestApprovedVersion(TENANT, ruleId);
      expect(latest).toBeNull();
    });

    it('returns the most recent approved version', () => {
      store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'APPROVED', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      const v2 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 2, status: 'APPROVED', operators: [],
        rationale: 'v2', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      const latest = store.getLatestApprovedVersion(TENANT, ruleId);
      expect(latest?.id).toBe(v2.id);
      expect(latest?.version).toBe(2);
    });

    it('skips retired versions', () => {
      const v1 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 1, status: 'APPROVED', operators: [],
        rationale: 'v1', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      const v2 = store.create<RuleVersion>('ruleVersions', TENANT, {
        ruleId, version: 2, status: 'APPROVED', operators: [],
        rationale: 'v2', provenance: { legalSourceId, requirementId },
        createdBy: 'user-1', createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), approvedBy: 'user-2',
        approvedAt: new Date().toISOString(), isDemo: true,
      });

      // Retire v2
      store.update<RuleVersion>('ruleVersions', TENANT, v2.id, { status: 'RETIRED' });

      const latest = store.getLatestApprovedVersion(TENANT, ruleId);
      expect(latest?.id).toBe(v1.id);
      expect(latest?.version).toBe(1);
    });
  });
});
