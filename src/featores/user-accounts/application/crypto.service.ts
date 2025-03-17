import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  async createPasswordHash(
    password: string,
  ): Promise<{ salt: string; hash: string }> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return {
      salt,
      hash,
    };
  }

  async comparePasswords(
    password: string,
    hash: string,
    salt: string,
  ): Promise<boolean> {
    const passwordHash = await bcrypt.hash(password, salt);
    return hash === passwordHash;
  }
}
