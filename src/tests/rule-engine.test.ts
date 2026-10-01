/**
 * JUSTIA COMPLY — Rule Engine Unit Tests
 * 
 * Tests cover:
 * - All operators (required, type, range, threshold, equality, enum, formula)
 * - PASS/FAIL/REVIEW results
 * - Boundary conditions
 * - Negative cases
 * - Formula DSL parsing
 * - Version status enforcement (only APPROVED can execute)
 */

import { describe, it, expect } from 'vitest';
import { evaluateRuleVersion, validateOperatorConfig, getSupportedOperators } from '../core/rule-engine';
import type { RuleVersion } from '../core/types';

function makeRuleVersion(overrides: Partial<RuleVersion> = {}): RuleVersion {
  return {
    id: 'test-rv',
    tenantId: 'test-tenant',
    ruleId: 'test-rule',
    version: 1,
    status: 'APPROVED',
    operators: [],
    rationale: 'Test rule',
    provenance: { legalSourceId: 'src-1', requirementId: 'req-1' },
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    ...overrides,
  };
}

describe('Rule Engine', () => {
  describe('Status enforcement', () => {
    it('returns REVIEW for non-APPROVED versions', () => {
      const rv = makeRuleVersion({ status: 'DRAFT', operators: [{ operator: 'required', field: 'x' }] });
      const result = evaluateRuleVersion(rv, { x: 'hello' });
      expect(result.result).toBe('REVIEW');
      expect(result.calculation).toContain('DRAFT');
    });

    it('returns REVIEW for RETIRED versions', () => {
      const rv = makeRuleVersion({ status: 'RETIRED' });
      const result = evaluateRuleVersion(rv, {});
      expect(result.result).toBe('REVIEW');
    });

    it('executes APPROVED versions normally', () => {
      const rv = makeRuleVersion({
        status: 'APPROVED',
        operators: [{ operator: 'required', field: 'name' }],
      });
      const result = evaluateRuleVersion(rv, { name: 'test' });
      expect(result.result).toBe('PASS');
    });
  });

  describe('Required operator', () => {
    it('passes when field is present', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'required', field: 'email' }] });
      const result = evaluateRuleVersion(rv, { email: 'test@example.com' });
      expect(result.result).toBe('PASS');
    });

    it('fails when field is missing', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'required', field: 'email' }] });
      const result = evaluateRuleVersion(rv, {});
      expect(result.result).toBe('FAIL');
    });

    it('fails when field is empty string', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'required', field: 'email' }] });
      const result = evaluateRuleVersion(rv, { email: '' });
      expect(result.result).toBe('FAIL');
    });

    it('fails when field is null', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'required', field: 'email' }] });
      const result = evaluateRuleVersion(rv, { email: null });
      expect(result.result).toBe('FAIL');
    });

    it('fails when field is empty array', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'required', field: 'items' }] });
      const result = evaluateRuleVersion(rv, { items: [] });
      expect(result.result).toBe('FAIL');
    });

    it('passes when field is 0 (falsy but present)', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'required', field: 'count' }] });
      const result = evaluateRuleVersion(rv, { count: 0 });
      expect(result.result).toBe('PASS');
    });
  });

  describe('Type operator', () => {
    it('passes for correct string type', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'type', field: 'name', expectedType: 'string' }] });
      const result = evaluateRuleVersion(rv, { name: 'hello' });
      expect(result.result).toBe('PASS');
    });

    it('fails for wrong type', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'type', field: 'name', expectedType: 'string' }] });
      const result = evaluateRuleVersion(rv, { name: 42 });
      expect(result.result).toBe('FAIL');
    });

    it('detects array type', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'type', field: 'items', expectedType: 'array' }] });
      const result = evaluateRuleVersion(rv, { items: [1, 2, 3] });
      expect(result.result).toBe('PASS');
    });

    it('detects number type', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'type', field: 'score', expectedType: 'number' }] });
      const result = evaluateRuleVersion(rv, { score: 95.5 });
      expect(result.result).toBe('PASS');
    });

    it('detects boolean type', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'type', field: 'active', expectedType: 'boolean' }] });
      const result = evaluateRuleVersion(rv, { active: true });
      expect(result.result).toBe('PASS');
    });
  });

  describe('Range operator', () => {
    it('passes when value is within range', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'range', field: 'age', min: 18, max: 65 }] });
      const result = evaluateRuleVersion(rv, { age: 30 });
      expect(result.result).toBe('PASS');
    });

    it('passes at boundaries (inclusive)', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'range', field: 'age', min: 18, max: 65 }] });
      expect(evaluateRuleVersion(rv, { age: 18 }).result).toBe('PASS');
      expect(evaluateRuleVersion(rv, { age: 65 }).result).toBe('PASS');
    });

    it('fails when below minimum', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'range', field: 'age', min: 18, max: 65 }] });
      const result = evaluateRuleVersion(rv, { age: 17 });
      expect(result.result).toBe('FAIL');
    });

    it('fails when above maximum', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'range', field: 'age', min: 18, max: 65 }] });
      const result = evaluateRuleVersion(rv, { age: 66 });
      expect(result.result).toBe('FAIL');
    });

    it('fails for non-numeric value', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'range', field: 'age', min: 18, max: 65 }] });
      const result = evaluateRuleVersion(rv, { age: 'thirty' });
      expect(result.result).toBe('FAIL');
    });

    it('works with only min specified', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'range', field: 'score', min: 0 }] });
      expect(evaluateRuleVersion(rv, { score: 100 }).result).toBe('PASS');
      expect(evaluateRuleVersion(rv, { score: -1 }).result).toBe('FAIL');
    });
  });

  describe('Threshold operator', () => {
    it('passes gte comparison', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'threshold', field: 'score', threshold: 50, comparison: 'gte' }] });
      expect(evaluateRuleVersion(rv, { score: 50 }).result).toBe('PASS');
      expect(evaluateRuleVersion(rv, { score: 51 }).result).toBe('PASS');
      expect(evaluateRuleVersion(rv, { score: 49 }).result).toBe('FAIL');
    });

    it('passes gt comparison', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'threshold', field: 'score', threshold: 50, comparison: 'gt' }] });
      expect(evaluateRuleVersion(rv, { score: 51 }).result).toBe('PASS');
      expect(evaluateRuleVersion(rv, { score: 50 }).result).toBe('FAIL');
    });

    it('passes lt comparison', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'threshold', field: 'days', threshold: 30, comparison: 'lt' }] });
      expect(evaluateRuleVersion(rv, { days: 29 }).result).toBe('PASS');
      expect(evaluateRuleVersion(rv, { days: 30 }).result).toBe('FAIL');
    });

    it('passes lte comparison', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'threshold', field: 'days', threshold: 30, comparison: 'lte' }] });
      expect(evaluateRuleVersion(rv, { days: 30 }).result).toBe('PASS');
      expect(evaluateRuleVersion(rv, { days: 31 }).result).toBe('FAIL');
    });

    it('passes eq comparison', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'threshold', field: 'status', threshold: 1, comparison: 'eq' }] });
      expect(evaluateRuleVersion(rv, { status: 1 }).result).toBe('PASS');
      expect(evaluateRuleVersion(rv, { status: 2 }).result).toBe('FAIL');
    });
  });

  describe('Equality operator', () => {
    it('passes for matching string values', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'equality', field: 'country', value: 'ES' }] });
      expect(evaluateRuleVersion(rv, { country: 'ES' }).result).toBe('PASS');
    });

    it('fails for non-matching values', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'equality', field: 'country', value: 'ES' }] });
      expect(evaluateRuleVersion(rv, { country: 'FR' }).result).toBe('FAIL');
    });

    it('does loose string comparison for numbers', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'equality', field: 'code', value: '42' }] });
      expect(evaluateRuleVersion(rv, { code: 42 }).result).toBe('PASS');
    });
  });

  describe('Enum operator', () => {
    it('passes for allowed value', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'enum', field: 'status', allowedValues: ['ACTIVE', 'PENDING', 'CLOSED'] }] });
      expect(evaluateRuleVersion(rv, { status: 'ACTIVE' }).result).toBe('PASS');
    });

    it('fails for disallowed value', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'enum', field: 'status', allowedValues: ['ACTIVE', 'PENDING', 'CLOSED'] }] });
      expect(evaluateRuleVersion(rv, { status: 'DELETED' }).result).toBe('FAIL');
    });
  });

  describe('Formula operator', () => {
    it('evaluates simple arithmetic', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'formula', field: 'result', formula: 'a + b' }] });
      const result = evaluateRuleVersion(rv, { a: 10, b: 20 });
      expect(result.result).toBe('PASS');
      expect(result.operatorResults[0].calculatedValue).toBe(30);
    });

    it('evaluates complex formula with precedence', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'formula', field: 'result', formula: 'a + b * c' }] });
      const result = evaluateRuleVersion(rv, { a: 2, b: 3, c: 4 });
      expect(result.operatorResults[0].calculatedValue).toBe(14);
    });

    it('evaluates formula with parentheses', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'formula', field: 'result', formula: '(a + b) * c' }] });
      const result = evaluateRuleVersion(rv, { a: 2, b: 3, c: 4 });
      expect(result.operatorResults[0].calculatedValue).toBe(20);
    });

    it('compares formula result against threshold', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'formula', field: 'result', formula: 'income - expenses', threshold: 0, comparison: 'gte' }] });
      expect(evaluateRuleVersion(rv, { income: 100, expenses: 80 }).result).toBe('PASS');
      expect(evaluateRuleVersion(rv, { income: 50, expenses: 80 }).result).toBe('FAIL');
    });

    it('handles division by zero', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'formula', field: 'result', formula: 'a / b' }] });
      const result = evaluateRuleVersion(rv, { a: 10, b: 0 });
      expect(result.result).toBe('FAIL');
      expect(result.operatorResults[0].explanation).toContain('Division by zero');
    });

    it('handles unknown variables gracefully', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'formula', field: 'result', formula: 'x + y' }] });
      const result = evaluateRuleVersion(rv, { a: 1 });
      expect(result.result).toBe('FAIL');
      expect(result.operatorResults[0].explanation).toContain('Unknown variable');
    });
  });

  describe('Multiple operators (AND logic)', () => {
    it('passes when all operators pass', () => {
      const rv = makeRuleVersion({
        operators: [
          { operator: 'required', field: 'name' },
          { operator: 'type', field: 'name', expectedType: 'string' },
          { operator: 'range', field: 'age', min: 18, max: 100 },
        ],
      });
      const result = evaluateRuleVersion(rv, { name: 'John', age: 25 });
      expect(result.result).toBe('PASS');
      expect(result.operatorResults.length).toBe(3);
    });

    it('fails if any operator fails', () => {
      const rv = makeRuleVersion({
        operators: [
          { operator: 'required', field: 'name' },
          { operator: 'range', field: 'age', min: 18, max: 100 },
        ],
      });
      const result = evaluateRuleVersion(rv, { name: 'John', age: 15 });
      expect(result.result).toBe('FAIL');
    });
  });

  describe('validateOperatorConfig', () => {
    it('returns no errors for valid required config', () => {
      const errors = validateOperatorConfig({ operator: 'required', field: 'name' });
      expect(errors.length).toBe(0);
    });

    it('returns error for missing field', () => {
      const errors = validateOperatorConfig({ operator: 'required', field: '' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('returns error for range with min > max', () => {
      const errors = validateOperatorConfig({ operator: 'range', field: 'x', min: 100, max: 10 });
      expect(errors.some(e => e.includes('min'))).toBe(true);
    });

    it('returns error for enum without values', () => {
      const errors = validateOperatorConfig({ operator: 'enum', field: 'status', allowedValues: [] });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('getSupportedOperators', () => {
    it('returns all 7 operators', () => {
      const ops = getSupportedOperators();
      expect(ops).toContain('required');
      expect(ops).toContain('type');
      expect(ops).toContain('range');
      expect(ops).toContain('threshold');
      expect(ops).toContain('equality');
      expect(ops).toContain('enum');
      expect(ops).toContain('formula');
      expect(ops.length).toBe(7);
    });
  });

  describe('Evidence and timestamps', () => {
    it('includes timestamp in evaluation', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'required', field: 'x' }] });
      const result = evaluateRuleVersion(rv, { x: 'test' });
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('includes inputs in evaluation result', () => {
      const rv = makeRuleVersion({ operators: [{ operator: 'required', field: 'x' }] });
      const result = evaluateRuleVersion(rv, { x: 'test' });
      expect(result.inputs).toEqual({ x: 'test' });
    });

    it('includes rule version info', () => {
      const rv = makeRuleVersion({ version: 3 });
      const result = evaluateRuleVersion(rv, {});
      expect(result.ruleVersionNumber).toBe(3);
      expect(result.ruleVersionId).toBe('test-rv');
    });
  });
});
