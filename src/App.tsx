import { useState, useEffect, useCallback } from 'react';
import {
  Shield, GitBranch, Cloud, Database, Code2,
  CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Github, Lock, Eye, Zap, FileText, Settings,
  Layers, GitPullRequest, GitCommit, Rocket,
  BarChart3, Activity, Users, Globe, ChevronRight,
  Terminal, Package, BookOpen, Workflow, CircleDot,
  Plus, Play, Trash2, Edit3, Save, X, ChevronDown,
  Scale, BookMarked, FlaskConical, ClipboardCheck,
  FolderOpen, Search, Bot, AlertCircle, RotateCcw,
  History, ShieldCheck, Hash, ArrowLeftRight
} from 'lucide-react';

import type {
  LegalSource, Requirement, Rule, RuleVersion, RuleTest,
  ValidationRun, Evidence, AuditEvent, Approval, User,
  RuleOperator, RuleOperatorConfig, ValidationResult, RuleVersionStatus
} from './core/types';
import { store, recordAuditEvent } from './services/store';
import { getCurrentAuth, getCurrentUser, hasPermission, switchRole, initializeSystem } from './services/auth';
import { evaluateRuleVersion, validateOperatorConfig, getSupportedOperators } from './core/rule-engine';
import { isAIEnabled, getProviderName, copilotDraftRule } from './services/copilot';

type View = 'landing' | 'dashboard' | 'sources' | 'requirements' | 'rules' | 'catalogue' | 'test-console' | 'approvals' | 'evidence' | 'audit' | 'architecture' | 'pipeline' | 'repository' | 'docs';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [initialized, setInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    const { users } = initializeSystem();
    setCurrentUser(getCurrentUser());
    setAiAvailable(isAIEnabled());
    setInitialized(true);
  }, []);

  const auth = getCurrentAuth();

  const handleSwitchRole = (role: 'ADMIN' | 'LEGAL_EXPERT' | 'COMPLIANCE_OFFICER' | 'AUDITOR') => {
    switchRole(role);
    setCurrentUser(getCurrentUser());
  };

  if (!initialized) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Initializing...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {currentView === 'landing' ? (
        <LandingView onNavigate={setCurrentView} />
      ) : (
        <PlatformLayout
          currentView={currentView}
          onNavigate={setCurrentView}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          aiAvailable={aiAvailable}
        >
          {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} />}
          {currentView === 'sources' && <LegalSourcesView />}
          {currentView === 'requirements' && <RequirementsView />}
          {currentView === 'rules' && <RulesView />}
          {currentView === 'catalogue' && <RuleCatalogueView />}
          {currentView === 'test-console' && <TestConsoleView />}
          {currentView === 'approvals' && <ApprovalsView />}
          {currentView === 'evidence' && <EvidenceVaultView />}
          {currentView === 'audit' && <AuditExplorerView />}
          {currentView === 'architecture' && <ArchitectureView />}
          {currentView === 'pipeline' && <PipelineView />}
          {currentView === 'repository' && <RepositoryView />}
          {currentView === 'docs' && <DocsView />}
        </PlatformLayout>
      )}
    </div>
  );
}

// ============ LANDING PAGE (preserved from original) ============
function LandingView({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">JUSTIA <span className="text-indigo-400">COMPLY</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <button onClick={() => onNavigate('architecture')} className="hover:text-white transition-colors">Arquitectura</button>
            <button onClick={() => onNavigate('pipeline')} className="hover:text-white transition-colors">Pipeline</button>
            <button onClick={() => onNavigate('docs')} className="hover:text-white transition-colors">Documentación</button>
          </div>
          <button onClick={() => onNavigate('dashboard')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors">
            Acceder al Portal
          </button>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
            <CircleDot className="w-4 h-4" />
            <span>Compliance-by-Design • v1.0.0 • Vertical Slice Active</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Cumplimiento Regulatorio
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Automatizado y Trazable
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            Legal Source → Requirement → Rule → Test → Human Approval → Execution → Evidence → Audit.
            Motor determinista. Sin eval(). Trazabilidad completa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-12 text-xs">
            {['Legal Source', '→', 'Requirement', '→', 'Rule', '→', 'Test', '→', 'Approval', '→', 'Execute', '→', 'Evidence', '→', 'Audit'].map((s, i) => (
              s === '→' ? <ArrowRight key={i} className="w-3 h-3 text-slate-600" /> :
              <span key={i} className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-slate-300">{s}</span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button onClick={() => onNavigate('dashboard')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-base font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2">
              <Rocket className="w-5 h-5" /> Acceder al Studio
            </button>
            <button onClick={() => onNavigate('sources')} className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2">
              <Scale className="w-5 h-5" /> Legal Sources
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PrincipleCard icon={<Github className="w-6 h-6" />} title="GitHub First" description="Fuente de verdad. CI/CD, versionado, gobernanza. Zero secrets en código." />
            <PrincipleCard icon={<Cloud className="w-6 h-6" />} title="Vercel Deploy" description="Preview por PR. Frontend/BFF en Vercel. Servicios pesados fuera." />
            <PrincipleCard icon={<Lock className="w-6 h-6" />} title="Compliance-by-Design" description="CODE ≠ CONFIG ≠ SECRETS ≠ DATA. Rollback de reglas independiente." />
          </div>
        </div>
      </header>

      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Arquitectura Híbrida</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">Separación de responsabilidades para compatibilidad con runtime de Vercel.</p>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <ArchLayer color="indigo" icon={<Globe className="w-5 h-5" />} title="Vercel" items={['Frontend / Portal', 'Admin Dashboard', 'BFF / API Routes', 'Preview Deploys']} />
            <ArchLayer color="cyan" icon={<Database className="w-5 h-5" />} title="Servicios" items={['Rule Engine', 'AI Orchestrator', 'Compliance Engine', 'Regulatory Ingestion']} />
            <ArchLayer color="emerald" icon={<Database className="w-5 h-5" />} title="Persistencia" items={['PostgreSQL', 'Object Storage', 'Vector Store', 'Message Queue']} />
            <ArchLayer color="amber" icon={<GitBranch className="w-5 h-5" />} title="GitHub" items={['Source Code', 'CI/CD Pipelines', 'Secret Management', 'SBOM & Scanning']} />
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-slate-800/50 text-center">
        <p className="text-slate-500 text-sm">JUSTIA COMPLY v1.0.0 • Compliance-by-Design • GitHub → CI → Vercel → Production</p>
      </footer>
    </div>
  );
}

function PrincipleCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function ArchLayer({ color, icon, title, items }: { color: string; icon: React.ReactNode; title: string; items: string[] }) {
  const colorClasses: Record<string, string> = {
    indigo: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400',
    cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  };
  return (
    <div className={`p-5 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-4">{icon}<h3 className="font-semibold text-white">{title}</h3></div>
      <ul className="space-y-2">{items.map(item => (<li key={item} className="text-sm text-slate-400 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />{item}</li>))}</ul>
    </div>
  );
}

// ============ PLATFORM LAYOUT ============
function PlatformLayout({ currentView, onNavigate, currentUser, onSwitchRole, aiAvailable, children }: {
  currentView: View; onNavigate: (v: View) => void; currentUser: User | null;
  onSwitchRole: (role: 'ADMIN' | 'LEGAL_EXPERT' | 'COMPLIANCE_OFFICER' | 'AUDITOR') => void; aiAvailable: boolean;
  children: React.ReactNode;
}) {
  const studioItems: { id: View; label: string; icon: React.ReactNode; perm?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'sources', label: 'Legal Sources', icon: <Scale className="w-4 h-4" />, perm: 'legal_source:read' },
    { id: 'requirements', label: 'Requirements', icon: <BookMarked className="w-4 h-4" />, perm: 'requirement:read' },
    { id: 'rules', label: 'Rule Studio', icon: <Code2 className="w-4 h-4" />, perm: 'rule:read' },
    { id: 'catalogue', label: 'Rule Catalogue', icon: <FolderOpen className="w-4 h-4" />, perm: 'rule_version:read' },
    { id: 'test-console', label: 'Test Console', icon: <FlaskConical className="w-4 h-4" />, perm: 'rule_test:read' },
    { id: 'approvals', label: 'Approval Queue', icon: <ClipboardCheck className="w-4 h-4" />, perm: 'approval:read' },
    { id: 'evidence', label: 'Evidence Vault', icon: <FolderOpen className="w-4 h-4" />, perm: 'evidence:read' },
    { id: 'audit', label: 'Audit Explorer', icon: <History className="w-4 h-4" />, perm: 'audit:read' },
  ];

  const infraItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'architecture', label: 'Arquitectura', icon: <Layers className="w-4 h-4" /> },
    { id: 'pipeline', label: 'Pipeline CI/CD', icon: <Workflow className="w-4 h-4" /> },
    { id: 'repository', label: 'Repositorio', icon: <Github className="w-4 h-4" /> },
    { id: 'docs', label: 'Documentación', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const role = currentUser?.role || 'ADMIN';

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full overflow-y-auto">
        <div className="p-4 border-b border-slate-800">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5 w-full">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold block leading-tight">JUSTIA COMPLY</span>
              <span className="text-[10px] text-slate-500">v1.0.0 • Studio</span>
            </div>
          </button>
        </div>

        <div className="px-3 py-2 border-b border-slate-800">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/50 rounded-lg">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={role}
              onChange={e => onSwitchRole(e.target.value as any)}
              className="bg-transparent text-xs text-slate-300 flex-1 outline-none cursor-pointer"
            >
              <option value="ADMIN">Admin</option>
              <option value="LEGAL_EXPERT">Legal Expert</option>
              <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
              <option value="AUDITOR">Auditor</option>
            </select>
          </div>
          {aiAvailable ? (
            <div className="flex items-center gap-1.5 mt-1.5 px-2 text-[10px] text-emerald-400">
              <Bot className="w-3 h-3" /> AI: {getProviderName()}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1.5 px-2 text-[10px] text-slate-500">
              <Bot className="w-3 h-3" /> AI: No configurado
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Regulatory Studio</p>
          {studioItems.map(item => {
            const canAccess = !item.perm || hasPermission(role, item.perm);
            if (!canAccess) return null;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  currentView === item.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>
                {item.icon}{item.label}
              </button>
            );
          })}
          
          <p className="px-3 py-1.5 mt-4 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Infraestructura</p>
          {infraItems.map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                currentView === item.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-60 p-6 min-h-screen">{children}</main>
    </div>
  );
}

// Fix: PlatformLayout needs to render children
// Let me refactor to pass children properly

// ============ DASHBOARD (Real Data) ============
function DashboardView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId } = auth;

  const sources = store.list<LegalSource>('legalSources', tenantId);
  const requirements = store.list<Requirement>('requirements', tenantId);
  const rules = store.list<Rule>('rules', tenantId);
  const ruleVersions = store.list<RuleVersion>('ruleVersions', tenantId);
  const validationRuns = store.list<ValidationRun>('validationRuns', tenantId);
  const auditEvents = store.getAuditEvents(tenantId, 10);

  const approvedVersions = ruleVersions.filter(rv => rv.status === 'APPROVED');
  const draftVersions = ruleVersions.filter(rv => rv.status === 'DRAFT');
  const reviewVersions = ruleVersions.filter(rv => rv.status === 'REVIEW');

  const passCount = validationRuns.filter(v => v.result === 'PASS').length;
  const failCount = validationRuns.filter(v => v.result === 'FAIL').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard de Cumplimiento</h1>
        <p className="text-slate-400 text-sm">Datos reales del sistema. Todo marcado DEMO donde aplica.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <DashStat label="Legal Sources" value={sources.length} icon={<Scale className="w-4 h-4" />} color="indigo" />
        <DashStat label="Requirements" value={requirements.length} icon={<BookMarked className="w-4 h-4" />} color="cyan" />
        <DashStat label="Rules" value={rules.length} icon={<Code2 className="w-4 h-4" />} color="emerald" />
        <DashStat label="Approved Versions" value={approvedVersions.length} icon={<ShieldCheck className="w-4 h-4" />} color="amber" />
        <DashStat label="Executions" value={validationRuns.length} icon={<Zap className="w-4 h-4" />} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Version Status
          </h3>
          <div className="space-y-2">
            <StatusBar label="APPROVED" count={approvedVersions.length} total={ruleVersions.length} color="bg-emerald-500" />
            <StatusBar label="REVIEW" count={reviewVersions.length} total={ruleVersions.length} color="bg-amber-500" />
            <StatusBar label="DRAFT" count={draftVersions.length} total={ruleVersions.length} color="bg-slate-500" />
            <StatusBar label="RETIRED" count={ruleVersions.filter(v => v.status === 'RETIRED').length} total={ruleVersions.length} color="bg-red-500" />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">Validation Results</span>
            <span><span className="text-emerald-400">{passCount} PASS</span> / <span className="text-red-400">{failCount} FAIL</span></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" /> Audit Trail (últimos 10)
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {auditEvents.length === 0 ? (
              <p className="text-xs text-slate-500">Sin eventos de auditoría.</p>
            ) : auditEvents.map(evt => (
              <div key={evt.id} className="flex items-center gap-2 text-xs">
                <span className={`px-1.5 py-0.5 rounded font-mono ${
                  evt.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400' :
                  evt.action === 'APPROVE' ? 'bg-indigo-500/10 text-indigo-400' :
                  evt.action === 'EXECUTE' ? 'bg-cyan-500/10 text-cyan-400' :
                  evt.action === 'EDIT' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-slate-700 text-slate-300'
                }`}>{evt.action}</span>
                <span className="text-slate-400 truncate">{evt.entityType}</span>
                <span className="text-slate-600 ml-auto">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Accesos Rápidos</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onNavigate('sources')} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Legal Sources</button>
          <button onClick={() => onNavigate('rules')} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> Rule Studio</button>
          <button onClick={() => onNavigate('test-console')} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5" /> Test Console</button>
          <button onClick={() => onNavigate('approvals')} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5" /> Approval Queue</button>
          <button onClick={() => onNavigate('audit')} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Audit Explorer</button>
        </div>
      </div>
    </div>
  );
}

function DashStat({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = { indigo: 'text-indigo-400 bg-indigo-500/10', cyan: 'text-cyan-400 bg-cyan-500/10', emerald: 'text-emerald-400 bg-emerald-500/10', amber: 'text-amber-400 bg-amber-500/10', violet: 'text-violet-400 bg-violet-500/10' };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-20">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{count}</span>
    </div>
  );
}

// ============ LEGAL SOURCES VIEW ============
function LegalSourcesView() {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId, userId } = auth;
  const canWrite = hasPermission(auth.role, 'legal_source:write');

  const [sources, setSources] = useState(() => store.list<LegalSource>('legalSources', tenantId));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LegalSource | null>(null);
  const [form, setForm] = useState({ title: '', jurisdiction: '', authority: '', effectiveDate: '', referenceId: '', url: '', summary: '' });

  const refresh = () => setSources(store.list<LegalSource>('legalSources', tenantId));

  const handleSave = () => {
    if (!form.title || !form.referenceId) return;
    const now = new Date().toISOString();
    if (editing) {
      store.update<LegalSource>('legalSources', tenantId, editing.id, { ...form, updatedAt: now });
      recordAuditEvent(tenantId, 'EDIT', 'LegalSource', editing.id, userId, { ...form });
    } else {
      const created = store.create<LegalSource>('legalSources', tenantId, { ...form, createdAt: now, updatedAt: now, createdBy: userId, isDemo: false });
      recordAuditEvent(tenantId, 'CREATE', 'LegalSource', created.id, userId, { title: form.title });
    }
    setForm({ title: '', jurisdiction: '', authority: '', effectiveDate: '', referenceId: '', url: '', summary: '' });
    setShowForm(false);
    setEditing(null);
    refresh();
  };

  const handleEdit = (src: LegalSource) => {
    setForm({ title: src.title, jurisdiction: src.jurisdiction, authority: src.authority, effectiveDate: src.effectiveDate, referenceId: src.referenceId, url: src.url || '', summary: src.summary });
    setEditing(src);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    store.delete<LegalSource>('legalSources', tenantId, id);
    recordAuditEvent(tenantId, 'EDIT', 'LegalSource', id, userId, { action: 'DELETE' });
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Legal Sources</h1>
          <p className="text-slate-400 text-sm">Fuentes regulatorias oficiales. Base del vertical slice.</p>
        </div>
        {canWrite && (
          <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', jurisdiction: '', authority: '', effectiveDate: '', referenceId: '', url: '', summary: '' }); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva Fuente
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3">{editing ? 'Editar' : 'Nueva'} Legal Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" />
            <input placeholder="Reference ID * (e.g., GDPR Art. 17)" value={form.referenceId} onChange={e => setForm({...form, referenceId: e.target.value})} className="input-field" />
            <input placeholder="Jurisdiction" value={form.jurisdiction} onChange={e => setForm({...form, jurisdiction: e.target.value})} className="input-field" />
            <input placeholder="Authority" value={form.authority} onChange={e => setForm({...form, authority: e.target.value})} className="input-field" />
            <input type="date" placeholder="Effective Date" value={form.effectiveDate} onChange={e => setForm({...form, effectiveDate: e.target.value})} className="input-field" />
            <input placeholder="URL" value={form.url} onChange={e => setForm({...form, url: e.target.value})} className="input-field" />
            <textarea placeholder="Summary" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} className="input-field md:col-span-2" rows={2} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Guardar</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sources.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <Scale className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay fuentes regulatorias. Crea la primera.</p>
          </div>
        ) : sources.map(src => (
          <div key={src.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs font-mono">{src.referenceId}</span>
                  {src.isDemo && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px]">DEMO</span>}
                  <span className="text-xs text-slate-500">{src.jurisdiction}</span>
                </div>
                <h3 className="text-sm font-semibold">{src.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{src.summary}</p>
                <p className="text-xs text-slate-600 mt-1">{src.authority} • Effective: {src.effectiveDate}</p>
              </div>
              {canWrite && (
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(src)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(src.id)} className="p-1.5 hover:bg-slate-800 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ REQUIREMENTS VIEW ============
function RequirementsView() {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId, userId } = auth;
  const canWrite = hasPermission(auth.role, 'requirement:write');

  const sources = store.list<LegalSource>('legalSources', tenantId);
  const [requirements, setRequirements] = useState(() => store.list<Requirement>('requirements', tenantId));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ legalSourceId: '', title: '', description: '', obligation: 'MUST' as const, category: '' });

  const refresh = () => setRequirements(store.list<Requirement>('requirements', tenantId));

  const handleSave = () => {
    if (!form.title || !form.legalSourceId) return;
    const now = new Date().toISOString();
    const created = store.create<Requirement>('requirements', tenantId, { ...form, createdAt: now, updatedAt: now, createdBy: userId, isDemo: false });
    recordAuditEvent(tenantId, 'CREATE', 'Requirement', created.id, userId, { title: form.title, sourceId: form.legalSourceId });
    setForm({ legalSourceId: '', title: '', description: '', obligation: 'MUST', category: '' });
    setShowForm(false);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Requirements Registry</h1>
          <p className="text-slate-400 text-sm">Requisitos derivados de fuentes regulatorias.</p>
        </div>
        {canWrite && sources.length > 0 && (
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo Requisito
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3">Nuevo Requirement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.legalSourceId} onChange={e => setForm({...form, legalSourceId: e.target.value})} className="input-field">
              <option value="">Seleccionar fuente legal *</option>
              {sources.map(s => <option key={s.id} value={s.id}>{s.referenceId} — {s.title}</option>)}
            </select>
            <input placeholder="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" />
            <select value={form.obligation} onChange={e => setForm({...form, obligation: e.target.value as any})} className="input-field">
              <option value="MUST">MUST</option><option value="SHOULD">SHOULD</option><option value="MAY">MAY</option>
            </select>
            <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field md:col-span-2" rows={2} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Guardar</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {requirements.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <BookMarked className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{sources.length === 0 ? 'Crea una Legal Source primero.' : 'No hay requisitos. Deriva uno de una fuente legal.'}</p>
          </div>
        ) : requirements.map(req => {
          const source = sources.find(s => s.id === req.legalSourceId);
          return (
            <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${req.obligation === 'MUST' ? 'bg-red-500/10 text-red-400' : req.obligation === 'SHOULD' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>{req.obligation}</span>
                {source && <span className="text-xs text-indigo-400 font-mono">{source.referenceId}</span>}
                {req.isDemo && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px]">DEMO</span>}
              </div>
              <h3 className="text-sm font-semibold">{req.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{req.description}</p>
              {req.category && <span className="text-xs text-slate-500 mt-1 inline-block">Category: {req.category}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ RULES VIEW (Authoring Studio) ============
function RulesView() {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId, userId } = auth;
  const canWrite = hasPermission(auth.role, 'rule:write');

  const requirements = store.list<Requirement>('requirements', tenantId);
  const [rules, setRules] = useState(() => store.list<Rule>('rules', tenantId));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ requirementId: '', name: '', description: '' });

  const refresh = () => setRules(store.list<Rule>('rules', tenantId));

  const handleSave = () => {
    if (!form.name || !form.requirementId) return;
    const now = new Date().toISOString();
    const created = store.create<Rule>('rules', tenantId, { ...form, createdAt: now, updatedAt: now, createdBy: userId, isDemo: false });
    // Auto-create first rule version
    const rv = store.create<RuleVersion>('ruleVersions', tenantId, {
      ruleId: created.id, version: 1, status: 'DRAFT', operators: [],
      rationale: 'Initial version', provenance: { legalSourceId: requirements.find(r => r.id === form.requirementId)?.legalSourceId || '', requirementId: form.requirementId },
      createdBy: userId, createdAt: now, updatedAt: now, isDemo: false,
    });
    recordAuditEvent(tenantId, 'CREATE', 'Rule', created.id, userId, { name: form.name, ruleVersionId: rv.id });
    setForm({ requirementId: '', name: '', description: '' });
    setShowForm(false);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rule Authoring Studio</h1>
          <p className="text-slate-400 text-sm">Crea reglas vinculadas a requisitos. Cada regla genera un RuleVersion inicial.</p>
        </div>
        {canWrite && requirements.length > 0 && (
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva Regla
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3">Nueva Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.requirementId} onChange={e => setForm({...form, requirementId: e.target.value})} className="input-field">
              <option value="">Seleccionar requisito *</option>
              {requirements.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
            <input placeholder="Rule Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field md:col-span-2" rows={2} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Crear Regla + v1</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{requirements.length === 0 ? 'Crea requisitos primero.' : 'No hay reglas. Crea la primera.'}</p>
          </div>
        ) : rules.map(rule => {
          const req = requirements.find(r => r.id === rule.requirementId);
          const versions = store.getRuleVersionsByRule(tenantId, rule.id);
          const latest = versions[0];
          return (
            <div key={rule.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {latest && <StatusBadge status={latest.status} />}
                    {rule.isDemo && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px]">DEMO</span>}
                    <span className="text-xs text-slate-500">v{latest?.version || 0} • {versions.length} version(es)</span>
                  </div>
                  <h3 className="text-sm font-semibold">{rule.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
                  {req && <p className="text-xs text-indigo-400 mt-1">→ {req.title}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RuleVersionStatus }) {
  const styles: Record<RuleVersionStatus, string> = {
    DRAFT: 'bg-slate-700 text-slate-300',
    REVIEW: 'bg-amber-500/10 text-amber-400',
    APPROVED: 'bg-emerald-500/10 text-emerald-400',
    RETIRED: 'bg-red-500/10 text-red-400',
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${styles[status]}`}>{status}</span>;
}

// ============ RULE CATALOGUE VIEW ============
function RuleCatalogueView() {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId, userId } = auth;
  const canWrite = hasPermission(auth.role, 'rule_version:write');
  const canApprove = hasPermission(auth.role, 'rule_version:approve');

  const rules = store.list<Rule>('rules', tenantId);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(rules[0]?.id || null);
  const [editingVersion, setEditingVersion] = useState<RuleVersion | null>(null);
  const [, forceUpdate] = useState(0);

  const selectedRule = rules.find(r => r.id === selectedRuleId);
  const versions = selectedRuleId ? store.getRuleVersionsByRule(tenantId, selectedRuleId) : [];

  const handleCreateVersion = () => {
    if (!selectedRule) return;
    const latestVersion = versions[0]?.version || 0;
    const now = new Date().toISOString();
    const rv = store.create<RuleVersion>('ruleVersions', tenantId, {
      ruleId: selectedRule.id, version: latestVersion + 1, status: 'DRAFT',
      operators: versions[0] ? [...versions[0].operators] : [],
      rationale: '', provenance: versions[0]?.provenance || { legalSourceId: '', requirementId: selectedRule.requirementId },
      createdBy: userId, createdAt: now, updatedAt: now, isDemo: false,
    });
    recordAuditEvent(tenantId, 'CREATE', 'RuleVersion', rv.id, userId, { version: rv.version, ruleId: selectedRule.id });
    forceUpdate(n => n + 1);
  };

  const handleApprove = (rvId: string) => {
    store.update<RuleVersion>('ruleVersions', tenantId, rvId, { status: 'APPROVED', approvedBy: userId, approvedAt: new Date().toISOString() });
    recordAuditEvent(tenantId, 'APPROVE', 'RuleVersion', rvId, userId, {});
    forceUpdate(n => n + 1);
  };

  const handleRetire = (rvId: string) => {
    store.update<RuleVersion>('ruleVersions', tenantId, rvId, { status: 'RETIRED', retiredAt: new Date().toISOString(), retiredBy: userId });
    recordAuditEvent(tenantId, 'RETIRE', 'RuleVersion', rvId, userId, {});
    forceUpdate(n => n + 1);
  };

  const handleMoveToReview = (rvId: string) => {
    store.update<RuleVersion>('ruleVersions', tenantId, rvId, { status: 'REVIEW' });
    recordAuditEvent(tenantId, 'EDIT', 'RuleVersion', rvId, userId, { status: 'REVIEW' });
    forceUpdate(n => n + 1);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Rule Catalogue</h1>
        <p className="text-slate-400 text-sm">Version history y gestión de estados. Solo APPROVED puede ejecutarse oficialmente.</p>
      </div>

      {rules.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay reglas. Crea reglas en el Rule Studio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Reglas</h3>
            <div className="space-y-1">
              {rules.map(rule => (
                <button key={rule.id} onClick={() => { setSelectedRuleId(rule.id); setEditingVersion(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedRuleId === rule.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800'}`}>
                  {rule.name}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedRule && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">{selectedRule.name} — Versiones</h3>
                  {canWrite && (
                    <button onClick={handleCreateVersion} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs flex items-center gap-1">
                      <Plus className="w-3 h-3" /> New Version
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {versions.map(rv => (
                    <div key={rv.id} className={`p-4 rounded-lg border ${editingVersion?.id === rv.id ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800 bg-slate-950'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">v{rv.version}</span>
                          <StatusBadge status={rv.status} />
                          {rv.aiGenerated && <span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded text-[10px]">AI GENERATED</span>}
                          {rv.isDemo && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px]">DEMO</span>}
                        </div>
                        <div className="flex gap-1">
                          {canWrite && rv.status === 'DRAFT' && (
                            <button onClick={() => setEditingVersion(rv)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] flex items-center gap-1"><Edit3 className="w-3 h-3" /> Edit</button>
                          )}
                          {canWrite && rv.status === 'DRAFT' && (
                            <button onClick={() => handleMoveToReview(rv.id)} className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded text-[10px]">→ Review</button>
                          )}
                          {canApprove && rv.status === 'REVIEW' && (
                            <button onClick={() => handleApprove(rv.id)} className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded text-[10px]">✓ Approve</button>
                          )}
                          {canWrite && (rv.status === 'APPROVED' || rv.status === 'REVIEW') && (
                            <button onClick={() => handleRetire(rv.id)} className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-[10px]">Retire</button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{rv.rationale || 'Sin rationale'}</p>
                      <div className="flex flex-wrap gap-1">
                        {rv.operators.map((op, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">
                            {op.operator}:{op.field}
                          </span>
                        ))}
                        {rv.operators.length === 0 && <span className="text-[10px] text-slate-600">Sin operadores</span>}
                      </div>
                      {editingVersion?.id === rv.id && (
                        <VersionEditor version={rv} onSave={() => { setEditingVersion(null); forceUpdate(n => n + 1); }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VersionEditor({ version, onSave }: { version: RuleVersion; onSave: () => void }) {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId, userId } = auth;

  const [operators, setOperators] = useState<RuleOperatorConfig[]>(version.operators);
  const [rationale, setRationale] = useState(version.rationale);
  const [errors, setErrors] = useState<string[]>([]);

  const addOperator = (op: RuleOperator) => {
    const defaults: Record<RuleOperator, RuleOperatorConfig> = {
      required: { operator: 'required', field: '' },
      type: { operator: 'type', field: '', expectedType: 'string' },
      range: { operator: 'range', field: '', min: 0, max: 100 },
      threshold: { operator: 'threshold', field: '', threshold: 0, comparison: 'gte' },
      equality: { operator: 'equality', field: '', value: '' },
      enum: { operator: 'enum', field: '', allowedValues: [''] },
      formula: { operator: 'formula', field: 'result', formula: '' },
    };
    setOperators([...operators, defaults[op]]);
  };

  const updateOperator = (idx: number, updates: Partial<RuleOperatorConfig>) => {
    const newOps = [...operators];
    newOps[idx] = { ...newOps[idx], ...updates };
    setOperators(newOps);
  };

  const removeOperator = (idx: number) => {
    setOperators(operators.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const allErrors: string[] = [];
    operators.forEach((op, i) => {
      const errs = validateOperatorConfig(op);
      errs.forEach(e => allErrors.push(`Op ${i + 1}: ${e}`));
    });
    if (allErrors.length > 0) { setErrors(allErrors); return; }
    
    store.update<RuleVersion>('ruleVersions', tenantId, version.id, { operators, rationale, updatedAt: new Date().toISOString() });
    recordAuditEvent(tenantId, 'EDIT', 'RuleVersion', version.id, userId, { operators, rationale });
    setErrors([]);
    onSave();
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-800">
      {errors.length > 0 && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}
      
      <textarea placeholder="Rationale" value={rationale} onChange={e => setRationale(e.target.value)} className="input-field mb-3" rows={2} />
      
      <div className="space-y-2 mb-3">
        {operators.map((op, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800">
            <select value={op.operator} onChange={e => updateOperator(idx, { operator: e.target.value as RuleOperator })} className="bg-slate-800 rounded px-2 py-1 text-xs w-24">
              {getSupportedOperators().map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <input placeholder="field" value={op.field} onChange={e => updateOperator(idx, { field: e.target.value })} className="bg-slate-800 rounded px-2 py-1 text-xs w-24" />
            {op.operator === 'type' && (
              <select value={op.expectedType} onChange={e => updateOperator(idx, { expectedType: e.target.value })} className="bg-slate-800 rounded px-2 py-1 text-xs w-20">
                <option value="string">string</option><option value="number">number</option><option value="boolean">boolean</option><option value="array">array</option>
              </select>
            )}
            {op.operator === 'range' && (
              <>
                <input type="number" placeholder="min" value={op.min ?? ''} onChange={e => updateOperator(idx, { min: Number(e.target.value) })} className="bg-slate-800 rounded px-2 py-1 text-xs w-16" />
                <input type="number" placeholder="max" value={op.max ?? ''} onChange={e => updateOperator(idx, { max: Number(e.target.value) })} className="bg-slate-800 rounded px-2 py-1 text-xs w-16" />
              </>
            )}
            {op.operator === 'threshold' && (
              <>
                <input type="number" placeholder="threshold" value={op.threshold ?? ''} onChange={e => updateOperator(idx, { threshold: Number(e.target.value) })} className="bg-slate-800 rounded px-2 py-1 text-xs w-20" />
                <select value={op.comparison} onChange={e => updateOperator(idx, { comparison: e.target.value as any })} className="bg-slate-800 rounded px-2 py-1 text-xs w-16">
                  <option value="gte">≥</option><option value="gt">&gt;</option><option value="lte">≤</option><option value="lt">&lt;</option><option value="eq">=</option><option value="neq">≠</option>
                </select>
              </>
            )}
            {op.operator === 'equality' && (
              <input placeholder="value" value={String(op.value ?? '')} onChange={e => updateOperator(idx, { value: e.target.value })} className="bg-slate-800 rounded px-2 py-1 text-xs w-24" />
            )}
            {op.operator === 'formula' && (
              <input placeholder="formula (e.g., a + b * c)" value={op.formula ?? ''} onChange={e => updateOperator(idx, { formula: e.target.value })} className="bg-slate-800 rounded px-2 py-1 text-xs flex-1" />
            )}
            <button onClick={() => removeOperator(idx)} className="p-1 text-red-400 hover:bg-slate-800 rounded"><X className="w-3 h-3" /></button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {getSupportedOperators().map(op => (
          <button key={op} onClick={() => addOperator(op)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300">+ {op}</button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs flex items-center gap-1"><Save className="w-3 h-3" /> Save Version</button>
      </div>
    </div>
  );
}

// ============ TEST CONSOLE VIEW ============
function TestConsoleView() {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId, userId } = auth;

  const ruleVersions = store.list<RuleVersion>('ruleVersions', tenantId);
  const approvedVersions = ruleVersions.filter(rv => rv.status === 'APPROVED');
  const [selectedVersionId, setSelectedVersionId] = useState(approvedVersions[0]?.id || '');
  const [inputs, setInputs] = useState('{}');
  const [result, setResult] = useState<ReturnType<typeof evaluateRuleVersion> | null>(null);
  const [parseError, setParseError] = useState('');

  const selectedVersion = ruleVersions.find(rv => rv.id === selectedVersionId);

  const handleExecute = () => {
    if (!selectedVersion) return;
    setParseError('');
    try {
      const parsedInputs = JSON.parse(inputs);
      const evalResult = evaluateRuleVersion(selectedVersion, parsedInputs);
      setResult(evalResult);
      
      // Save validation run
      const evidence = store.create<Evidence>('evidence', tenantId, {
        validationRunId: '', ruleVersionId: selectedVersion.id, type: 'OUTPUT',
        content: JSON.stringify(evalResult), metadata: { inputs: JSON.stringify(parsedInputs) },
        createdAt: new Date().toISOString(), createdBy: userId, isDemo: false,
      });
      
      const run = store.create<ValidationRun>('validationRuns', tenantId, {
        ruleVersionId: selectedVersion.id, inputs: parsedInputs, result: evalResult.result,
        calculation: evalResult.calculation, evidenceRefs: [evidence.id],
        timestamp: evalResult.timestamp, executedBy: userId, isDemo: false,
      });
      
      // Link evidence to run
      store.update<Evidence>('evidence', tenantId, evidence.id, { validationRunId: run.id });
      
      recordAuditEvent(tenantId, 'EXECUTE', 'ValidationRun', run.id, userId, { result: evalResult.result, ruleVersionId: selectedVersion.id });
    } catch (err) {
      setParseError((err as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Test Console</h1>
        <p className="text-slate-400 text-sm">Ejecuta reglas APPROVED contra inputs JSON. Genera evidencia automáticamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Configuración</h3>
          <select value={selectedVersionId} onChange={e => setSelectedVersionId(e.target.value)} className="input-field mb-3">
            <option value="">Seleccionar Rule Version</option>
            {ruleVersions.map(rv => (
              <option key={rv.id} value={rv.id}>v{rv.version} [{rv.status}] — Rule {rv.ruleId.slice(0, 8)}</option>
            ))}
          </select>
          
          {selectedVersion && (
            <div className="mb-3 p-3 bg-slate-950 rounded border border-slate-800">
              <p className="text-xs text-slate-400 mb-1">Operadores:</p>
              {selectedVersion.operators.map((op, i) => (
                <span key={i} className="inline-block px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 font-mono mr-1 mb-1">
                  {op.operator}:{op.field}
                </span>
              ))}
              {selectedVersion.operators.length === 0 && <span className="text-xs text-slate-600">Sin operadores</span>}
            </div>
          )}

          <label className="text-xs text-slate-400 block mb-1">Inputs (JSON):</label>
          <textarea value={inputs} onChange={e => setInputs(e.target.value)} className="input-field font-mono text-xs" rows={6} placeholder='{"responseDays": 15}' />
          {parseError && <p className="text-xs text-red-400 mt-1">Error: {parseError}</p>}
          
          <button onClick={handleExecute} disabled={!selectedVersion} className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm flex items-center gap-2">
            <Play className="w-4 h-4" /> Ejecutar Validación
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Resultado</h3>
          {!result ? (
            <p className="text-xs text-slate-500">Ejecuta una validación para ver resultados.</p>
          ) : (
            <div>
              <div className={`p-3 rounded-lg mb-3 border ${result.result === 'PASS' ? 'bg-emerald-500/10 border-emerald-500/30' : result.result === 'FAIL' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className="flex items-center gap-2">
                  {result.result === 'PASS' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : result.result === 'FAIL' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
                  <span className={`text-lg font-bold ${result.result === 'PASS' ? 'text-emerald-400' : result.result === 'FAIL' ? 'text-red-400' : 'text-amber-400'}`}>{result.result}</span>
                </div>
              </div>
              <div className="space-y-2">
                {result.operatorResults.map((or, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${or.pass ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <div>
                      <span className="text-slate-300 font-mono">[{or.operator}:{or.field}]</span>
                      <p className="text-slate-400">{or.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800">
                <p className="text-[10px] text-slate-500">Rule Version: v{result.ruleVersionNumber} • {result.timestamp}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ APPROVALS VIEW ============
function ApprovalsView() {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId } = auth;

  const ruleVersions = store.list<RuleVersion>('ruleVersions', tenantId);
  const rules = store.list<Rule>('rules', tenantId);
  const pendingVersions = ruleVersions.filter(rv => rv.status === 'REVIEW');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Approval Queue</h1>
        <p className="text-slate-400 text-sm">Versiones en REVIEW pendientes de aprobación humana.</p>
      </div>

      {pendingVersions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <ClipboardCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay versiones pendientes de aprobación.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingVersions.map(rv => {
            const rule = rules.find(r => r.id === rv.ruleId);
            return (
              <div key={rv.id} className="bg-slate-900 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold">{rule?.name || rv.ruleId}</h3>
                    <p className="text-xs text-slate-400">v{rv.version} • {rv.rationale}</p>
                  </div>
                  <StatusBadge status="REVIEW" />
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {rv.operators.map((op, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">{op.operator}:{op.field}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Created by: {rv.createdBy} • {new Date(rv.createdAt).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ EVIDENCE VAULT ============
function EvidenceVaultView() {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId } = auth;

  const evidence = store.list<Evidence>('evidence', tenantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Evidence Vault</h1>
        <p className="text-slate-400 text-sm">Evidencia generada por ejecuciones de reglas.</p>
      </div>

      {evidence.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Sin evidencia. Ejecuta validaciones en el Test Console.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {evidence.map(ev => (
            <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[10px]">{ev.type}</span>
                {ev.isDemo && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px]">DEMO</span>}
                <span className="text-xs text-slate-500">{new Date(ev.createdAt).toLocaleString()}</span>
              </div>
              <pre className="text-xs text-slate-300 bg-slate-950 rounded p-2 overflow-x-auto max-h-32">{ev.content}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ AUDIT EXPLORER ============
function AuditExplorerView() {
  const auth = getCurrentAuth();
  if (!auth) return null;
  const { tenantId } = auth;

  const events = store.getAuditEvents(tenantId, 50);
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = filter === 'ALL' ? events : events.filter(e => e.action === filter);
  const actions = ['ALL', 'CREATE', 'EDIT', 'APPROVE', 'EXECUTE', 'RETIRE', 'REJECT', 'TEST', 'ROLLBACK'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Explorer</h1>
        <p className="text-slate-400 text-sm">Trail completo de acciones. Inmutable y trazable.</p>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {actions.map(a => (
          <button key={a} onClick={() => setFilter(a)} className={`px-2 py-1 rounded text-xs ${filter === a ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{a}</button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="text-left py-2 px-3">Timestamp</th>
              <th className="text-left py-2 px-3">Action</th>
              <th className="text-left py-2 px-3">Entity</th>
              <th className="text-left py-2 px-3">Actor</th>
              <th className="text-left py-2 px-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">Sin eventos.</td></tr>
            ) : filtered.map(evt => (
              <tr key={evt.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="py-2 px-3 text-slate-400 font-mono">{new Date(evt.timestamp).toLocaleString()}</td>
                <td className="py-2 px-3">
                  <span className={`px-1.5 py-0.5 rounded ${
                    evt.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400' :
                    evt.action === 'APPROVE' ? 'bg-indigo-500/10 text-indigo-400' :
                    evt.action === 'EXECUTE' ? 'bg-cyan-500/10 text-cyan-400' :
                    evt.action === 'EDIT' ? 'bg-amber-500/10 text-amber-400' :
                    evt.action === 'RETIRE' ? 'bg-red-500/10 text-red-400' :
                    'bg-slate-700 text-slate-300'
                  }`}>{evt.action}</span>
                </td>
                <td className="py-2 px-3 text-slate-300">{evt.entityType}</td>
                <td className="py-2 px-3 text-slate-400 font-mono">{evt.actorId.slice(0, 8)}</td>
                <td className="py-2 px-3 text-slate-500 max-w-48 truncate">{JSON.stringify(evt.details).slice(0, 60)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ STATIC VIEWS (preserved & enhanced) ============
function ArchitectureView() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Arquitectura del Sistema</h1>
        <p className="text-slate-400 text-sm">Arquitectura híbrida. Separación estricta de responsabilidades.</p>
      </div>
      <div className="bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 border border-indigo-500/20 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-400" /> Principio de Separación</h3>
        <div className="flex flex-wrap gap-2">
          {['CODE', 'CONFIG', 'SECRETS', 'CUSTOMER DATA', 'REGULATORY EVIDENCE'].map((item, i) => (
            <div key={item} className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono">{item}</span>
              {i < 4 && <span className="text-slate-600 font-bold">≠</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4">Diagrama de Capas</h3>
        <div className="space-y-4">
          <div className="border border-amber-500/30 rounded-lg p-4 bg-amber-500/5">
            <span className="text-xs font-semibold text-amber-400">GitHub — Gobernanza</span>
            <p className="text-xs text-slate-400 mt-1">Source Code, CI/CD, Secrets (Vault), SBOM, CODEOWNERS, Branch Protection</p>
          </div>
          <div className="border border-indigo-500/30 rounded-lg p-4 bg-indigo-500/5">
            <span className="text-xs font-semibold text-indigo-400">CI/CD — GitHub Actions</span>
            <p className="text-xs text-slate-400 mt-1">Lint → Type-Check → Tests → Security Scan → Build</p>
          </div>
          <div className="border border-cyan-500/30 rounded-lg p-4 bg-cyan-500/5">
            <span className="text-xs font-semibold text-cyan-400">Vercel — Frontend + BFF</span>
            <p className="text-xs text-slate-400 mt-1">Preview (por PR) → Staging → Production. Compatible con runtime serverless.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-emerald-500/30 rounded-lg p-4 bg-emerald-500/5">
              <span className="text-xs font-semibold text-emerald-400">Servicios Dedicados</span>
              <p className="text-xs text-slate-400 mt-1">Rule Engine, AI Orchestrator, Compliance Engine, Regulatory Ingestion</p>
            </div>
            <div className="border border-violet-500/30 rounded-lg p-4 bg-violet-500/5">
              <span className="text-xs font-semibold text-violet-400">Persistencia Administrada</span>
              <p className="text-xs text-slate-400 mt-1">PostgreSQL, Object Storage, Vector DB, Redis Queue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineView() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pipeline CI/CD</h1>
        <p className="text-slate-400 text-sm">De commit a producción con gates de calidad y seguridad.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {['Git Push', 'Lint', 'TypeCheck', 'Tests', 'Security', 'Build', 'Vercel Preview', 'Acceptance', 'Approval', 'Production'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs font-medium">{step}</span>
              {i < 9 && <ArrowRight className="w-3 h-3 text-slate-600" />}
            </div>
          ))}
        </div>
        <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre>{`# Criterio de Aceptación — Ninguna funcionalidad DONE sin:
code → GitHub → CI pass → security pass → build pass 
     → Vercel Preview → acceptance tests → approval → production

# Rollback:
- Application rollback: < 2 min (Vercel instant rollback)
- Rule rollback: Independent (RuleVersion status → RETIRED)
- Both versioned and reproducible via Git commit + rule version`}</pre>
        </div>
      </div>
    </div>
  );
}

function RepositoryView() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Repositorio & Gobernanza</h1>
        <p className="text-slate-400 text-sm">GitHub como fuente de verdad.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Branch Protection (main)</h3>
        <div className="grid grid-cols-2 gap-2">
          {['Require PR reviews', 'Min 2 reviewers', 'CI must pass', 'Security scan', 'No force push', 'Signed commits', 'Status checks', 'CODEOWNERS review'].map(rule => (
            <div key={rule} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {rule}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocsView() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Documentación</h1>
        <p className="text-slate-400 text-sm">ADRs, guías y criterios de aceptación.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Criterio de Aceptación</h3>
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {['Code', '→', 'GitHub', '→', 'CI Pass', '→', 'Security Pass', '→', 'Build Pass', '→', 'Vercel Preview', '→', 'Acceptance', '→', 'Approval', '→', 'Production'].map((s, i) => (
            s === '→' ? <ChevronRight key={i} className="w-3 h-3 text-slate-600" /> :
            <span key={i} className="px-2 py-1 bg-slate-800 rounded text-slate-300">{s}</span>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">ADRs Implementados</h3>
        <div className="space-y-2">
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-xs font-mono text-indigo-400">ADR-007</span>
            <span className="text-xs text-slate-300 ml-2">Rule Engine determinista sin eval()</span>
            <p className="text-xs text-slate-500 mt-1">Motor cerrado con 7 operadores. Formula DSL con parser propio. Solo APPROVED ejecuta.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-xs font-mono text-indigo-400">ADR-008</span>
            <span className="text-xs text-slate-300 ml-2">AI Copilot con HITL obligatorio</span>
            <p className="text-xs text-slate-500 mt-1">Provider interface desacoplado. Toda salida AI es GENERATED/DRAFT. Requiere revisión humana. Graceful degradation si no hay provider.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
