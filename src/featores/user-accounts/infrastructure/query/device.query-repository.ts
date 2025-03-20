import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity } from '../../domain/device.entity';

@Injectable()
export class DeviceQueryRepository {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
  ) {}
  async getAllSessionsForUser(userId: string): Promise<DeviceViewDto[]> {
    try {
      const devise = await this.deviceRepository.find({ where: { userId } });
      return devise.map(DeviceViewDto.mapToView);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
