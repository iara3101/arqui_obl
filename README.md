# CRM SaaS Backend

Este repositorio contiene el backend del CRM SaaS construido con NestJS, Fastify y Prisma.

## Requisitos

- Node.js 20+
- pnpm
- Docker y Docker Compose

## Configuración

1. Instalar dependencias:

```bash
pnpm install --filter api
```

2. Copiar `.env.example` en `api/.env` y ajustar valores si es necesario.

3. Levantar servicios auxiliares (PostgreSQL, MinIO, Mailpit) y la API:

```bash
docker compose up --build
```

La API estará disponible en `http://localhost:3000` con documentación Swagger en `http://localhost:3000/docs` y métricas Prometheus en `http://localhost:3000/metrics`.

## Scripts útiles

Dentro del directorio `api/`:

- `pnpm run dev`: ejecuta NestJS en modo desarrollo.
- `pnpm run build`: compila el proyecto.
- `pnpm run openapi:export`: exporta el contrato OpenAPI a `docs/openapi.json`.
- `pnpm run seed`: ejecuta el seed con la empresa ORT y usuarios admin/member.

## Colección Postman

En la carpeta `postman/` se incluye la colección y el environment para interactuar con la API.

## Pruebas de carga (k6)

Ejemplo para ejecutar el escenario de `/reports/top-accounts`:

```bash
BASE_URL=http://localhost:3000 ACCESS_TOKEN="<jwt>" k6 run scripts/k6/top_accounts.js
```

Se valida que el p95 sea menor a 300 ms con una tasa de 1200 rpm.
