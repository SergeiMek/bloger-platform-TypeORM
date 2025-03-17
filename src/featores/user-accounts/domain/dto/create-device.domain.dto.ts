export class CreateDeviceDomainDto {
  ip: string;
  userAgent: string;
  userId: string;
  deviceId: string;
  issuedAt: number;
  expirationDate: number;
}

export class UpdateDeviceDto {
  ip: string;
  newIssuedAt: number;
}
