import { Global, Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestMailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('mail.host'),
          port: config.get<number>('mail.port'),
          secure: false,
          auth: config.get<string>('mail.user')
            ? {
                user: config.get<string>('mail.user'),
                pass: config.get<string>('mail.pass'),
              }
            : undefined,
        },
        defaults: {
          from: config.get<string>('mail.from'),
        },
      }),
    }),
  ],
  exports: [NestMailerModule],
})
export class MailerModule {}
