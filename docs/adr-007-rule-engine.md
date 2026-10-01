# ADR-007: Rule Engine Determinista sin eval()

## Status
Accepted

## Context
Necesitamos un motor de reglas que evalúe compliance contra inputs de usuario. 
Las alternativas consideradas fueron:

1. **eval() / Function()** — Máxima flexibilidad pero inseguro, no auditable
2. **Motor de expresiones externo (e.g., expr-eval)** — Dependencia adicional, superficie de ataque
3. **DSL propio con parser cerrado** — Control total, auditable, limitado pero seguro
4. **Llamadas a servicio externo** — Latencia, dependencia, costo

## Decision
Implementamos un **Rule Engine determinista con DSL propio** (opción 3).

### Operadores Soportados
- `required` — Presencia y no-vacío
- `type` — Verificación de tipo (string, number, boolean, array)
- `range` — Rango numérico [min, max]
- `threshold` — Comparación numérica (gt, gte, lt, lte, eq, neq)
- `equality` — Igualdad de valores
- `enum` — Pertenencia a conjunto
- `formula` — DSL aritmético con parser recursivo propio

### Formula DSL
Parser recursivo descente que soporta:
- Operadores: +, -, *, /
- Paréntesis
- Referencias a variables del input
- Números literales

**NO soporta:**
- Llamadas a funciones
- Asignaciones
- Control flow
- Acceso a objetos/propiedades anidadas
- Eval de código arbitrario

### Restricciones de Ejecución
- Solo `RuleVersion` con status `APPROVED` ejecuta oficialmente
- DRAFT/REVIEW → resultado `REVIEW` (no vinculante)
- RETIRED → no ejecutable
- Cada ejecución genera:
  - Resultado estructurado (PASS/FAIL/REVIEW)
  - Cálculo paso a paso (auditable)
  - Timestamp
  - Referencias a evidencia

### Versionado
- Cada `Rule` tiene múltiples `RuleVersion`
- Versiones son inmutables (append-only)
- Rollback = crear nueva versión o cambiar status a RETIRED
- Provenance obligatorio: legalSourceId + requirementId

## Consequences

### Positivas
- ✅ 100% auditable — cada cálculo es trazable
- ✅ Seguro — sin ejecución arbitraria
- ✅ Reproducible — mismos inputs = mismos outputs
- ✅ Versionable — cada cambio es una nueva versión
- ✅ Rollback controlado — independiente del código

### Negativas
- ⚠️ Limitado a 7 operadores — expresividad reducida
- ⚠️ Formula DSL básico — sin funciones complejas
- ⚠️ Corre en cliente — para reglas muy pesadas, mover a servicio

### Riesgos Mitigados
- ❌ No hay riesgo de inyección de código
- ❌ No hay riesgo de ejecución no autorizada
- ❌ No hay riesgo de resultados no reproducibles

## Rollback Strategy
1. Cambiar status de RuleVersion actual a RETIRED
2. La versión anterior APPROVED sigue disponible
3. O crear nueva versión con correcciones

## Future Considerations
- Añadir operadores: `regex`, `date_range`, `array_contains`
- Mover a servicio dedicado para reglas complejas
- Añadir compilación a bytecode para performance
- Integrar con service externo para fórmulas avanzadas
