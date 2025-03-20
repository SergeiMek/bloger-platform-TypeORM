import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type DeviseDocument = {
  id: string;
  ip: string;
  title: string;
  userId: string;
  deviceId: string;
  lastActiveDate: number;
  expirationDate: number;
};

@Entity('device')
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  userId: string;
  @Column()
  deviceId: string;
  @Column()
  lastActiveDate: number;
  @Column()
  expirationDate: number;
}
