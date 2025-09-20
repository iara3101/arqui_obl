import { getGenerators } from '@prisma/internals';
import type { GeneratorRegistry } from '@prisma/internals';
import { cp, mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

async function main(): Promise<void> {
  const projectRoot = resolve(__dirname, '..');
  const schemaPath = resolve(projectRoot, 'prisma', 'schema.prisma');
  const require = createRequire(__filename);
  const generatorPath = require.resolve('@prisma/client/generator-build');
  const registry: GeneratorRegistry = {
    'prisma-client-js': {
      type: 'rpc',
      generatorPath,
      isNode: true,
    },
  };

  const generators = await getGenerators({
    schemaPath,
    skipDownload: true,
    registry,
  });

  try {
    await Promise.all(generators.map((generator) => generator.generate()));
  } finally {
    generators.forEach((generator) => generator.stop());
  }

  const prismaOutputDir = resolve(projectRoot, 'prisma', '.prisma');
  const nodeModulesPrismaDir = resolve(projectRoot, 'node_modules', '.prisma');

  await rm(nodeModulesPrismaDir, { recursive: true, force: true });
  await mkdir(nodeModulesPrismaDir, { recursive: true });
  await cp(prismaOutputDir, nodeModulesPrismaDir, { recursive: true });

  // eslint-disable-next-line no-console
  console.log(`Prisma Client generated at ${nodeModulesPrismaDir}`);
}

void main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to generate Prisma Client', error);
  process.exit(1);
});
