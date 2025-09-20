# Plan de trabajo (Back → Front → Cloud)

## Fase 1 — Backend local
- **Infra local**: `docker-compose` con `db` (Postgres), `minio` (S3), `mailpit` (SMTP).  
- **Prisma**: `schema.prisma` y migración `init` (Company, User, ApiKey, Account, Contact, Opportunity, StageChange, Attachment).  
- **Auth/Tenancy**: JWT + guard + interceptor + middleware Prisma (scoping por `companyId`).  
- **Módulos**: companies, users (invitaciones), apikeys, accounts, contacts, opportunities, stage-changes, attachments, reports, health, metrics.  
- **OpenAPI/Swagger** y **Postman** con ejemplos.  
- **k6**: script de carga para `/reports/*` con threshold p95 ≤ 300 ms @ 1200 rpm.  
- **Logs**: Pino estructurado (requestId, userId, companyId, path, status, latency).

### Salida esperada
- Contenedores locales funcionando (`docker compose up`).  
- Seed con empresa **ORT** + usuarios admin/member (credenciales de demo).  
- Colección Postman y OpenAPI versionados en `docs/`.  
- Evidencia k6 (capturas/reporte) en `docs/perf/`.

## Fase 2 — Frontend local (Next.js)
- **Auth** (login/cambio de contraseña inicial) y guardas de ruta.  
- **RF7**: Home con oportunidades abiertas (no “Venta/No Venta”), filtros por cuenta/estados, paginación y **gráfico por estado**.  
- **CRUDs** (accounts/contacts/opportunities) y **adjuntos** via presigned URL.  
- **TanStack Query** (cache), **React Hook Form + Zod** (validación).  

### Salida esperada
- App local consumiendo API real; variables `.env.local` con `API_BASE_URL`.

## Fase 3 — Cloud AWS
- **Compute**: ECS Fargate (o Render/Railway como atajo).  
- **DB**: RDS/Aurora PostgreSQL.  
- **Files**: S3 real; **Emails**: SES.  
- **Secrets**: AWS Secrets Manager/SSM.  
- **Observabilidad**: CloudWatch Logs y/o Prometheus/Grafana; tracing con OTel (Tempo/X‑Ray).  
- **CI/CD**: GitHub Actions → build Docker, push ECR, deploy ECS; migraciones Prisma en pipeline.

### Salida esperada
- URIs públicas (API y web), `/health` accesible, `/metrics` scrapeable.  
- Colección Postman actualizada a URLs cloud; dashboard con latencia/rpm/errores.