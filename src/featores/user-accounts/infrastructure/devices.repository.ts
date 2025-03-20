import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeviceEntity, DeviseDocument } from '../domain/device.entity';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Not, Repository } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
  ) {}

  async createDevise(dto: DeepPartial<DeviceEntity>) {
    return await this.deviceRepository.save(dto);
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await this.deviceRepository.delete({ deviceId: id });
    return result.affected !== 0;
  }

  async updateDevise(
    ip: string,
    deviseId: string,
    issuedAt: number,
  ): Promise<void> {
    try {
      await this.deviceRepository.update(
        { deviceId: deviseId },
        {
          lastActiveDate: issuedAt,
          ip,
        },
      );
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }

  async findDeviceByDeviceId(deviceId: string): Promise<DeviseDocument | null> {
    return await this.deviceRepository.findOne({
      where: { deviceId },
    });
  }

  async deleteAllOldDevices(currentDeviceId: string): Promise<void> {
    try {
      await this.deviceRepository.delete({ deviceId: Not(currentDeviceId) });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
