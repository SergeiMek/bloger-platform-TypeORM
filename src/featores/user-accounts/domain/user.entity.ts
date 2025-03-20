import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export class UserDocument {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  confirmationCode: string | undefined;
  expirationData: Date | undefined;
  isConfirmed: boolean;
  recoveryCode: string | undefined;
  expirationDateCode: Date | undefined;
  passwordSalt: string;
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  login: string;
  @Column({ unique: true, collation: 'C' })
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
