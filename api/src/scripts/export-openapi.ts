import { writeFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function exportOpenApi() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('CRM SaaS API')
    .setDescription('API documentation for CRM SaaS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const outputPath = join(process.cwd(), '..', 'docs', 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');
  await app.close();
  console.log(`OpenAPI specification written to ${outputPath}`);
}

exportOpenApi().catch((error) => {
  console.error(error);
  process.exit(1);
});
