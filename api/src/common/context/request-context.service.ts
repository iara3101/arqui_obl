import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from './request-context';

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(
    context: RequestContext,
    callback: () => Promise<T> | T,
  ): Promise<T> | T {
    return this.storage.run(context, callback);
  }

  get(): RequestContext | undefined {
    return this.storage.getStore();
  }

  set(context: Partial<RequestContext>): void {
    const store = this.storage.getStore();
    if (!store) {
      return;
    }
    Object.assign(store, context);
  }
}
