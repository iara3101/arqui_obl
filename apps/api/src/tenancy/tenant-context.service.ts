import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  companyId?: string;
  userId?: string;
  skipTenant?: boolean;
  requestId?: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  run<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  enter(context: TenantContext) {
    this.storage.enterWith(context);
  }

  patch(context: Partial<TenantContext>) {
    const store = this.storage.getStore();
    if (store) {
      Object.assign(store, context);
    } else {
      this.storage.enterWith({ ...context });
    }
  }

  getContext(): TenantContext | undefined {
    return this.storage.getStore();
  }

  getCompanyId(): string | undefined {
    return this.storage.getStore()?.companyId;
  }

  setCompanyId(companyId?: string) {
    const store = this.storage.getStore();
    if (store) {
      store.companyId = companyId;
    }
  }

  setUserId(userId?: string) {
    const store = this.storage.getStore();
    if (store) {
      store.userId = userId;
    }
  }

  setSkipTenant(skip: boolean) {
    const store = this.storage.getStore();
    if (store) {
      store.skipTenant = skip;
    }
  }
}

