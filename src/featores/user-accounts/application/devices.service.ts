import { Injectable } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/devices.repository';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
  UnauthorizedDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { JwtService } from '@nestjs/jwt';
import { CreateDeviceTdo } from '../../bloggers-platform/dto/create-device.tdo';
import { v4 as uuidv4 } from 'uuid';
import { DeviceEntity, DeviseDocument } from '../domain/device.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class DevicesService {
  constructor(
    private devicesRepository: DevicesRepository,
    private jwtService: JwtService,
  ) {}

  async createDevice(dto: CreateDeviceTdo) {
    const newRefreshTokenObj = await this.jwtService.verify(
      dto.newRefreshToken,
    );
    if (!newRefreshTokenObj) {
      throw UnauthorizedDomainException.create();
    }
    const userId = newRefreshTokenObj.id;
    const deviceId = newRefreshTokenObj.deviceId;
    const expirationDate = newRefreshTokenObj.exp;
    const issuedAt = newRefreshTokenObj.iat;
    const deviseDto: DeepPartial<DeviceEntity> = {
      // id: uuidv4(),
      ip: dto.ip,
      title: dto.userAgent,
      userId,
      deviceId,
      lastActiveDate: issuedAt,
      expirationDate: expirationDate,
    };
    await this.devicesRepository.createDevise(deviseDto);
  }
  async findDeviseById(deviseId: string): Promise<DeviseDocument | null> {
    return await this.devicesRepository.findDeviceByDeviceId(deviseId);
  }

  async deleteDeviceById(
    deviceId: string,
    refreshToken: string,
  ): Promise<void> {
    const findDevise = await this.findDeviceByDeviceId(deviceId);
    if (!findDevise) {
      throw NotFoundDomainException.create('device not found');
      //throw UnauthorizedDomainException.create();
    }
    const cookieRefreshTokenObj = await this.jwtService.verify(refreshToken);
    if (!cookieRefreshTokenObj) {
      throw UnauthorizedDomainException.create();
    }
    const deviceUserId = findDevise.userId;
    const cookieUserId = cookieRefreshTokenObj.id;
    if (deviceUserId !== cookieUserId) {
      throw ForbiddenDomainException.create('the device does not belong to yo');
    }
    await this.devicesRepository.deleteDevice(deviceId);
  }

  async findDeviceByDeviceId(deviceId: string): Promise<null | DeviseDocument> {
    return await this.devicesRepository.findDeviceByDeviceId(deviceId);
  }
  async deleteAllOldDevices(currentDeviceToken: string): Promise<void> {
    const cookieRefreshTokenObj =
      await this.jwtService.verify(currentDeviceToken);
    if (!cookieRefreshTokenObj) {
      throw UnauthorizedDomainException.create();
    }
    await this.devicesRepository.deleteAllOldDevices(
      cookieRefreshTokenObj.deviceId,
    );
  }
}
