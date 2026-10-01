/**
 * JUSTIA COMPLY — Auth & Permissions Tests
 */

import { describe, it, expect } from 'vitest';
import { hasPermission } from '../services/auth';

describe('RBAC Permissions', () => {
  describe('ADMIN role', () => {
    it('has all permissions', () => {
      expect(hasPermission('ADMIN', 'legal_source:write')).toBe(true);
      expect(hasPermission('ADMIN', 'rule_version:approve')).toBe(true);
      expect(hasPermission('ADMIN', 'user:write')).toBe(true);
      expect(hasPermission('ADMIN', 'tenant:write')).toBe(true);
      expect(hasPermission('ADMIN', 'audit:read')).toBe(true);
      expect(hasPermission('ADMIN', 'copilot:use')).toBe(true);
    });
  });

  describe('LEGAL_EXPERT role', () => {
    it('can read and write legal sources', () => {
      expect(hasPermission('LEGAL_EXPERT', 'legal_source:read')).toBe(true);
      expect(hasPermission('LEGAL_EXPERT', 'legal_source:write')).toBe(true);
    });

    it('can write rules but not approve them', () => {
      expect(hasPermission('LEGAL_EXPERT', 'rule:write')).toBe(true);
      expect(hasPermission('LEGAL_EXPERT', 'rule_version:write')).toBe(true);
      expect(hasPermission('LEGAL_EXPERT', 'rule_version:approve')).toBe(false);
    });

    it('cannot manage users or tenants', () => {
      expect(hasPermission('LEGAL_EXPERT', 'user:write')).toBe(false);
      expect(hasPermission('LEGAL_EXPERT', 'tenant:write')).toBe(false);
    });

    it('cannot execute validations', () => {
      expect(hasPermission('LEGAL_EXPERT', 'validation:execute')).toBe(false);
    });

    it('can use copilot', () => {
      expect(hasPermission('LEGAL_EXPERT', 'copilot:use')).toBe(true);
    });
  });

  describe('COMPLIANCE_OFFICER role', () => {
    it('can approve rules', () => {
      expect(hasPermission('COMPLIANCE_OFFICER', 'rule_version:approve')).toBe(true);
    });

    it('can execute validations', () => {
      expect(hasPermission('COMPLIANCE_OFFICER', 'validation:execute')).toBe(true);
    });

    it('can write evidence', () => {
      expect(hasPermission('COMPLIANCE_OFFICER', 'evidence:write')).toBe(true);
    });

    it('cannot manage users', () => {
      expect(hasPermission('COMPLIANCE_OFFICER', 'user:write')).toBe(false);
    });

    it('cannot write legal sources', () => {
      expect(hasPermission('COMPLIANCE_OFFICER', 'legal_source:write')).toBe(false);
    });
  });

  describe('AUDITOR role', () => {
    it('has read-only access to all entities', () => {
      expect(hasPermission('AUDITOR', 'legal_source:read')).toBe(true);
      expect(hasPermission('AUDITOR', 'requirement:read')).toBe(true);
      expect(hasPermission('AUDITOR', 'rule:read')).toBe(true);
      expect(hasPermission('AUDITOR', 'rule_version:read')).toBe(true);
      expect(hasPermission('AUDITOR', 'evidence:read')).toBe(true);
      expect(hasPermission('AUDITOR', 'audit:read')).toBe(true);
    });

    it('cannot write anything', () => {
      expect(hasPermission('AUDITOR', 'legal_source:write')).toBe(false);
      expect(hasPermission('AUDITOR', 'rule:write')).toBe(false);
      expect(hasPermission('AUDITOR', 'rule_version:approve')).toBe(false);
      expect(hasPermission('AUDITOR', 'validation:execute')).toBe(false);
      expect(hasPermission('AUDITOR', 'evidence:write')).toBe(false);
    });

    it('cannot use copilot', () => {
      expect(hasPermission('AUDITOR', 'copilot:use')).toBe(false);
    });
  });

  describe('Unknown role', () => {
    it('has no permissions', () => {
      expect(hasPermission('UNKNOWN' as any, 'legal_source:read')).toBe(false);
    });
  });
});
