import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor(configService: ConfigService) {
    this.saltRounds = configService.get<number>('auth.passwordSaltRounds', 12);
  }

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
