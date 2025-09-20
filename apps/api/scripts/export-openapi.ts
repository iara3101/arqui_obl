process.env.PRISMA_SKIP_CONNECT = 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'openapi-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://user:pass@localhost:5432/db?schema=public';
process.env.S3_ACCESS_KEY = process.env.S3_ACCESS_KEY ?? 'dummy';
process.env.S3_SECRET_KEY = process.env.S3_SECRET_KEY ?? 'dummy';
process.env.S3_BUCKET = process.env.S3_BUCKET ?? 'dummy-bucket';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

async function generate() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('CRM SaaS API')
    .setDescription('CRM SaaS backend API documentation')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const docsDir = join(__dirname, '..', '..', '..', 'docs');
  mkdirSync(docsDir, { recursive: true });
  const outputPath = join(docsDir, 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));

  await app.close();

  // eslint-disable-next-line no-console
  console.log(`OpenAPI spec written to ${outputPath}`);
}

generate().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});



