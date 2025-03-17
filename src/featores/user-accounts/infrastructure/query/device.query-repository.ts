import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class DeviceQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getAllSessionsForUser(userId: string): Promise<DeviceViewDto[]> {
    try {
      const devise = await this.dataSource.query(
        `SELECT * FROM public."Devise"
      WHERE "userId"= $1;`,
        [userId],
      );
      if (!devise) {
        throw NotFoundDomainException.create('device not found');
      }
      return devise.map(DeviceViewDto.mapToView);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
