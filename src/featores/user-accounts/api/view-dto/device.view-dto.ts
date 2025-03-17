import { DeviseDocument } from '../../domain/device.entity';

export class DeviceViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(device: DeviseDocument): DeviceViewDto {
    const dto = new DeviceViewDto();
    dto.ip = device.ip;
    dto.title = device.title;
    //dto.lastActiveDate = device.lastActiveDate.toString();
    dto.lastActiveDate = new Date(
      device[' lastActiveDate'] * 1000,
    ).toISOString();
    dto.deviceId = device.deviceId;

    return dto;
  }
}
