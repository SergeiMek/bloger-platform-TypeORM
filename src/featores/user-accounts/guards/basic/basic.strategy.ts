import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { UnauthorizedDomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  private readonly validUsername = 'admin';
  private readonly validPassword = 'qwerty';
  constructor() {
    super();
  }
  public validate = async (username, password): Promise<boolean> => {
    if (this.validUsername === username && this.validPassword === password) {
      return true;
    }
    throw UnauthorizedDomainException.create();
  };
}
