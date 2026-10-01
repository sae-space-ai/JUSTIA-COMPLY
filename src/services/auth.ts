/**
 * JUSTIA COMPLY — Auth Service
 * 
 * RBAC with tenant isolation. In production, this would be server-side.
 * For the browser demo, we simulate auth context with localStorage.
 * 
 * Roles:
 * - ADMIN: Full access, manage users, system config
 * - LEGAL_EXPERT: Create/edit legal sources, requirements, rules
 * - COMPLIANCE_OFFICER: Approve rules, execute validations, manage evidence
 * - AUDITOR: Read-only access to all entities, audit events, evidence
 */

import type { User, UserRole, Tenant, AuditAction } from '../core/types';
import { store } from './store';

// ============ PERMISSIONS ============

const ROLE_PERMISSIONS: Record<UserRole, Set<string>> = {
  ADMIN: new Set([
    'legal_source:read', 'legal_source:write',
    'requirement:read', 'requirement:write',
    'rule:read', 'rule:write',
    'rule_version:read', 'rule_version:write', 'rule_version:approve', 'rule_version:retire',
    'rule_test:read', 'rule_test:write',
    'validation:execute', 'validation:read',
    'evidence:read', 'evidence:write',
    'approval:read', 'approval:write',
    'audit:read',
    'user:read', 'user:write',
    'tenant:read', 'tenant:write',
    'copilot:use',
  ]),
  LEGAL_EXPERT: new Set([
    'legal_source:read', 'legal_source:write',
    'requirement:read', 'requirement:write',
    'rule:read', 'rule:write',
    'rule_version:read', 'rule_version:write',
    'rule_test:read', 'rule_test:write',
    'validation:read',
    'evidence:read',
    'approval:read',
    'audit:read',
    'copilot:use',
  ]),
  COMPLIANCE_OFFICER: new Set([
    'legal_source:read',
    'requirement:read',
    'rule:read', 'rule:write',
    'rule_version:read', 'rule_version:write', 'rule_version:approve',
    'rule_test:read', 'rule_test:write',
    'validation:execute', 'validation:read',
    'evidence:read', 'evidence:write',
    'approval:read', 'approval:write',
    'audit:read',
    'copilot:use',
  ]),
  AUDITOR: new Set([
    'legal_source:read',
    'requirement:read',
    'rule:read',
    'rule_version:read',
    'rule_test:read',
    'validation:read',
    'evidence:read',
    'approval:read',
    'audit:read',
  ]),
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function getActionForPermission(permission: string): AuditAction | null {
  const map: Record<string, AuditAction> = {
    'legal_source:write': 'CREATE',
    'requirement:write': 'CREATE',
    'rule:write': 'CREATE',
    'rule_version:write': 'EDIT',
    'rule_version:approve': 'APPROVE',
    'rule_version:retire': 'RETIRE',
    'rule_test:write': 'TEST',
    'validation:execute': 'EXECUTE',
  };
  return map[permission] || null;
}

// ============ AUTH CONTEXT ============

const AUTH_KEY = 'jc:auth';

export interface AuthState {
  userId: string;
  tenantId: string;
  role: UserRole;
  authenticatedAt: string;
}

export function getCurrentAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

// ============ INITIALIZATION ============

export function initializeSystem(): { tenant: Tenant; users: User[] } {
  const tenantId = 'tenant-default';
  
  // Create default tenant if not exists
  let tenant = store.getById<Tenant>('tenants', tenantId, tenantId);
  if (!tenant) {
    // Tenant is a special entity where id === tenantId
    const tenants = store.list<Tenant>('tenants', tenantId);
    tenant = { 
      id: tenantId, 
      tenantId,
      name: 'JUSTIA COMPLY Demo Organization', 
      createdAt: new Date().toISOString(), 
      active: true 
    };
    tenants.push(tenant);
    localStorage.setItem(`jc:${tenantId}:tenants`, JSON.stringify(tenants));
  }

  // Create demo users if not exist
  let users = store.list<User>('users', tenantId);
  if (users.length === 0) {
    const now = new Date().toISOString();
    const demoUsers: Omit<User, 'id' | 'tenantId'>[] = [
      { email: 'admin@justia.demo', displayName: 'Admin User', role: 'ADMIN', active: true, createdAt: now },
      { email: 'legal@justia.demo', displayName: 'Legal Expert', role: 'LEGAL_EXPERT', active: true, createdAt: now },
      { email: 'compliance@justia.demo', displayName: 'Compliance Officer', role: 'COMPLIANCE_OFFICER', active: true, createdAt: now },
      { email: 'auditor@justia.demo', displayName: 'Auditor', role: 'AUDITOR', active: true, createdAt: now },
    ];
    
    for (const u of demoUsers) {
      store.create<User>('users', tenantId, u);
    }
    users = store.list<User>('users', tenantId);
  }

  // Auto-login as ADMIN for demo
  const adminUser = users.find(u => u.role === 'ADMIN');
  if (adminUser && !getCurrentAuth()) {
    setAuth({
      userId: adminUser.id,
      tenantId,
      role: 'ADMIN',
      authenticatedAt: new Date().toISOString(),
    });
  }

  // Seed demo data
  store.seedDemoData(tenantId);

  return { tenant, users };
}

export function switchRole(role: UserRole): void {
  const auth = getCurrentAuth();
  if (!auth) return;
  
  const tenantId = auth.tenantId;
  const users = store.list<User>('users', tenantId);
  const user = users.find(u => u.role === role);
  if (user) {
    setAuth({
      userId: user.id,
      tenantId,
      role,
      authenticatedAt: new Date().toISOString(),
    });
  }
}

export function getCurrentUser(): User | null {
  const auth = getCurrentAuth();
  if (!auth) return null;
  return store.getById<User>('users', auth.tenantId, auth.userId);
}
