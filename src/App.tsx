import { useState } from 'react';
import { 
  Shield, GitBranch, Cloud, Server, Database, Code2, 
  CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Github, Lock, Eye, Zap, FileText, Settings,
  Layers, GitPullRequest, GitCommit, Rocket,
  BarChart3, Activity, Users, Globe, ChevronRight,
  Terminal, Package, BookOpen, Workflow, CircleDot
} from 'lucide-react';

type View = 'landing' | 'dashboard' | 'architecture' | 'pipeline' | 'repository' | 'docs';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {currentView === 'landing' ? (
        <LandingView onNavigate={setCurrentView} />
      ) : (
        <PlatformLayout currentView={currentView} onNavigate={setCurrentView}>
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'architecture' && <ArchitectureView />}
          {currentView === 'pipeline' && <PipelineView />}
          {currentView === 'repository' && <RepositoryView />}
          {currentView === 'docs' && <DocsView />}
        </PlatformLayout>
      )}
    </div>
  );
}

// ============ LANDING PAGE ============
function LandingView({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
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
          <button 
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
          >
            Acceder al Portal
          </button>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
            <CircleDot className="w-4 h-4" />
            <span>Compliance-by-Design • v1.0.0</span>
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
          
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Plataforma enterprise de compliance con arquitectura híbrida. 
            GitHub como fuente de verdad del software. Vercel como target de despliegue. 
            Separación estricta de código, configuración, secretos y datos regulatorios.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-base font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Acceder al Dashboard
            </button>
            <button 
              onClick={() => onNavigate('architecture')}
              className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Ver Arquitectura
            </button>
          </div>

          {/* Key Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PrincipleCard 
              icon={<Github className="w-6 h-6" />}
              title="GitHub First"
              description="Fuente de verdad del software. CI/CD, versionado, gobernanza técnica y CODEOWNERS."
            />
            <PrincipleCard 
              icon={<Cloud className="w-6 h-6" />}
              title="Vercel Deploy"
              description="Preview deployments por PR. Separación frontend/backend. Runtime compatible."
            />
            <PrincipleCard 
              icon={<Lock className="w-6 h-6" />}
              title="Compliance-by-Design"
              description="CODE ≠ CONFIG ≠ SECRETS ≠ DATA. Trazabilidad completa y rollback controlado."
            />
          </div>
        </div>
      </header>

      {/* Architecture Preview */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Arquitectura Híbrida</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Separación de responsabilidades: Vercel para experiencia de usuario, servicios especializados para procesamiento pesado, persistencia administrada para datos.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <ArchLayer 
              color="indigo"
              icon={<Globe className="w-5 h-5" />}
              title="Vercel"
              items={['Frontend / Portal', 'Admin Dashboard', 'BFF / API Routes', 'Preview Deploys']}
            />
            <ArchLayer 
              color="cyan"
              icon={<Server className="w-5 h-5" />}
              title="Servicios"
              items={['Rule Engine', 'AI Orchestrator', 'Compliance Engine', 'Regulatory Ingestion']}
            />
            <ArchLayer 
              color="emerald"
              icon={<Database className="w-5 h-5" />}
              title="Persistencia"
              items={['PostgreSQL', 'Object Storage', 'Vector Store', 'Message Queue']}
            />
            <ArchLayer 
              color="amber"
              icon={<GitBranch className="w-5 h-5" />}
              title="GitHub"
              items={['Source Code', 'CI/CD Pipelines', 'Secret Management', 'SBOM & Scanning']}
            />
          </div>
        </div>
      </section>

      {/* Pipeline Preview */}
      <section className="py-20 px-6 bg-slate-900/50 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Pipeline de Despliegue</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Cada cambio pasa por gates de calidad, seguridad y aceptación antes de llegar a producción.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Git Push', 'Lint & Type-Check', 'Tests', 'Security Scan', 'Build', 'Vercel Preview', 'Acceptance', 'Approval', 'Production'].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${i < 5 ? 'bg-emerald-400' : i < 7 ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                  {step}
                </div>
                {i < 8 && <ArrowRight className="w-4 h-4 text-slate-600" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800/50 text-center">
        <p className="text-slate-500 text-sm">
          JUSTIA COMPLY v1.0.0 • Compliance-by-Design • GitHub → CI → Vercel → Production
        </p>
      </footer>
    </div>
  );
}

function PrincipleCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
        {icon}
      </div>
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
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} className="text-sm text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============ PLATFORM LAYOUT ============
function PlatformLayout({ currentView, onNavigate, children }: { currentView: View; onNavigate: (v: View) => void; children: React.ReactNode }) {
  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'architecture', label: 'Arquitectura', icon: <Layers className="w-5 h-5" /> },
    { id: 'pipeline', label: 'Pipeline CI/CD', icon: <Workflow className="w-5 h-5" /> },
    { id: 'repository', label: 'Repositorio', icon: <Github className="w-5 h-5" /> },
    { id: 'docs', label: 'Documentación', icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold">JUSTIA COMPLY</span>
              <p className="text-xs text-slate-500">v1.0.0</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                currentView === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => onNavigate('landing')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Portal Público
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

// ============ DASHBOARD ============
function DashboardView() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Cumplimiento</h1>
        <p className="text-slate-400">Estado general de la plataforma y métricas de compliance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Reglas Activas" value="147" change="+12 esta semana" color="emerald" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Alertas Abiertas" value="3" change="-2 vs ayer" color="amber" />
        <StatCard icon={<GitPullRequest className="w-5 h-5" />} label="PRs Pendientes" value="7" change="2 requieren review" color="indigo" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="Uptime Pipeline" value="99.8%" change="últimos 30 días" color="cyan" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-indigo-400" />
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            <ActivityItem 
              type="deploy" 
              message="Deploy production v1.0.0-rc.3" 
              time="hace 12 min"
              status="success"
            />
            <ActivityItem 
              type="pr" 
              message="PR #142: Actualizar reglas GDPR Art. 17" 
              time="hace 45 min"
              status="review"
            />
            <ActivityItem 
              type="scan" 
              message="Security scan completado - 0 vulnerabilidades" 
              time="hace 1h"
              status="success"
            />
            <ActivityItem 
              type="rule" 
              message="Rule Engine v2.4.1 desplegado" 
              time="hace 2h"
              status="success"
            />
            <ActivityItem 
              type="alert" 
              message="Alerta: Cambio regulatorio detectado - MiFID II" 
              time="hace 3h"
              status="warning"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Estado de Compliance
          </h3>
          <div className="space-y-4">
            <ComplianceBar label="GDPR" percentage={94} color="emerald" />
            <ComplianceBar label="MiFID II" percentage={87} color="indigo" />
            <ComplianceBar label="SOX" percentage={98} color="cyan" />
            <ComplianceBar label="Basel III" percentage={76} color="amber" />
            <ComplianceBar label="AML/CFT" percentage={91} color="emerald" />
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Score Global de Cumplimiento</span>
              <span className="text-emerald-400 font-bold text-lg">91.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Status */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-cyan-400" />
          Deployments Recientes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="text-left py-3 px-2">Ambiente</th>
                <th className="text-left py-3 px-2">Versión</th>
                <th className="text-left py-3 px-2">Commit</th>
                <th className="text-left py-3 px-2">Reglas</th>
                <th className="text-left py-3 px-2">Estado</th>
                <th className="text-left py-3 px-2">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-2"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-medium">Production</span></td>
                <td className="py-3 px-2 font-mono text-xs">v1.0.0-rc.3</td>
                <td className="py-3 px-2 font-mono text-xs text-slate-400">a3f8c2d</td>
                <td className="py-3 px-2 font-mono text-xs text-slate-400">rules@2.4.1</td>
                <td className="py-3 px-2"><span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span></td>
                <td className="py-3 px-2 text-slate-400">hace 12 min</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-2"><span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium">Preview</span></td>
                <td className="py-3 px-2 font-mono text-xs">pr-142-feat</td>
                <td className="py-3 px-2 font-mono text-xs text-slate-400">b7e1f4a</td>
                <td className="py-3 px-2 font-mono text-xs text-slate-400">rules@2.4.2-beta</td>
                <td className="py-3 px-2"><span className="flex items-center gap-1 text-amber-400"><Clock className="w-3.5 h-3.5" /> Building</span></td>
                <td className="py-3 px-2 text-slate-400">hace 3 min</td>
              </tr>
              <tr>
                <td className="py-3 px-2"><span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs font-medium">Staging</span></td>
                <td className="py-3 px-2 font-mono text-xs">v1.0.0-rc.2</td>
                <td className="py-3 px-2 font-mono text-xs text-slate-400">c9d2e5f</td>
                <td className="py-3 px-2 font-mono text-xs text-slate-400">rules@2.4.0</td>
                <td className="py-3 px-2"><span className="flex items-center gap-1 text-slate-400"><Eye className="w-3.5 h-3.5" /> Idle</span></td>
                <td className="py-3 px-2 text-slate-400">hace 1h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, color }: { icon: React.ReactNode; label: string; value: string; change: string; color: string }) {
  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    indigo: 'text-indigo-400 bg-indigo-500/10',
    cyan: 'text-cyan-400 bg-cyan-500/10',
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
      <p className="text-xs text-slate-500 mt-2">{change}</p>
    </div>
  );
}

function ActivityItem({ type, message, time, status }: { type: string; message: string; time: string; status: string }) {
  const statusColors: Record<string, string> = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    review: 'bg-indigo-400',
  };
  const typeIcons: Record<string, React.ReactNode> = {
    deploy: <Rocket className="w-4 h-4" />,
    pr: <GitPullRequest className="w-4 h-4" />,
    scan: <Lock className="w-4 h-4" />,
    rule: <Zap className="w-4 h-4" />,
    alert: <AlertTriangle className="w-4 h-4" />,
  };
  
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0`}>
        {typeIcons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{message}</p>
        <p className="text-xs text-slate-500 mt-0.5">{time}</p>
      </div>
      <span className={`w-2 h-2 rounded-full mt-2 ${statusColors[status]}`} />
    </div>
  );
}

function ComplianceBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    cyan: 'bg-cyan-500',
    amber: 'bg-amber-500',
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{percentage}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClasses[color]} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// ============ ARCHITECTURE VIEW ============
function ArchitectureView() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Arquitectura del Sistema</h1>
        <p className="text-slate-400">Arquitectura híbrida diseñada para separar responsabilidades y escalar independientemente.</p>
      </div>

      {/* Separation Principle */}
      <div className="bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 border border-indigo-500/20 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          Principio de Separación Estricta
        </h3>
        <div className="flex flex-wrap gap-3">
          {['CODE', 'CONFIG', 'SECRETS', 'CUSTOMER DATA', 'REGULATORY EVIDENCE'].map((item, i) => (
            <div key={item} className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-mono font-medium">{item}</span>
              {i < 4 && <span className="text-slate-600 font-bold">≠</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8">
        <h3 className="text-lg font-semibold mb-6">Diagrama de Arquitectura</h3>
        
        <div className="space-y-6">
          {/* Layer 1: GitHub */}
          <div className="border border-amber-500/30 rounded-xl p-5 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Github className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-amber-400">Capa de Gobernanza — GitHub</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Source Code', 'CI/CD Config', 'Secrets (Vault)', 'SBOM', 'CODEOWNERS', 'Branch Protection', 'PR Reviews', 'Dependency Scanning'].map(item => (
                <div key={item} className="px-3 py-2 bg-slate-900/50 rounded-lg text-xs text-slate-300 border border-slate-700/50">{item}</div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center text-slate-600">
              <div className="w-px h-4 bg-slate-700" />
              <span className="text-xs">trigger</span>
              <div className="w-px h-4 bg-slate-700" />
            </div>
          </div>

          {/* Layer 2: CI/CD */}
          <div className="border border-indigo-500/30 rounded-xl p-5 bg-indigo-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Workflow className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-indigo-400">Capa CI/CD — GitHub Actions</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {['Lint', 'Type-Check', 'Unit Tests', 'Security Scan', 'Build'].map(item => (
                <div key={item} className="px-3 py-2 bg-slate-900/50 rounded-lg text-xs text-slate-300 border border-slate-700/50 text-center">{item}</div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center text-slate-600">
              <div className="w-px h-4 bg-slate-700" />
              <span className="text-xs">deploy</span>
              <div className="w-px h-4 bg-slate-700" />
            </div>
          </div>

          {/* Layer 3: Vercel */}
          <div className="border border-cyan-500/30 rounded-xl p-5 bg-cyan-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold text-cyan-400">Capa de Despliegue — Vercel</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="px-3 py-2 bg-slate-900/50 rounded-lg text-xs text-slate-300 border border-slate-700/50">
                <span className="text-cyan-400 font-medium">Preview</span> — Por cada PR
              </div>
              <div className="px-3 py-2 bg-slate-900/50 rounded-lg text-xs text-slate-300 border border-slate-700/50">
                <span className="text-cyan-400 font-medium">Staging</span> — Pre-producción
              </div>
              <div className="px-3 py-2 bg-slate-900/50 rounded-lg text-xs text-slate-300 border border-slate-700/50">
                <span className="text-cyan-400 font-medium">Production</span> — Merge a main
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center text-slate-600">
              <div className="w-px h-4 bg-slate-700" />
              <span className="text-xs">API calls</span>
              <div className="w-px h-4 bg-slate-700" />
            </div>
          </div>

          {/* Layer 4: Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-emerald-500/30 rounded-xl p-5 bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Servicios Especializados</span>
              </div>
              <div className="space-y-2">
                {['Rule Engine (Dedicated)', 'AI Orchestrator (Async)', 'Compliance Engine', 'Regulatory Ingestion Worker'].map(item => (
                  <div key={item} className="px-3 py-2 bg-slate-900/50 rounded-lg text-xs text-slate-300 border border-slate-700/50">{item}</div>
                ))}
              </div>
            </div>
            <div className="border border-violet-500/30 rounded-xl p-5 bg-violet-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-violet-400" />
                <span className="font-semibold text-violet-400">Persistencia Administrada</span>
              </div>
              <div className="space-y-2">
                {['PostgreSQL (Config + Metadata)', 'Object Storage (Evidence)', 'Vector DB (Knowledge Graph)', 'Redis Queue (Async Jobs)'].map(item => (
                  <div key={item} className="px-3 py-2 bg-slate-900/50 rounded-lg text-xs text-slate-300 border border-slate-700/50">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monorepo Structure */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-400" />
          Estructura del Monorepo
        </h3>
        <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
          <pre>{`justia-comply/
├── apps/
│   ├── web/                    # Frontend principal (Vercel)
│   ├── admin/                  # Panel administrativo
│   └── authority/              # Portal de autoridad regulatoria
├── services/
│   ├── compliance-engine/      # Motor de evaluación de compliance
│   ├── rule-engine/            # Ejecución de reglas (dedicated)
│   ├── ai-orchestrator/        # Orquestación de agentes IA
│   └── regulatory-ingestion/   # Ingesta de cambios regulatorios
├── packages/
│   ├── ui/                     # Componentes compartidos
│   ├── schemas/                # Schemas de validación
│   ├── rules-sdk/              # SDK para definición de reglas
│   ├── security/               # Utilidades de seguridad
│   ├── observability/          # Logging, metrics, tracing
│   └── api-client/             # Cliente API tipado
├── rules/                      # Definiciones de reglas versionadas
├── docs/                       # Documentación (ADRs, guides)
├── infra/                      # Infraestructura como código
├── tests/                      # Tests E2E e integración
└── .github/                    # Workflows, templates, CODEOWNERS`}</pre>
        </div>
      </div>
    </div>
  );
}

// ============ PIPELINE VIEW ============
function PipelineView() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pipeline CI/CD</h1>
        <p className="text-slate-400">Flujo completo desde commit hasta producción con gates de calidad y seguridad.</p>
      </div>

      {/* Pipeline Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-6">Flujo de Despliegue</h3>
        
        <div className="space-y-4">
          <PipelineStage 
            number={1}
            title="Commit & Push"
            description="Desarrollador push a rama de trabajo. No se permiten commits directos a main."
            status="active"
            checks={['Branch naming convention', 'Signed commits (GPG)', 'Commit message lint']}
            icon={<GitCommit className="w-5 h-5" />}
          />
          <PipelineStage 
            number={2}
            title="CI Gate — Quality"
            description="Validación automática de calidad del código."
            status="active"
            checks={['ESLint / Prettier', 'TypeScript type-check', 'Unit tests (>80% coverage)', 'Integration tests']}
            icon={<Code2 className="w-5 h-5" />}
          />
          <PipelineStage 
            number={3}
            title="CI Gate — Security"
            description="Escaneo de seguridad y cumplimiento de políticas."
            status="active"
            checks={['Dependency vulnerability scan', 'Secret detection', 'SBOM generation', 'License compliance']}
            icon={<Lock className="w-5 h-5" />}
          />
          <PipelineStage 
            number={4}
            title="Build & Preview"
            description="Build de producción y despliegue automático a Vercel Preview."
            status="active"
            checks={['Production build', 'Bundle analysis', 'Vercel Preview URL generado', 'Lighthouse CI']}
            icon={<Rocket className="w-5 h-5" />}
          />
          <PipelineStage 
            number={5}
            title="Acceptance & Review"
            description="QA y revisión manual del preview deployment."
            status="pending"
            checks={['Acceptance tests automáticos', 'Visual regression', 'Code review (2 approvals)', 'Regla versionada verificada']}
            icon={<Eye className="w-5 h-5" />}
          />
          <PipelineStage 
            number={6}
            title="Merge & Production"
            description="Merge a main con deployment automático a producción."
            status="pending"
            checks={['Merge commit registrado', 'Vercel Production deploy', 'Health check post-deploy', 'Rollback plan verificado']}
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* GitHub Actions Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          GitHub Actions — Workflow Principal
        </h3>
        <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
          <pre>{`# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test -- --coverage
      
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: actions/dependency-review-action@v4
      - run: npm run sbom:generate
      
  build:
    needs: [quality, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      
  deploy-preview:
    needs: [build]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          scope: \${{ secrets.VERCEL_TEAM_ID }}
          
  deploy-production:
    needs: [build]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'`}</pre>
        </div>
      </div>

      {/* Branch Strategy */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          Estrategia de Ramas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="font-mono text-sm font-medium">main</span>
            </div>
            <p className="text-xs text-slate-400">Producción. Protegida. Solo merge via PR aprobado. Deploy automático a Vercel Production.</p>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-indigo-400" />
              <span className="font-mono text-sm font-medium">develop</span>
            </div>
            <p className="text-xs text-slate-400">Integración continua. Merge de feature branches. Deploy a staging.</p>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="font-mono text-sm font-medium">feature/*</span>
            </div>
            <p className="text-xs text-slate-400">Ramas de trabajo. Generan Preview Deployments en Vercel al crear PR.</p>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="font-mono text-sm font-medium">hotfix/*</span>
            </div>
            <p className="text-xs text-slate-400">Correcciones urgentes. Merge directo a main con review acelerado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineStage({ number, title, description, status, checks, icon }: { 
  number: number; title: string; description: string; status: string; checks: string[]; icon: React.ReactNode 
}) {
  return (
    <div className={`flex gap-4 p-4 rounded-xl border ${status === 'active' ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/50'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${status === 'active' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-slate-500 font-mono">#{number}</span>
          <h4 className="font-semibold text-sm">{title}</h4>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs ${status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
            {status === 'active' ? 'Activo' : 'Pendiente'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-2">{description}</p>
        <div className="flex flex-wrap gap-2">
          {checks.map(check => (
            <span key={check} className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-300 border border-slate-700/50">
              {check}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ REPOSITORY VIEW ============
function RepositoryView() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Repositorio & Gobernanza</h1>
        <p className="text-slate-400">GitHub como fuente de verdad del software. Gobernanza técnica y compliance del código.</p>
      </div>

      {/* Repository Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Github className="w-5 h-5" />
              justia-comply/justia-comply
            </h3>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">Public</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Plataforma enterprise de cumplimiento regulatorio con arquitectura híbrida, 
            deployment en Vercel y gobernanza completa en GitHub.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['TypeScript', 'React', 'Vercel', 'GitHub Actions', 'Tailwind CSS'].map(tag => (
              <span key={tag} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">{tag}</span>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div className="text-center">
              <p className="text-lg font-bold">147</p>
              <p className="text-xs text-slate-400">Commits</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">23</p>
              <p className="text-xs text-slate-400">Branches</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">8</p>
              <p className="text-xs text-slate-400">Releases</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">12</p>
              <p className="text-xs text-slate-400">Contributors</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Protección de Ramas</h3>
          <div className="space-y-3">
            <ProtectionRule label="Require PR reviews" enabled />
            <ProtectionRule label="Minimum 2 reviewers" enabled />
            <ProtectionRule label="CI must pass" enabled />
            <ProtectionRule label="Security scan pass" enabled />
            <ProtectionRule label="No force push" enabled />
            <ProtectionRule label="Signed commits" enabled />
            <ProtectionRule label="Status checks required" enabled />
            <ProtectionRule label="CODEOWNERS review" enabled />
          </div>
        </div>
      </div>

      {/* CODEOWNERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          CODEOWNERS
        </h3>
        <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
          <pre>{`# Global owners
*                           @justia-comply/core-team

# Apps
/apps/web                   @justia-comply/frontend-team
/apps/admin                 @justia-comply/frontend-team
/apps/authority             @justia-comply/frontend-team @justia-comply/legal-team

# Services
/services/compliance-engine @justia-comply/backend-team @justia-comply/core-team
/services/rule-engine       @justia-comply/backend-team @justia-comply/legal-team
/services/ai-orchestrator   @justia-comply/ai-team
/services/regulatory-ingestion @justia-comply/backend-team @justia-comply/legal-team

# Rules
/rules                      @justia-comply/legal-team @justia-comply/core-team

# Infrastructure
/infra                      @justia-comply/devops-team
/.github                    @justia-comply/core-team @justia-comply/devops-team

# Security
/packages/security          @justia-comply/security-team`}</pre>
        </div>
      </div>

      {/* Required Files */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Archivos Requeridos del Repositorio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { file: 'README.md', desc: 'Descripción, setup, arquitectura' },
            { file: 'CONTRIBUTING.md', desc: 'Guía para contribuidores' },
            { file: 'SECURITY.md', desc: 'Política de seguridad y reporte de vulnerabilidades' },
            { file: 'LICENSE', desc: 'Licencia del proyecto' },
            { file: 'CODEOWNERS', desc: 'Responsables por directorio' },
            { file: 'CHANGELOG.md', desc: 'Historial de cambios versionado' },
            { file: '.env.example', desc: 'Variables de entorno (sin secretos)' },
            { file: 'docs/ADRs/', desc: 'Architecture Decision Records' },
            { file: 'docs/api/', desc: 'Documentación de APIs' },
            { file: 'docs/runbooks/', desc: 'Procedimientos operativos' },
          ].map(item => (
            <div key={item.file} className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-sm font-mono">{item.file}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProtectionRule({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={`w-5 h-5 rounded flex items-center justify-center ${enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
        {enabled && <CheckCircle2 className="w-3.5 h-3.5" />}
      </span>
    </div>
  );
}

// ============ DOCS VIEW ============
function DocsView() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documentación</h1>
        <p className="text-slate-400">Arquitectura, decisiones técnicas y guías de la plataforma.</p>
      </div>

      {/* ADRs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Architecture Decision Records (ADRs)
        </h3>
        <div className="space-y-3">
          <ADRItem 
            id="001" 
            title="Monorepo con estructura por capas" 
            status="accepted" 
            date="2024-01-15"
            summary="Se adopta monorepo con separación apps/services/packages para mantener coherencia y permitir deployment independiente."
          />
          <ADRItem 
            id="002" 
            title="Vercel como target de despliegue web" 
            status="accepted" 
            date="2024-01-15"
            summary="Vercel para frontend y BFF. Servicios pesados fuera de Vercel en infraestructura dedicada."
          />
          <ADRItem 
            id="003" 
            title="GitHub como fuente de verdad" 
            status="accepted" 
            date="2024-01-15"
            summary="Todo el software, configuración y gobernanza vive en GitHub. No se permiten configuraciones fuera del repositorio."
          />
          <ADRItem 
            id="004" 
            title="Separación estricta CODE ≠ CONFIG ≠ SECRETS ≠ DATA" 
            status="accepted" 
            date="2024-01-16"
            summary="Principio fundamental de compliance-by-design. Cada categoría tiene su propio mecanismo de gestión y auditoría."
          />
          <ADRItem 
            id="005" 
            title="Rule Engine como servicio dedicado" 
            status="accepted" 
            date="2024-01-18"
            summary="El motor de reglas no corre en Vercel. Requiere procesamiento dedicado, estado y capacidad de rollback independiente."
          />
          <ADRItem 
            id="006" 
            title="Preview deployments obligatorios por PR" 
            status="accepted" 
            date="2024-01-20"
            summary="Cada PR genera un preview en Vercel verificable antes de merge. Aceptación visual y funcional requerida."
          />
        </div>
      </div>

      {/* Compliance Criteria */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Criterio de Aceptación de Funcionalidad
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Ninguna funcionalidad se considera terminada hasta completar el siguiente pipeline:
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'Code', color: 'bg-slate-700' },
            { label: '→', color: '' },
            { label: 'GitHub', color: 'bg-amber-500/20 text-amber-400' },
            { label: '→', color: '' },
            { label: 'CI Pass', color: 'bg-indigo-500/20 text-indigo-400' },
            { label: '→', color: '' },
            { label: 'Security Pass', color: 'bg-red-500/20 text-red-400' },
            { label: '→', color: '' },
            { label: 'Build Pass', color: 'bg-cyan-500/20 text-cyan-400' },
            { label: '→', color: '' },
            { label: 'Vercel Preview', color: 'bg-violet-500/20 text-violet-400' },
            { label: '→', color: '' },
            { label: 'Acceptance Tests', color: 'bg-emerald-500/20 text-emerald-400' },
            { label: '→', color: '' },
            { label: 'Approval', color: 'bg-emerald-500/20 text-emerald-400' },
            { label: '→', color: '' },
            { label: 'Production', color: 'bg-emerald-600/30 text-emerald-300' },
          ].map((item, i) => (
            item.color ? (
              <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${item.color}`}>{item.label}</span>
            ) : (
              <ChevronRight key={i} className="w-4 h-4 text-slate-600" />
            )
          ))}
        </div>
      </div>

      {/* Deployment Requirements */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Requisitos de Deployment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <h4 className="font-medium text-sm mb-2 text-emerald-400">Reproducibilidad</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Cada deploy registra commit Git exacto</li>
              <li>• Versión de reglas asociada al deployment</li>
              <li>• Schema versionado por release</li>
              <li>• Lock files comprometidos</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <h4 className="font-medium text-sm mb-2 text-amber-400">Trazabilidad</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Commit → Build → Deploy → Runtime</li>
              <li>• Cada ejecución registra versión de reglas</li>
              <li>• Audit log de cambios regulatorios</li>
              <li>• Correlación ID end-to-end</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <h4 className="font-medium text-sm mb-2 text-indigo-400">Reversibilidad</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Rollback de aplicación en &lt;2 min</li>
              <li>• Rollback de reglas independiente</li>
              <li>• Versionado semántico estricto</li>
              <li>• Deploy anterior siempre disponible</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <h4 className="font-medium text-sm mb-2 text-cyan-400">Seguridad</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Zero secrets en código</li>
              <li>• Environment variables via Vercel/GitHub</li>
              <li>• SBOM generado en cada build</li>
              <li>• Dependency scanning automático</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ADRItem({ id, title, status, date, summary }: { id: string; title: string; status: string; date: string; summary: string }) {
  return (
    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs font-mono">ADR-{id}</span>
          <h4 className="text-sm font-medium">{title}</h4>
        </div>
        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs">{status}</span>
      </div>
      <p className="text-xs text-slate-400 mb-2">{summary}</p>
      <p className="text-xs text-slate-600">{date}</p>
    </div>
  );
}
