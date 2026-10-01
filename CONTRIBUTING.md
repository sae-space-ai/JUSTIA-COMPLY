# Contributing to JUSTIA COMPLY

## Código de Conducta
Sé respetuoso, constructivo y profesional.

## Proceso de Contribución

### 1. Crear Branch
```bash
git checkout -b feature/nombre-descriptivo
# o
git checkout -b hotfix/descripcion-corta
```

### 2. Desarrollar
- Seguir convenciones de TypeScript
- Escribir tests para nueva funcionalidad
- Documentar decisiones en ADRs si aplica

### 3. Commit
- Commits firmados con GPG (requerido en main)
- Mensajes descriptivos en formato conventional commits
- NO incluir secrets, credenciales o datos reales

### 4. Pull Request
- Crear PR hacia `develop` (o `main` para hotfixes)
- Incluir descripción del cambio
- Link a issues relacionados
- Esperar 2 approvals mínimo
- CI debe pasar (lint, typecheck, tests, build, security)

### 5. Preview
- Vercel genera preview automáticamente
- Verificar funcionalidad en preview URL
- Acceptance tests deben pasar

### 6. Merge
- Solo squash merge a develop
- Solo merge commit a main
- Deploy automático a producción tras merge a main

## Estructura de Commits
```
feat: añadir operador regex al Rule Engine
fix: corregir validación de range con valores negativos
docs: actualizar ADR-007 con nuevos operadores
test: añadir tests boundary para threshold operator
chore: actualizar dependencias
```

## Testing
```bash
# Antes de cada PR
npx vitest run
npm run typecheck
npm run build
```

## Reglas de Oro
1. **Nunca** commitear secrets
2. **Nunca** hacer push directo a main
3. **Nunca** simular datos regulatorios reales
4. **Siempre** marcar datos demo como DEMO
5. **Siempre** registrar audit events para operaciones críticas
6. **Siempre** mantener separación CODE ≠ CONFIG ≠ SECRETS ≠ DATA
