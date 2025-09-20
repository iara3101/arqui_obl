#  Contratos de API (v1)


> **Nota**: El contrato se expresará también en OpenAPI (Swagger) en el proyecto. Aquí va un extracto legible.

## Autenticación
- `POST /auth/login`  
  **Body**: `{ email, password, companyId }`  
  **200**: `{ access_token, forcePasswordReset }`

## Gestión de empresas y usuarios
- `POST /companies` (ADMIN) — crear empresa.  
- `POST /users/invitations` (ADMIN) — envía invitación a `{ email }` → email con link único.  
- `POST /users/accept-invitation` — `{ token, password }` → crea usuario y marca `forcePasswordReset=false`.
- `POST /users/change-password` — requiere login.

## API Keys (privado ADMIN)
- `POST /apikeys` — crea una key → **devuelve valor una sola vez** + guarda `hash` y `jti`.  
- `GET /apikeys` — lista sin mostrar secreto (sólo `name`, `created_at`, estado, últimos 4).  
- `DELETE /apikeys/:id` — revoca.

## Cuentas y contactos (privado)
- `POST /accounts` — `{ name }` (único por empresa).  
- `GET /accounts?query=&page=&size=` — listado paginado/filtrable.  
- `PUT /accounts/:id`, `DELETE /accounts/:id`.  
- `POST /contacts`, `GET /contacts`, ...

## Oportunidades y etapas (privado)
- `POST /opportunities` — `{ accountId, title, amount, stage }`.  
- `PUT /opportunities/:id/stage` — `{ newStage, reason }` → registra en `stage_change`.  
- `GET /opportunities` — filtros por estado, cuenta, fecha, paginación.

## Adjuntos (privado)
- `POST /attachments/presign` — `{ opportunityId, filename, contentType }` → `{ url, fields }` (o URL directa) para PUT a MinIO/S3.  
- `POST /attachments/confirm` — para registrar metadatos tras upload exitoso.

## Reports (públicos vía API Key/JWT)
- `GET /reports/top-accounts?limit=3` — Top N cuentas por oportunidades **convertidas en Venta** (período total o `from/to`).  
  **200**: `[{ accountId, accountName, wins, totalAmount }]`
- `GET /reports/stage-changes?stage=Negociación&from=YYYY-MM-DD&to=YYYY-MM-DD`  
  **200**: `[{ opportunityId, newStage, changedAt, changedBy, reason }]`

## Health & Metrics
- `GET /health` — `{ db: up }`
- `GET /metrics` — Prometheus exposition (latencia por endpoint, rpm, tasa de error).

## Errores estándar
- 400 (validación), 401 (no autenticado), 403 (sin permisos/empresa), 404 (no encontrado), 409 (conflicto: únicos), 422 (dominio), 500 (genérico).