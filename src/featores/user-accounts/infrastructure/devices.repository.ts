import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeviseDocument } from '../domain/device.entity';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  /*  async findOrNotFoundFail(id: string): Promise<DeviseDocument> {
    /!*const device = await this.DeviceModel.findOne({
      deviceId: id,
    });*!/
    const device = null;
    if (!device) {
      throw new NotFoundException('user not found');
    }

    return device;
  }*/

  async createDevise(dto: DeviseDocument) {
    try {
      await this.dataSource.query(`INSERT INTO public."Devise"(
         id, ip, title, "userId", "deviceId", " lastActiveDate", " expirationDate")
      VALUES ('${dto.id}', '${dto.ip}', '${dto.title}', '${dto.userId}', '${dto.deviceId}', '${dto.lastActiveDate}', '${dto.expirationDate}')`);
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }

  async deleteDevice(id: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM public."Devise"
      WHERE "deviceId"= $1;`,
        [id],
      );
      return result[1] === 1;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDevise(
    ip: string,
    deviseId: string,
    issuedAt: number,
  ): Promise<void> {
    try {
      const query = `
      UPDATE public."Devise"
      SET " lastActiveDate" = $1, "ip"=$2
      WHERE "deviceId" = $3
    `;
      const values = [issuedAt, ip, deviseId];
      const result = await this.dataSource.query(query, values);
      return result;
    } catch (error) {
      debugger;
      throw NotFoundDomainException.create(error);
    }
  }

  async findDeviceByDeviceId(deviceId: string): Promise<DeviseDocument | null> {
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM public."Devise"
      WHERE "deviceId"= $1;`,
        [deviceId],
      );
      return result[0];
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAllOldDevices(currentDeviceId: string): Promise<void> {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM public."Devise"
                WHERE "deviceId" <> $1;`,
        [currentDeviceId],
      );
      debugger;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
