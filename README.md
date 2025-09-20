# CRM SaaS Backend

NestJS (Fastify) CRM backend with multi-tenancy, Prisma, PostgreSQL, MinIO, Mailpit and JWT/API-key authentication.

## Prerequisites

- Node.js 20+
- pnpm 10 (use `corepack enable pnpm` or `npx pnpm@10.17.0`)
- Docker (for Postgres, MinIO, Mailpit)

## Getting Started

1. Copy the environment example and adjust as needed:

```bash
cp .env.example .env
```

2. Start infrastructure services (Postgres, MinIO, Mailpit):

```bash
docker compose up -d
```

3. Install dependencies and generate Prisma client:

```bash
npx pnpm@10.17.0 install
npx pnpm@10.17.0 prisma:generate
```

4. Run database migrations and seed data:

```bash
npx pnpm@10.17.0 prisma:migrate
npx pnpm@10.17.0 prisma:seed
```

5. Start the API:

```bash
npx pnpm@10.17.0 dev
```

API will be available at `http://localhost:3000`. Swagger UI is served at `http://localhost:3000/docs` and the raw spec can be exported with:

```bash
npx pnpm@10.17.0 openapi:export
```

The resulting file is written to `docs/openapi.json`.

## Seeded Accounts

| Email            | Password   | Role  |
| ---------------- | ---------- | ----- |
| admin@ort.com    | Admin123!  | ADMIN |
| member@ort.com   | Member123! | MEMBER |

These credentials belong to the seeded `ORT` company. Update the `SEED_*` variables in `.env` if different values are required.

## Testing & Quality

- Unit tests: `npx pnpm@10.17.0 test`
- Linting: `npx pnpm@10.17.0 lint`
- k6 performance test for `GET /reports/top-accounts`:

```bash
k6 run scripts/k6/top_accounts.js -e BASE_URL=http://localhost:3000 -e API_KEY=<api-key>
```

The script asserts `p(95) < 300ms` at ~1200 requests per minute.

## Tooling Summary

- **Backend**: NestJS 11 (Fastify adapter)
- **ORM**: Prisma 6 with PostgreSQL
- **Auth**: JWT (Bearer) & API keys (`x-api-key` header)
- **Storage**: MinIO/S3 (presigned uploads for attachments)
- **Mail**: Mailpit (local SMTP)
- **Metrics**: Prometheus (`/metrics`) + pino structured logs
- **OpenAPI**: Swagger UI (`/docs`) + export script (`docs/openapi.json`)
- **Load testing**: k6 script (`scripts/k6/top_accounts.js`)
- **Postman**: Collection & environment under `postman/`

## Useful Commands

| Command | Description |
| ------- | ----------- |
| `npx pnpm@10.17.0 dev` | Start watcher with Fastify |
| `npx pnpm@10.17.0 build` | Compile to `dist/` |
| `npx pnpm@10.17.0 prisma:migrate` | Apply database migrations |
| `npx pnpm@10.17.0 prisma:seed` | Seed ORT company & users |
| `npx pnpm@10.17.0 openapi:export` | Generate `docs/openapi.json` |
| `docker compose up -d` | Start Postgres/MinIO/Mailpit |
| `docker compose down -v` | Stop & remove volumes |

## Security Notes

- API keys are hashed (SHA-256) and only shown once on creation.
- Request logging redacts secrets and includes request IDs.
- Multi-tenancy enforced via explicit scoping (`companyId`) and tenant context.
- Presigned uploads prevent direct file serving from the API.

## Folder Highlights

- `apps/api/src/modules/*` – feature modules (auth, users, accounts, reports, etc.)
- `prisma/` – schema, migrations and seed script
- `postman/` – Postman collection & environment
- `scripts/k6/` – performance testing scripts
- `docs/` – architectural docs & generated OpenAPI (after export)

Enjoy building the CRM SaaS platform!
