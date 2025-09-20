import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST', 'localhost');
    const port = this.configService.get<number>('MAIL_PORT', 1025);
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: user
        ? {
            user,
            pass,
          }
        : undefined,
    });
  }

  async sendMail(options: nodemailer.SendMailOptions) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM', 'crm@example.com'),
        ...options,
      });
    } catch (error) {
      this.logger.error('Failed to send mail', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
