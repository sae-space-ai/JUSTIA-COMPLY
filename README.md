# JUSTIA COMPLY

> Plataforma enterprise de cumplimiento regulatorio con arquitectura híbrida, 
> motor de reglas determinista y gobernanza completa en GitHub.

## Estado del Proyecto

**Versión:** 1.0.0  
**Vertical Slice:** ✅ Implementado (Legal Source → Requirement → Rule → Test → Approval → Execution → Evidence → Audit)

## Arquitectura

```
GitHub (Source of Truth) → CI/CD (GitHub Actions) → Vercel (Frontend/BFF)
                                                         ↓
                                              Servicios Dedicados
                                              (Rule Engine, AI, etc.)
                                                         ↓
                                              Persistencia Administrada
                                              (PostgreSQL, Object Storage)
```

### Principios

- **CODE ≠ CONFIG ≠ SECRETS ≠ DATA** — Separación estricta
- **GitHub First** — Todo versionado, nada fuera del repo
- **Vercel Compatible** — Frontend/BFF en Vercel, servicios pesados fuera
- **Compliance-by-Design** — Audit trail, rollback, trazabilidad

## Setup Local

```bash
# Clonar repositorio
git clone <repo-url>
cd justia-comply

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env — NO incluir secrets reales

# Desarrollo
npm run dev

# Build producción
npm run build

# Tests
npx vitest run

# Type check
npm run typecheck
```

## Variables de Entorno

Ver `.env.example` para la lista completa. Las críticas son:

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `VITE_AI_PROVIDER` | No | Provider de AI (vacío = graceful degradation) |
| `VITE_AI_API_KEY` | No | API key del provider (nunca commitear) |
| `VERCEL_TOKEN` | CI only | Token de Vercel para deployments |
| `VERCEL_ORG_ID` | CI only | Organization ID de Vercel |
| `VERCEL_PROJECT_ID` | CI only | Project ID de Vercel |

## Estructura del Proyecto

```
src/
├── core/
│   ├── types.ts          # Modelos de dominio
│   └── rule-engine.ts    # Motor de reglas determinista
├── services/
│   ├── store.ts          # Persistencia (localStorage demo)
│   ├── auth.ts           # RBAC + tenant isolation
│   └── copilot.ts        # AI Copilot interface
├── tests/
│   ├── rule-engine.test.ts
│   ├── auth.test.ts
│   └── e2e-vertical-slice.test.ts
├── App.tsx               # Aplicación principal
├── main.tsx
└── index.css
```

## Rule Engine

Motor determinista con 7 operadores cerrados:

| Operador | Descripción |
|----------|-------------|
| `required` | Campo debe existir y no estar vacío |
| `type` | Campo debe ser de tipo específico |
| `range` | Valor numérico dentro de [min, max] |
| `threshold` | Comparación numérica (gt, gte, lt, lte, eq, neq) |
| `equality` | Campo igual a valor específico |
| `enum` | Campo dentro de valores permitidos |
| `formula` | DSL aritmético restringido (NO eval) |

### Reglas de Ejecución

- Solo RuleVersions con status `APPROVED` pueden ejecutarse oficialmente
- DRAFT/REVIEW → resultado `REVIEW` (no oficial)
- RETIRED → no ejecutable
- Cada ejecución genera evidencia y audit event

## AI Copilot

Provider interface desacoplado con Human-in-the-Loop obligatorio:

- **Puede:** Proponer extracción de requisitos, borradores de reglas, mappings, explicaciones
- **NO puede:** Aprobar reglas, decidir cumplimiento legal, publicar
- **Toda salida:** Clasificada como `GENERATED`/`DRAFT`, requiere revisión humana
- **Sin provider:** Graceful degradation (sin respuestas simuladas)

## RBAC

| Rol | Permisos |
|-----|----------|
| `ADMIN` | Todo acceso |
| `LEGAL_EXPERT` | Crear/editar fuentes, requisitos, reglas |
| `COMPLIANCE_OFFICER` | Aprobar reglas, ejecutar validaciones, gestionar evidencia |
| `AUDITOR` | Solo lectura de todo |

## Deployment

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

### GitHub Actions

Configurado en `.github/workflows/ci-cd.yml`:
- PR → Quality Gate → Security Gate → Vercel Preview
- Push a main → Quality Gate → Security Gate → Vercel Production

## Tests

```bash
# Ejecutar todos los tests
npx vitest run

# Tests del Rule Engine
npx vitest run src/tests/rule-engine.test.ts

# Tests de permisos
npx vitest run src/tests/auth.test.ts

# E2E vertical slice
npx vitest run src/tests/e2e-vertical-slice.test.ts
```

## Funcionalidades Implementadas

### ✅ Completas (UI → Lógica → Persistencia → Audit)

- [x] Legal Sources CRUD
- [x] Requirements CRUD con provenance a Legal Source
- [x] Rules CRUD con auto-creación de RuleVersion
- [x] Rule Catalogue con version history
- [x] Rule Version editing (operadores, rationale)
- [x] Status transitions (DRAFT → REVIEW → APPROVED → RETIRED)
- [x] Rule Engine determinista (7 operadores)
- [x] Test Console (ejecución de reglas)
- [x] Evidence generation automática
- [x] Audit trail completo
- [x] RBAC con 4 roles
- [x] Tenant isolation
- [x] AI Copilot interface (graceful degradation)
- [x] Dashboard con datos reales
- [x] Demo data claramente marcada

### ⏳ Pendientes (requieren backend real)

- [ ] Persistencia en PostgreSQL (actualmente localStorage)
- [ ] API REST real (actualmente servicios en cliente)
- [ ] Autenticación server-side (actualmente simulada)
- [ ] AI Provider real (OpenAI, etc.)
- [ ] Object storage para evidencia grande
- [ ] Rate limiting server-side
- [ ] Webhooks de GitHub para sync
- [ ] Regulatory ingestion workers
- [ ] Vector DB para knowledge graph

## Riesgos y Bloqueos

1. **Persistencia:** localStorage no es adecuado para producción. Requiere migración a PostgreSQL.
2. **Auth:** La autenticación actual es simulada. Requiere implementación server-side.
3. **AI:** Sin provider configurado, las funciones de AI no están disponibles.
4. **Escala:** El Rule Engine corre en cliente. Para reglas complejas, mover a servicio dedicado.

## Siguiente Vertical Slice Recomendado

**Regulatory Ingestion & Change Detection:**
1. Ingesta automática de fuentes regulatorias (RSS, APIs oficiales)
2. Detección de cambios vs versión anterior
3. Impact analysis (qué reglas/requisitos afectados)
4. Notificaciones a stakeholders
5. Workflow de actualización de reglas

## Licencia

Ver LICENSE.

## Documentación Adicional

- [ADR-007: Rule Engine Determinista](docs/adr-007-rule-engine.md)
- [ADR-008: AI Copilot con HITL](docs/adr-008-ai-copilot.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
