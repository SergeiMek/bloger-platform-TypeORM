import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DevicesService } from '../application/devices.service';
import { UnauthorizedDomainException } from '../../../core/exceptions/domain-exceptions';
import { Request } from 'express';
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private devicesService: DevicesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const cookieRefreshToken = request.cookies.refreshToken;

    if (!cookieRefreshToken) {
      throw UnauthorizedDomainException.create();
    }
    try {
      const cookieRefreshTokenObj = this.jwtService.verify(cookieRefreshToken);
      const deviceId = cookieRefreshTokenObj.deviceId;
      const findDevise = await this.devicesService.findDeviseById(deviceId);
      const cookieRefreshTokenIat = cookieRefreshTokenObj.iat;
      if (!findDevise) {
        throw UnauthorizedDomainException.create();
      }
      if (cookieRefreshTokenIat !== findDevise.lastActiveDate) {
        throw UnauthorizedDomainException.create();
      }
      return true;
    } catch (error) {
      throw UnauthorizedDomainException.create(error);
    }
    return true;
  }
}
