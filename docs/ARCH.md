# Arquitectura y decisiones

## Vista de módulos (lógica)
- **auth**: login JWT, force password reset, roles.  
- **tenancy**: extracción de `companyId` del JWT; interceptor para setear contexto en Prisma; middleware global de scoping.
- **companies**: alta y administración de empresa.  
- **users**: invitaciones (token único por email), primer login con cambio de contraseña.  
- **apikeys**: emisión (guardar hash/jti), listados sin secreto, revocación.  
- **accounts / contacts**: CRUD; `Account.name` único por empresa.  
- **opportunities**: etapas predefinidas {Preparación, Presentación, Negociación, Venta, No Venta}, importe, relación con `Account`.  
- **stage-changes**: historial con `old_stage`, `new_stage`, `reason`, `changed_by`, `changed_at`.  
- **attachments**: metadatos en DB, binarios a MinIO/S3 (presigned).  
- **reports**: RF8 (Top 3 cuentas por ventas) y RF9 (Cambios de etapa por rango/etapa).  
- **health / metrics**: `/health` (DB up) y `/metrics` (prom-client).

## Vista C&C (runtime)
- Cliente (Postman/Frontend) → API NestJS (Fastify).  
- API → PostgreSQL (read/write).  
- API → MinIO/S3 para presigned PUT/GET.  
- API → Mailpit/SES para emails de invitación.  
- API → expone `/metrics` para Prometheus.

## Datos y modelo (resumen)
- `company(id, name, created_at)`  
- `user(id, company_id, email, password_hash, role, force_password_reset, created_at)`  
- `api_key(id, company_id, name, jti, hash, created_at, revoked_at)`  
- `account(id, company_id, name, created_at)` (UNIQUE(company_id, name))  
- `contact(id, company_id, account_id, ...)`  
- `opportunity(id, company_id, account_id, title, stage, amount, ...)`  
- `stage_change(id, company_id, opportunity_id, old_stage, new_stage, reason, changed_by, changed_at)`  
- `attachment(id, company_id, opportunity_id, filename, s3_key, content_type, size, uploaded_by, uploaded_at)`

## Decisiones clave (ADR resumido)
- **NestJS + Fastify + Prisma + Postgres**: productividad + rendimiento + tipado fuerte.  
- **Tenancy en servicio/ORM** con `companyId` + opción de RLS si aplica (futuro).  
- **JWT** para sesiones; **API Keys** tipo JWT firmados (mostrar sólo una vez).  
- **Presigned URLs** para adjuntos.  
- **prom‑client** + **Terminus** para métricas y health.  
- **k6** para RNF de rendimiento.  
- **12‑Factor** y Docker para portabilidad.