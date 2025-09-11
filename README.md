# CRM SaaS

Monorepo para el obligatorio de arquitectura de software. Contiene un backend NestJS y un frontend React.

## Contenido

- `backend/`: API REST construida con [NestJS](https://nestjs.com/).
- `frontend/`: interfaz web creada con [Vite](https://vitejs.dev/) + React.
- `docker-compose.yml`: orquesta base de datos Postgres, backend y frontend.

## Requisitos

- [Docker](https://www.docker.com/) y Docker Compose.
- Node.js 20+ para desarrollo local.

## Puesta en marcha

Clonar el repositorio y ejecutar:

```bash
docker-compose up --build
```

Servicios expuestos:

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Postgres: localhost:5432

## Credenciales de prueba

- Empresa: **ORT**
- Administrador: `admin@saas.com` / `Password1`
- Usuario: `usuario@saas.com` / `Password1`

