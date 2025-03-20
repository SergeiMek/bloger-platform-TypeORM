import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user-accounts/domain/user.entity';
import { DeviceEntity } from '../user-accounts/domain/device.entity';

@Controller('testing')
export class AllDeleteController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
  ) {}
  @Delete('/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async dropDB(): Promise<void> {
    await this.usersRepository.clear();
    await this.deviceRepository.clear();
  }
}
