import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenancyInterceptor } from './tenancy.interceptor';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenancyInterceptor,
    },
  ],
})
export class TenancyModule {}
