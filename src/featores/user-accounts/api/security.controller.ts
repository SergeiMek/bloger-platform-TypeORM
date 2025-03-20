import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DeviceQueryRepository } from '../infrastructure/query/device.query-repository';
import { DeviceViewDto } from './view-dto/device.view-dto';
import { DevicesService } from '../application/devices.service';

@Controller('security')
export class DeviceController {
  constructor(
    private jwtService: JwtService,
    private deviseQueryRepository: DeviceQueryRepository,
    private deviseService: DevicesService,
  ) {}

  @Get('devices')
  @UseGuards(RefreshTokenGuard)
  async getAllSessionsForUser(@Req() req: Request): Promise<DeviceViewDto[]> {
    const refreshToken = req.cookies.refreshToken;
    const cookieRefreshTokeObj = await this.jwtService.verify(refreshToken);
    return this.deviseQueryRepository.getAllSessionsForUser(
      cookieRefreshTokeObj.id,
    );
  }

  @Delete('devices/:deviceId')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById(
    @Req() req: Request,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    await this.deviseService.deleteDeviceById(deviceId, refreshToken);
  }

  @Delete('devices')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAllOldDevices(@Req() req: Request) /*: Promise<void>*/ {
    const cookieRefreshToken = req.cookies.refreshToken;
    return this.deviseService.deleteAllOldDevices(cookieRefreshToken);
  }
}
