import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import bcrypt from 'bcrypt';

import { v4 as uuidv4 } from 'uuid';
import { UsersRepo } from '../infrastructure/users-repo';
import { EmailService } from '../../notifications/email.service';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { add } from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepo,
    private emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, passwordSalt);
    const userLogin = await this.usersRepository.findByLoginOrEmail(dto.login);
    const userEmail = await this.usersRepository.findByLoginOrEmail(dto.email);
    if (userEmail) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'email',
      );
    }
    if (userLogin) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'login',
      );
    }

    const user = {
      // id: uuidv4(),
      login: dto.login,
      email: dto.email,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      confirmationCode: undefined,
      expirationData: undefined,
      isConfirmed: false,
      recoveryCode: undefined,
      expirationDateCode: undefined,
      passwordSalt,
    };
    const result = await this.usersRepository.createUser(user);
    return result.id;
  }
  async deleteUser(id: string) {
    const result = await this.usersRepository.deleteUser(id);
    if (!result) {
      throw NotFoundDomainException.create('id');
    }
  }
  async registerUser(dto: CreateUserDto): Promise<any> {
    const findUserByLogin = await this.usersRepository.findByLoginOrEmail(
      dto.login,
    );
    const findUserByEmail = await this.usersRepository.findByLoginOrEmail(
      dto.email,
    );
    if (findUserByEmail) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'email',
      );
    }
    if (findUserByLogin) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'login',
      );
    }
    const confirmCode = uuidv4();
    const createdUserId = await this.createUser(dto);
    const user = await this.usersRepository.findById(createdUserId);
    const data = add(new Date(), { hours: 1 }).toString();
    await this.usersRepository.updateConfirmationCode(
      confirmCode,
      createdUserId,
      data,
    );
    try {
      await this.emailService.sendRegistrationEmail(dto.email, confirmCode);
    } catch {
      await this.usersRepository.deleteUser(user.id);
      throw BadRequestDomainException.create('letter not sent');
    }
  }
}
