# CRM SaaS (NestJS + Fastify + Prisma + PostgreSQL)

## Objetivo
Entregar un **CRM SaaS monolítico cloud‑native** con **multi‑tenancy**, cumpliendo RF1–RF9 y RNF (healthcheck, métricas, p95 ≤ 300 ms @ 1200 rpm, logs centralizados, CI, k6). Flujo de trabajo: **Backend local → Frontend local → Cloud (AWS)**.

## Stack
- **Backend**: NestJS + Fastify + Prisma + TypeScript.
- **Base de datos**: PostgreSQL.
- **Almacenamiento de archivos**: MinIO (local) / S3 (AWS).
- **Email**: Mailpit (local) / SES (AWS).
- **Observabilidad**: prom-client en `/metrics` (Prometheus/Grafana o CloudWatch), OpenTelemetry (a integrar en fase Cloud/Staging).
- **Pruebas**: Jest (unitarias), k6 (carga/performance).

## Convenciones y lineamientos
- **Multi‑tenancy**: columna `company_id` en todos los modelos de negocio; scoping a nivel de servicio/ORM.
- **Auth**: JWT con `sub`, `companyId`, `role` (ADMIN/MEMBER). Forzar `forcePasswordReset` en primer login tras invitación.
- **API Keys**: emitir (guardar sólo hash/jti), listar sin secreto, revocar; usar para endpoints públicos.
- **Archivos**: subida por **presigned URL**; servidor **no** sirve archivos binarios directamente.
- **12‑Factor**: todo por variables de entorno; `Dockerfile` + `docker-compose` para local.
- **OpenAPI**: contrato fuente de verdad para el Front y pruebas de contrato.
- **CI**: lint + build + test + coverage threshold + docker build.

## Órdenes típicas para Codex (prompt seeds)
- “Crea módulo NestJS `accounts` con CRUD y scoping por `companyId` usando Prisma.”
- “Agrega `/health` (DB OK) y `/metrics` (prom-client) y publícalos en Nest.”
- “Implementa RF8: endpoint público `GET /reports/top-accounts` (top 3 por ventas), autenticado por API key/JWT.”
- “Implementa RF9: `GET /reports/stage-changes` con filtros `stage` y rango de fechas.”
- “Genera script k6 para `/reports/top-accounts` asegurando p95 ≤ 300 ms @ 1200 rpm.”
- “Configura subida de adjuntos con presigned URL (MinIO local → S3 en cloud).”

## No hacer
- No exponer secretos (JWT, API Keys) en logs ni en respuestas.
- No romper migraciones Prisma (usa nuevas migraciones para cambios).
- No filtrar datos entre empresas (validar `companyId` siempre).

## Checklist vivo (DoD de repo)
- [ ] Prisma schema base + migración `init`
- [ ] Auth + Tenancy guard + middleware Prisma
- [ ] Módulos: `companies`, `users` (invitaciones), `apikeys`, `accounts`, `contacts`, `opportunities`, `stage-changes`, `attachments`, `reports`, `health`, `metrics`
- [ ] Endpoints públicos RF8/RF9
- [ ] OpenAPI + Postman
- [ ] k6 (p95 ≤ 300 ms @ 1200 rpm)
- [ ] Docker local (db, minio, mailpit)

## Apéndice
### Apéndice — Métricas recomendadas
- **HTTP**: requests per minute (por endpoint), duración (histogram), errores.
- **Auth**: logins ok/error, invitaciones enviadas/aceptadas.
- **Negocio**: oportunidades creadas, cambios de etapa por tipo, adjuntos subidos.

### Apéndice — Endpoints para k6 (sugeridos)
- `GET /reports/top-accounts?limit=3`
- `GET /reports/stage-changes?stage=Negociación&from=YYYY-MM-DD&to=YYYY-MM-DD`