# Resumen del proyecto

## Contexto
La startup desea lanzar un **CRM SaaS** (multi‑tenant) que gestione empresas, usuarios, cuentas, contactos, oportunidades con etapas e historial, adjuntos, tablero/resumen y dos endpoints públicos de consulta analítica. El producto debe desplegarse en cloud y demostrar métricas, salud, performance y buenas prácticas.

## Objetivos de la versión 1
1. **Monolito cloud‑native** con API sólida y contratos estables.  
2. **Seguridad y acceso**: autenticación, roles, segregación de datos por empresa.  
3. **Observabilidad**: healthcheck, métricas por endpoint, logs estructurados.  
4. **Performance**: p95 ≤ 300 ms a 1200 req/min en endpoints públicos.  
5. **Portabilidad**: Docker + variables de entorno.  
6. **Despliegue**: instancia en AWS con RDS Postgres, S3, SES (en fase 3).

## Flujo de entregas
1) **Backend local** (con DB, adjuntos, emails simulados, observabilidad, k6).  
2) **Frontend local** (Next.js) consumiendo la API real.  
3) **Cloud AWS** (ECS/ECR o alternativa; RDS, S3, SES, Secrets Manager, CloudWatch).

## Riesgos y mitigaciones
- **Fuga de datos entre empresas** → Guard + middleware Prisma para scoping; tests de integración multi‑tenant.  
- **Diferencias local/cloud (S3/SES)** → MinIO/Mailpit con SDKs oficiales; cambiar sólo ENV en despliegue.  
- **Performance real menor** → k6 local y staging; perf budget p95 con índices, pooling y evitar N+1.  
- **Complejidad en adjuntos** → presigned URLs; tamaño y tipos validados.