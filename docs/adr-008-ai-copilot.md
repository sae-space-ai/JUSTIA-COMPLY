# ADR-008: AI Copilot con Human-in-the-Loop Obligatorio

## Status
Accepted

## Context
Queremos asistir a usuarios en tareas de compliance usando IA generativa:
- Extraer requisitos de textos legales
- Proponer borradores de reglas
- Sugerir mappings entre fuentes
- Explicar configuraciones de reglas

**Restricciones regulatorias:**
- IA NO puede aprobar reglas
- IA NO puede decidir cumplimiento legal
- Toda salida de IA requiere revisión humana
- Debe quedar trazabilidad de qué fue generado por IA

## Decision
Implementamos un **Compliance Copilot desacoplado** con provider interface y HITL obligatorio.

### Arquitectura

```
UI → CopilotService → ProviderInterface → [OpenAI|Anthropic|...]
                       ↓
                  NullProvider (graceful degradation)
```

### Provider Interface

```typescript
interface CopilotProvider {
  name: string;
  isAvailable(): boolean;
  extractRequirements(legalText: string): Promise<string>;
  draftRule(requirement: string, context: string): Promise<string>;
  suggestMapping(source: string, target: string): Promise<string>;
  explainRule(ruleConfig: RuleOperatorConfig[]): Promise<string>;
}
```

### Clasificación de Outputs
Toda salida de IA se clasifica como:
- `GENERATED` — Creado completamente por IA
- `DRAFT` — Borrador que requiere revisión

**NUNCA:**
- `APPROVED` — Solo humanos aprueban
- `PUBLISHED` — Solo humanos publican

### Graceful Degradation
Si no hay provider configurado:
- `NullProvider` retorna errores descriptivos
- UI muestra "AI no disponible"
- NO se simulan respuestas de IA
- El sistema funciona normalmente sin AI

### Provenance Tracking
Cada `CopilotRequest` registra:
- `provider` — Qué provider generó la respuesta
- `model` — Qué modelo se usó
- `sessionId` — ID de sesión para correlación
- `classification` — GENERATED/DRAFT
- `createdBy` — Usuario que solicitó

### HITL Workflow
1. Usuario solicita asistencia AI
2. AI genera propuesta (GENERATED/DRAFT)
3. Usuario revisa y edita la propuesta
4. Usuario crea RuleVersion manualmente con contenido revisado
5. RuleVersion pasa por flujo normal (DRAFT → REVIEW → APPROVED)
6. Audit trail registra que la versión fue asistida por AI

## Consequences

### Positivas
- ✅ Asistencia sin comprometer compliance
- ✅ Trazabilidad completa de outputs AI
- ✅ Sin dependencia de un provider específico
- ✅ Funciona sin AI (graceful degradation)
- ✅ HITL garantiza responsabilidad humana

### Negativas
- ⚠️ Sin provider, funciones AI no disponibles
- ⚠️ Requiere configuración de API keys
- ⚠️ Costo de API calls (si se configura)
- ⚠️ Latencia en respuestas AI

### Riesgos Mitigados
- ❌ No hay riesgo de que AI apruebe reglas
- ❌ No hay riesgo de que AI decida compliance
- ❌ No hay riesgo de vendor lock-in (interface desacoplada)
- ❌ No hay riesgo de respuestas simuladas (NullProvider)

## Security Considerations
- API keys en environment variables (nunca en código)
- Rate limiting en endpoints de AI
- Inputs sanitizados antes de enviar a provider
- Outputs validados antes de mostrar al usuario
- Audit log de todas las interacciones con AI

## Future Considerations
- Añadir providers: Anthropic, Google, Azure OpenAI
- Implementar caching de respuestas comunes
- Añadir fine-tuning para dominio regulatorio
- Implementar RAG con knowledge graph regulatorio
- Añadir evaluación automática de calidad de outputs AI
