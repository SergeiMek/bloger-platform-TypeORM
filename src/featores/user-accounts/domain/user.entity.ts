import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export class UserDocument {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  confirmationCode: string | null;
  expirationData: Date | null;
  isConfirmed: boolean;
  recoveryCode: string | null;
  expirationDateCode: Date | null;
  passwordSalt: string;
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  login: string;
  @Column({ unique: true })
  email: string;
  @Column()
  passwordHash: string;
  @Column()
  createdAt: string;
  @Column({ nullable: true })
  confirmationCode: string;
  @Column({ nullable: true })
  expirationData: Date;
  @Column()
  isConfirmed: boolean;
  @Column({ nullable: true })
  recoveryCode: string;
  @Column({ nullable: true })
  expirationDateCode: Date;
  @Column()
  passwordSalt: string;
}
