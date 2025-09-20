import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { TenantContextService } from '../tenancy/tenant-context.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: ConfigService,
    private readonly tenantContext: TenantContextService,
  ) {
    super({
      datasources: {
        db: { url: configService.getOrThrow<string>('DATABASE_URL') },
      },
      log: configService.get('NODE_ENV') === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });
  }

  getTenantContext() {
    return this.tenantContext.getContext();
  }

  assertTenantAccess(companyId: string | undefined) {
    const ctx = this.tenantContext.getContext();
    if (!ctx?.companyId || (companyId && ctx.companyId !== companyId)) {
      throw new Error('Tenant context mismatch');
    }
    return ctx.companyId;
  }

  scopeWhere<T extends Prisma.Enumerable<Record<string, any>> | Record<string, any> | undefined>(
    where: T,
    companyId: string,
  ) {
    if (!where) {
      return { companyId } as unknown as T;
    }
    if (Array.isArray(where)) {
      return where.map((item) => ({ ...item, companyId })) as T;
    }
    return { AND: [where, { companyId }] } as unknown as T;
  }

  withTenant<T>(companyId: string, callback: () => Promise<T>, options: { userId?: string; skipTenant?: boolean } = {}) {
    return this.tenantContext.run(
      {
        companyId,
        userId: options.userId,
        skipTenant: options.skipTenant,
      },
      callback,
    );
  }

  withoutTenant<T>(callback: () => Promise<T>) {
    return this.tenantContext.run({ skipTenant: true }, callback);
  }

  async onModuleInit() {
    if (process.env.PRISMA_SKIP_CONNECT === "true") {
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    if (process.env.PRISMA_SKIP_CONNECT === "true") {
      return;
    }
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
