# Security Policy

## Supported Versions
| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |

## Reporting a Vulnerability
**NO crear issues públicos para vulnerabilidades.**

Enviar reporte a: security@justia-comply.example (reemplazar con email real)

Incluir:
- Descripción de la vulnerabilidad
- Pasos para reproducir
- Impacto potencial
- Posibles mitigaciones

Respuesta esperada: 48 horas

## Security Controls Implemented

### Code Security
- ✅ TypeScript strict mode
- ✅ No eval() or arbitrary execution
- ✅ Input validation on all operators
- ✅ Formula DSL with restricted parser
- ✅ Dependency scanning in CI

### Authentication & Authorization
- ✅ RBAC with 4 roles (ADMIN, LEGAL_EXPERT, COMPLIANCE_OFFICER, AUDITOR)
- ✅ Tenant isolation at data layer
- ✅ Permission checks before operations
- ✅ Session management (TODO: server-side)

### Data Protection
- ✅ Separation: CODE ≠ CONFIG ≠ SECRETS ≠ DATA
- ✅ No secrets in source code
- ✅ Environment variables for sensitive config
- ✅ Audit trail for all critical operations
- ✅ Demo data clearly marked

### Infrastructure
- ✅ GitHub branch protection
- ✅ Required code reviews
- ✅ CI/CD security gates
- ✅ Vercel preview deployments
- ✅ Signed commits required

### AI/ML Security
- ✅ AI outputs classified as GENERATED/DRAFT
- ✅ Human-in-the-loop mandatory
- ✅ AI cannot approve or publish rules
- ✅ Provider interface (no vendor lock-in)
- ✅ Graceful degradation without AI

## Known Limitations (TODO)
- ⚠️ Auth is client-side (needs server-side implementation)
- ⚠️ Persistence is localStorage (needs PostgreSQL)
- ⚠️ Rate limiting not implemented server-side
- ⚠️ No encryption at rest for localStorage data

## Security Checklist for PRs
- [ ] No secrets in code
- [ ] Input validation added
- [ ] Audit events recorded
- [ ] RBAC permissions checked
- [ ] No eval() or arbitrary execution
- [ ] Dependencies audited
- [ ] Tests pass
