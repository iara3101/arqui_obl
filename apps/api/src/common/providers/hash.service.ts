import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const DEFAULT_ROUNDS = 12;

@Injectable()
export class HashService {
  private readonly rounds = Number(process.env.BCRYPT_ROUNDS ?? DEFAULT_ROUNDS);

  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.rounds);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}

