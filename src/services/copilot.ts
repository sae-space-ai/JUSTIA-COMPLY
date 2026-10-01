/**
 * JUSTIA COMPLY — AI Copilot Service
 * 
 * Provider interface for AI-assisted compliance tasks.
 * 
 * IMPORTANT CONSTRAINTS:
 * - AI can only PROPOSE, never APPROVE or PUBLISH
 * - All AI outputs are classified as GENERATED/DRAFT
 * - Human review is mandatory before any AI output becomes official
 * - If no provider is configured, graceful degradation (no AI features)
 * - NO simulated AI responses — if unavailable, say so clearly
 */

import type { CopilotRequest, AIOutputClassification, RuleOperatorConfig } from '../core/types';
import { store, recordAuditEvent } from './store';
import { getCurrentAuth } from './auth';

// ============ PROVIDER INTERFACE ============

export interface CopilotProvider {
  name: string;
  isAvailable(): boolean;
  extractRequirements(legalText: string): Promise<string>;
  draftRule(requirement: string, context: string): Promise<string>;
  suggestMapping(source: string, target: string): Promise<string>;
  explainRule(ruleConfig: RuleOperatorConfig[]): Promise<string>;
}

// ============ NULL PROVIDER (Graceful Degradation) ============

class NullProvider implements CopilotProvider {
  name = 'none';
  
  isAvailable(): boolean {
    return false;
  }
  
  async extractRequirements(_legalText: string): Promise<string> {
    throw new Error('AI_PROVIDER_UNAVAILABLE: No AI provider configured. Configure VITE_AI_PROVIDER and VITE_AI_API_KEY environment variables.');
  }
  
  async draftRule(_requirement: string, _context: string): Promise<string> {
    throw new Error('AI_PROVIDER_UNAVAILABLE: No AI provider configured.');
  }
  
  async suggestMapping(_source: string, _target: string): Promise<string> {
    throw new Error('AI_PROVIDER_UNAVAILABLE: No AI provider configured.');
  }
  
  async explainRule(_ruleConfig: RuleOperatorConfig[]): Promise<string> {
    throw new Error('AI_PROVIDER_UNAVAILABLE: No AI provider configured.');
  }
}

// ============ PROVIDER REGISTRY ============

let activeProvider: CopilotProvider = new NullProvider();

export function getProvider(): CopilotProvider {
  return activeProvider;
}

export function isAIEnabled(): boolean {
  return activeProvider.isAvailable();
}

export function getProviderName(): string {
  return activeProvider.name;
}

// In production, this would load the real provider based on env vars
// For now, we only have the null provider (graceful degradation)
export function initializeCopilot(): void {
  const providerName = (import.meta as any).env?.VITE_AI_PROVIDER;
  
  if (providerName === 'openai') {
    // Would initialize OpenAI provider here
    // For now, stays as NullProvider since we can't include real API keys
    console.info('[Copilot] OpenAI provider requested but not configured in this build.');
  }
  
  // Default: NullProvider (graceful degradation)
  activeProvider = new NullProvider();
}

// ============ COPILOT OPERATIONS ============

function generateSessionId(): string {
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function copilotExtractRequirements(
  tenantId: string,
  legalText: string
): Promise<CopilotRequest> {
  const auth = getCurrentAuth();
  if (!auth) throw new Error('Not authenticated');
  
  const request: CopilotRequest = {
    id: `copilot-${Date.now()}`,
    tenantId,
    type: 'EXTRACT_REQUIREMENTS',
    input: { legalText: legalText.slice(0, 5000) },
    status: 'PENDING',
    classification: 'GENERATED',
    sessionId: generateSessionId(),
    createdBy: auth.userId,
    createdAt: new Date().toISOString(),
  };

  // Save request
  const items = store.list<CopilotRequest>('copilotRequests', tenantId);
  items.push(request);
  localStorage.setItem(`jc:${tenantId}:copilotRequests`, JSON.stringify(items));

  try {
    request.status = 'PROCESSING';
    const output = await activeProvider.extractRequirements(legalText);
    request.output = output;
    request.status = 'COMPLETED';
    request.provider = activeProvider.name;
  } catch (err) {
    request.status = 'UNAVAILABLE';
    request.errorMessage = (err as Error).message;
  }

  // Update stored request
  const updatedItems = store.list<CopilotRequest>('copilotRequests', tenantId);
  const idx = updatedItems.findIndex(r => r.id === request.id);
  if (idx >= 0) updatedItems[idx] = request;
  localStorage.setItem(`jc:${tenantId}:copilotRequests`, JSON.stringify(updatedItems));

  recordAuditEvent(tenantId, 'CREATE', 'CopilotRequest', request.id, auth.userId, {
    type: request.type,
    status: request.status,
    provider: request.provider,
  });

  return request;
}

export async function copilotDraftRule(
  tenantId: string,
  requirement: string,
  context: string
): Promise<CopilotRequest> {
  const auth = getCurrentAuth();
  if (!auth) throw new Error('Not authenticated');

  const request: CopilotRequest = {
    id: `copilot-${Date.now()}`,
    tenantId,
    type: 'DRAFT_RULE',
    input: { requirement, context },
    status: 'PENDING',
    classification: 'GENERATED',
    sessionId: generateSessionId(),
    createdBy: auth.userId,
    createdAt: new Date().toISOString(),
  };

  const items = store.list<CopilotRequest>('copilotRequests', tenantId);
  items.push(request);
  localStorage.setItem(`jc:${tenantId}:copilotRequests`, JSON.stringify(items));

  try {
    request.status = 'PROCESSING';
    const output = await activeProvider.draftRule(requirement, context);
    request.output = output;
    request.status = 'COMPLETED';
    request.provider = activeProvider.name;
  } catch (err) {
    request.status = 'UNAVAILABLE';
    request.errorMessage = (err as Error).message;
  }

  const updatedItems = store.list<CopilotRequest>('copilotRequests', tenantId);
  const idx = updatedItems.findIndex(r => r.id === request.id);
  if (idx >= 0) updatedItems[idx] = request;
  localStorage.setItem(`jc:${tenantId}:copilotRequests`, JSON.stringify(updatedItems));

  recordAuditEvent(tenantId, 'CREATE', 'CopilotRequest', request.id, auth.userId, {
    type: request.type,
    status: request.status,
  });

  return request;
}

export async function copilotExplainRule(
  tenantId: string,
  operators: RuleOperatorConfig[]
): Promise<CopilotRequest> {
  const auth = getCurrentAuth();
  if (!auth) throw new Error('Not authenticated');

  const request: CopilotRequest = {
    id: `copilot-${Date.now()}`,
    tenantId,
    type: 'EXPLANATION',
    input: { operators },
    status: 'PENDING',
    classification: 'GENERATED',
    sessionId: generateSessionId(),
    createdBy: auth.userId,
    createdAt: new Date().toISOString(),
  };

  const items = store.list<CopilotRequest>('copilotRequests', tenantId);
  items.push(request);
  localStorage.setItem(`jc:${tenantId}:copilotRequests`, JSON.stringify(items));

  try {
    request.status = 'PROCESSING';
    const output = await activeProvider.explainRule(operators);
    request.output = output;
    request.status = 'COMPLETED';
    request.provider = activeProvider.name;
  } catch (err) {
    request.status = 'UNAVAILABLE';
    request.errorMessage = (err as Error).message;
  }

  const updatedItems = store.list<CopilotRequest>('copilotRequests', tenantId);
  const idx = updatedItems.findIndex(r => r.id === request.id);
  if (idx >= 0) updatedItems[idx] = request;
  localStorage.setItem(`jc:${tenantId}:copilotRequests`, JSON.stringify(updatedItems));

  return request;
}
